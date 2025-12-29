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

# Dictionnaire pour suivre les derniers états des clients
last_client_states = {}

def predict_bad_client(client_data):
    """Prédit si un client est mauvais basé sur ses données."""
    df = pd.DataFrame([client_data])
    
    defaults = {
        'total_deliveries': 1,
        'total_returns': 0,
        'delivery_delay_avg': 0,
        'total_spent': 0
    }
    
    for col, default in defaults.items():
        df[col] = df.get(col, default)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(default)
    
    df['return_rate'] = df['total_returns'] / df['total_deliveries']
    features = ['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent', 'return_rate']
    
    X_scaled = scaler.transform(df[features])
    prediction = model.predict(X_scaled)
    probabilities = model.predict_proba(X_scaled)
    
    return {
        'is_bad_client': bool(prediction[0]),
        'probability': float(probabilities[0][1]),
        'return_rate': float(df['return_rate'].iloc[0]),
        'features': df[features].iloc[0].to_dict()
    }

def has_client_changed(client_id, current_data):
    """Vérifie si les données du client ont vraiment changé."""
    if client_id not in last_client_states:
        return True
    
    # Comparaison des champs pertinents
    relevant_fields = ['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent']
    for field in relevant_fields:
        if last_client_states[client_id].get(field) != current_data.get(field):
            return True
    
    return False

def update_bad_clients_collection(client_id, client_data, prediction_result):
    """Gère la collection bad_clients."""
    client_ref = db.collection("clients").document(client_id)
    bad_client_ref = db.collection("bad_clients").document(client_id)
    
    # Mise à jour de l'état dans last_client_states
    last_client_states[client_id] = client_data.copy()
    
    update_data = {
        'bad_client': prediction_result['is_bad_client'],
        'bad_client_probability': prediction_result['probability'],
        'last_analysis_date': datetime.now(),
        'analysis_features': prediction_result['features']
    }
    
    # Mise à jour conditionnelle pour éviter les boucles infinies
    if client_data.get('bad_client') != prediction_result['is_bad_client'] or \
       abs(client_data.get('bad_client_probability', 0) - prediction_result['probability']) > 0.01:
        client_ref.update(update_data)
    
    if prediction_result['is_bad_client']:
        bad_client_data = {
            **client_data,
            **update_data,
            'detection_date': datetime.now(),
            'original_client_ref': client_ref
        }
        bad_client_ref.set(bad_client_data)
        print(f"   ⚠️ Client {client_id} marqué comme mauvais (prob: {prediction_result['probability']:.2%})")
    elif bad_client_ref.get().exists:
        bad_client_ref.delete()
        print(f"   ✅ Client {client_id} retiré des mauvais clients")

def on_client_snapshot(col_snapshot, changes, read_time):
    print(f"\n📊 Traitement des modifications à {datetime.now().strftime('%H:%M:%S')}")
    
    for change in changes:
        if change.type.name in ['ADDED', 'MODIFIED']:
            client_id = change.document.id
            client_data = change.document.to_dict()
            
            if not has_client_changed(client_id, client_data):
                continue
                
            print(f"\n🔍 Analyse du client {client_id}...")
            
            try:
                result = predict_bad_client(client_data)
                print(f"   - Retours: {client_data.get('total_returns', 0)}/{client_data.get('total_deliveries', 1)}")
                print(f"   - Probabilité: {result['probability']:.2%}")
                
                update_bad_clients_collection(client_id, client_data, result)
                
            except Exception as e:
                print(f"   ❌ Erreur avec {client_id}: {str(e)}")

def start_realtime_listener():
    print("👂 Démarrage de l'écouteur Firestore (un seul traitement par changement)")
    clients_query = db.collection("clients")
    
    # Initialisation des états actuels
    docs = clients_query.stream()
    for doc in docs:
        last_client_states[doc.id] = doc.to_dict()
    
    # Configuration de l'écouteur
    query_watch = clients_query.on_snapshot(on_client_snapshot)
    
    import time
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Écouteur arrêté")

if __name__ == "__main__":
    start_realtime_listener()