import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import messaging
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
    probability = model.predict_proba(X_scaled)[0][1]  # Probabilité d'être un mauvais client
    
    return prediction[0], probability

def move_to_bad_clients(client_id, client_data, probability):
    """Déplace le client dans la collection bad_clients"""
    bad_client_ref = db.collection("bad_clients").document(client_id)
    
    # Ajouter des métadonnées supplémentaires
    client_data['detection_date'] = datetime.now()
    client_data['probability'] = float(probability)
    client_data['original_client_id'] = client_id
    
    bad_client_ref.set(client_data)
    
    # Supprimer de la collection clients si nécessaire (optionnel)
    # db.collection("clients").document(client_id).delete()
    
    print(f"   ➡ Client {client_id} déplacé vers bad_clients")

def send_notification(client_id, probability):
    """Envoie une notification push pour alerter sur un nouveau mauvais client"""
    message = messaging.Message(
        notification=messaging.Notification(
            title='Nouveau mauvais client détecté',
            body=f'Client {client_id} identifié (probabilité: {probability:.0%})'
        ),
        topic='bad_clients_alerts'
    )
    
    try:
        messaging.send(message)
        print(f"   🔔 Notification envoyée pour le client {client_id}")
    except Exception as e:
        print(f"   ❌ Erreur lors de l'envoi de la notification: {e}")

def on_client_snapshot(col_snapshot, changes, read_time):
    print("\n🔔 Changement détecté dans la collection clients")
    client_count = 0
    bad_client_count = 0
    
    for change in changes:
        if change.type.name == 'ADDED' or change.type.name == 'MODIFIED':
            client_data = change.document.to_dict()
            client_id = change.document.id
            
            # Vérifier si le client n'a pas déjà été évalué
            if 'bad_client' not in client_data:
                print(f"\n🔍 Analyse du nouveau client {client_id}...")
                
                try:
                    result, probability = predict_bad_client(client_data)
                    returns = client_data.get('total_returns', 0)
                    deliveries = max(client_data.get('total_deliveries', 1), 1)
                    print(f"   - Taux de retour: {returns}/{deliveries} = {returns/deliveries:.2%}")
                    print(f"   - Probabilité: {probability:.2%}")
                    print(f"   - Prédiction: {'MAUVAIS client' if result == 1 else 'Bon client'}")
                    
                    client_ref = db.collection("clients").document(client_id)
                    if result == 1:
                        bad_client_count += 1
                        client_ref.update({
                            'bad_client': True,
                            'probability': float(probability),
                            'last_check': datetime.now()
                        })
                        print(f"   ⚠️ Client marqué comme mauvais client")
                        
                        # Ajouter à la collection bad_clients
                        move_to_bad_clients(client_id, client_data, probability)
                        
                        # Envoyer une notification
                        send_notification(client_id, probability)
                    else:
                        client_ref.update({
                            'bad_client': False,
                            'probability': float(probability),
                            'last_check': datetime.now()
                        })
                    
                    client_count += 1
                    
                except Exception as e:
                    print(f"   ❌ Erreur avec le client {client_id}: {str(e)}")
    
    if client_count > 0:
        print(f"\n✅ Traitement terminé. {client_count} clients analysés, dont {bad_client_count} mauvais clients détectés.")

def setup_real_time_listener():
    print("👂 Démarrage de l'écoute en temps réel de la collection clients...")
    clients_query = db.collection("clients")
    
    # Créer un écouteur en temps réel
    clients_watch = clients_query.on_snapshot(on_client_snapshot)
    
    return clients_watch

if __name__ == "__main__":
    # Démarrer l'écoute en temps réel
    watch = setup_real_time_listener()
    
    # Garder le script en cours d'exécution
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("\nArrêt de l'écoute en temps réel")