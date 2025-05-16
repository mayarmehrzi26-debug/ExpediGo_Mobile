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
    # Charger le modèle
    model = joblib.load('bad_client_model.pkl')

    # Nettoyer les données reçues
    df = pd.DataFrame([client_data])

    # 🛠️ Remplir les valeurs manquantes par 0
    df['total_returns'] = df.get('total_returns', 0)
    df['total_deliveries'] = df.get('total_deliveries', 1)  # éviter division par 0
    
    # S'assurer que ce sont bien des nombres
    df['total_returns'] = pd.to_numeric(df['total_returns'], errors='coerce').fillna(0)
    df['total_deliveries'] = pd.to_numeric(df['total_deliveries'], errors='coerce').fillna(1)

    # Calcul du taux de retour
    df['return_rate'] = df['total_returns'] / df['total_deliveries']

    # Prédiction
    prediction = model.predict(df[['return_rate']])

    return prediction[0]


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
