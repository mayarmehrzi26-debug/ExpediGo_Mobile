import firebase_admin
from firebase_admin import credentials, firestore
import joblib
import pandas as pd
import os

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
    
    return prediction[0]

def process_new_clients():
    clients_ref = db.collection("clients")
    clients = clients_ref.stream()
    
    print(f"📊 Début du traitement des clients...")
    client_count = 0
    bad_client_count = 0
    
    for client in clients:
        client_data = client.to_dict()
        client_id = client.id
        print(f"\n🔍 Analyse du client {client_id}...")
        
        try:
            result = predict_bad_client(client_data)
            print(f"   - Taux de retour: {client_data.get('total_returns', 0)}/{client_data.get('total_deliveries', 1)} = {client_data.get('total_returns', 0)/max(client_data.get('total_deliveries', 1):.2%}")
            print(f"   - Prédiction: {'MAUVAIS client' if result == 1 else 'Bon client'}")
            
            client_ref = db.collection("clients").document(client_id)
            if result == 1:
                bad_client_count += 1
                client_ref.update({'bad_client': True})
                print(f"   ⚠️ Client marqué comme mauvais client")
            else:
                client_ref.update({'bad_client': False})
            
            client_count += 1
            
        except Exception as e:
            print(f"   ❌ Erreur avec le client {client_id}: {str(e)}")
    
    print(f"\n✅ Traitement terminé. {client_count} clients analysés, dont {bad_client_count} mauvais clients détectés.")

if __name__ == "__main__":
    process_new_clients()