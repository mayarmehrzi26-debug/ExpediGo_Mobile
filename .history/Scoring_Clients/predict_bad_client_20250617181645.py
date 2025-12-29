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
    
    for client in clients:
        client_data = client.to_dict()
        client_data['client_id'] = client.id
        
        try:
            result = predict_bad_client(client_data)
            
            client_ref = db.collection("clients").document(client.id)
            if result == 1:
                client_ref.update({'bad_client': True, 'last_check': firestore.SERVER_TIMESTAMP})
                # Ajouter aux mauvais clients si pas déjà présent
                bad_clients_ref = db.collection("bad_clients")
                if not bad_clients_ref.where('client_id', '==', client.id).get():
                    client_data['detection_date'] = firestore.SERVER_TIMESTAMP
                    bad_clients_ref.add(client_data)
            else:
                client_ref.update({'bad_client': False, 'last_check': firestore.SERVER_TIMESTAMP})
                
        except Exception as e:
            print(f"Erreur avec le client {client.id}: {str(e)}")

if __name__ == "__main__":
    process_new_clients()