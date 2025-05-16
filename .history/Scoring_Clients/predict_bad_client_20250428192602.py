import firebase_admin
from firebase_admin import credentials, firestore
import joblib
import pandas as pd

# Initialisation Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Charger le modèle et le scaler
model = joblib.load('bad_client_model.pkl')
scaler = joblib.load('scaler.pkl')

# Fonction de prédiction
def predict_bad_client(client_data):
    # Préparer les données du client
    df = pd.DataFrame([client_data])
    df['return_rate'] = df['total_returns'] / df['total_deliveries']
    X_new = df[['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent', 'return_rate']]
    X_new_scaled = scaler.transform(X_new)

    # Prédiction
    prediction = model.predict(X_new_scaled)
    return prediction[0]  # 1 pour mauvais client, 0 sinon

# Exemple d'utilisation : récupère les clients depuis Firestore et fait des prédictions
def process_new_clients():
    clients_ref = db.collection("clients")
    clients = clients_ref.stream()
    
    for client in clients:
        client_data = client.to_dict()
        client_data['client_id'] = client.id  # Ajoutez l'ID du client
        
        # Prédire si le client est mauvais
        result = predict_bad_client(client_data)
        
        # Si c'est un mauvais client, ajoutez-le à la collection bad_clients
        if result == 1:
            db.collection("bad_clients").add(client_data)

# Appeler la fonction
process_new_clients()
