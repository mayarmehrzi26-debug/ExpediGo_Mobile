import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin.firestore import client as firestore_client
import joblib
import pandas as pd
import os
from datetime import datetime

# Initialisation Firebase
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, "serviceAccountKey.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Charger le modèle et le scaler
model = joblib.load('bad_client_model.pkl')
scaler = joblib.load('scaler.pkl')
def predict_bad_client(client_data):
    # Créer un DataFrame avec les données du client
    df = pd.DataFrame([client_data])
    
    # Remplir les valeurs manquantes avec des valeurs par défaut
    defaults = {
        'total_deliveries': 1,
        'total_returns': 0,
        'delivery_delay_avg': 0,
        'total_spent': 0
    }
    
    for col, default in defaults.items():
        df[col] = df.get(col, default)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(default)
    
    # Calculer le taux de retour
    df['return_rate'] = df['total_returns'] / df['total_deliveries']
    
    # Sélectionner les features
    features = ['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent', 'return_rate']
    
    # Normaliser les données
    X_scaled = scaler.transform(df[features])
    
    # Faire la prédiction
    prediction = model.predict(X_scaled)
    probabilities = model.predict_proba(X_scaled)
    
    return {
        'prediction': bool(prediction[0]),  # Conversion en bool Python
        'probability': float(probabilities[0][1]),
        'return_rate': float(df['return_rate'].iloc[0])
    }

def on_client_snapshot(col_snapshot, changes, read_time):
    print(f"\n📊 Traitement des modifications à {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    for change in changes:
        if change.type.name in ['ADDED', 'MODIFIED']:
            client_id = change.document.id
            client_data = change.document.to_dict()
            
            print(f"\n🔍 Analyse du client {client_id}...")
            
            try:
                result = predict_bad_client(client_data)
                returns = client_data.get('total_returns', 0)
                deliveries = max(client_data.get('total_deliveries', 1), 1)
                
                print(f"   - Taux de retour: {returns}/{deliveries} = {result['return_rate']:.2%}")
                print(f"   - Probabilité: {result['probability']:.2%}")
                print(f"   - Prédiction: {'MAUVAIS client' if result['prediction'] else 'Bon client'}")
                
                # Mise à jour avec conversion explicite des types
                client_ref = db.collection("clients").document(client_id)
                update_data = {
                    'bad_client': bool(result['prediction']),
                    'bad_client_probability': result['probability'],
                    'last_analysis_date': datetime.now()
                }
                
                client_ref.update(update_data)
                
                # Gestion de la collection bad_clients
                bad_client_ref = db.collection("bad_clients").document(client_id)
                if result['prediction']:
                    if not bad_client_ref.get().exists:
                        bad_client_data = client_data.copy()
                        bad_client_data.update({
                            'detection_date': datetime.now(),
                            'probability': result['probability']
                        })
                        bad_client_ref.set(bad_client_data)
                        print("   ⚠️ Ajouté à bad_clients")
                else:
                    if bad_client_ref.get().exists:
                        bad_client_ref.delete()
                        print("   ✅ Retiré de bad_clients")
                        
            except Exception as e:
                print(f"   ❌ Erreur avec le client {client_id}: {str(e)}")