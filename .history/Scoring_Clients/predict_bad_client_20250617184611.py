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
    """Prédit si un client est mauvais basé sur ses données."""
    # Créer un DataFrame avec les données du client
    df = pd.DataFrame([client_data])
    
    # Remplir les valeurs manquantes avec des valeurs par défaut
    defaults = {
        'total_deliveries': 1,  # Éviter la division par zéro
        'total_returns': 0,
        'delivery_delay_avg': 0,
        'total_spent': 0
    }
    
    for col, default in defaults.items():
        df[col] = df.get(col, default)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(default)
    
    # Calculer le taux de retour
    df['return_rate'] = df['total_returns'] / df['total_deliveries']
    
    # Sélectionner les features dans le bon ordre
    features = ['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent', 'return_rate']
    
    # Normaliser les données
    X_scaled = scaler.transform(df[features])
    
    # Faire la prédiction
    prediction = model.predict(X_scaled)
    probabilities = model.predict_proba(X_scaled)
    
    return {
        'is_bad_client': bool(prediction[0]),  # Convertir en booléen pour plus de clarté
        'probability': float(probabilities[0][1]),  # Probabilité d'être un mauvais client
        'return_rate': float(df['return_rate'].iloc[0]),
        'features': df[features].iloc[0].to_dict()  # Conserver les features utilisées
    }

def update_bad_clients_collection(client_id, client_data, prediction_result):
    """Gère la collection bad_clients en fonction des résultats de prédiction."""
    client_ref = db.collection("clients").document(client_id)
    bad_client_ref = db.collection("bad_clients").document(client_id)
    
    # Vérifier si le client existe déjà dans bad_clients
    existing_bad_client = bad_client_ref.get().exists
    
    # Mettre à jour le statut dans la collection clients
    update_data = {
        'bad_client': prediction_result['is_bad_client'],
        'bad_client_probability': prediction_result['probability'],
        'last_analysis_date': datetime.now(),
        'analysis_features': prediction_result['features']
    }
    client_ref.update(update_data)
    
    if prediction_result['is_bad_client']:
        # Si c'est un mauvais client
        bad_client_data = {
            **client_data,
            **update_data,
            'detection_date': datetime.now(),
            'original_client_ref': client_ref
        }
        
        bad_client_ref.set(bad_client_data)
        print(f"   ⚠️ Client {client_id} marqué comme mauvais client (probabilité: {prediction_result['probability']:.2%})")
    elif existing_bad_client:
        # Si c'est un bon client mais qu'il était dans bad_clients
        bad_client_ref.delete()
        print(f"   ✅ Client {client_id} retiré des mauvais clients")

def on_client_snapshot(col_snapshot, changes, read_time):
    print(f"\n📊 Traitement des modifications des clients à {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    for change in changes:
        if change.type.name in ['ADDED', 'MODIFIED']:
            client_id = change.document.id
            client_data = change.document.to_dict()
            
            print(f"\n🔍 Analyse du client {client_id}...")
            
            try:
                # Faire la prédiction
                result = predict_bad_client(client_data)
                
                # Afficher les informations de débogage
                returns = client_data.get('total_returns', 0)
                deliveries = max(client_data.get('total_deliveries', 1), 1)
                print(f"   - Taux de retour: {returns}/{deliveries} = {result['return_rate']:.2%}")
                print(f"   - Probabilité d'être mauvais client: {result['probability']:.2%}")
                print(f"   - Prédiction: {'MAUVAIS client' if result['is_bad_client'] else 'Bon client'}")
                
                # Mettre à jour les collections clients et bad_clients
                update_bad_clients_collection(client_id, client_data, result)
                
            except Exception as e:
                print(f"   ❌ Erreur avec le client {client_id}: {str(e)}")

def start_realtime_listener():
    print("👂 Démarrage de l'écoute en temps réel des modifications des clients...")
    clients_query = db.collection("clients")
    
    # Watch the collection query
    query_watch = clients_query.on_snapshot(on_client_snapshot)
    
    # Garder le script en cours d'exécution
    import time
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nArrêt de l'écoute en temps réel")

if __name__ == "__main__":
    start_realtime_listener()