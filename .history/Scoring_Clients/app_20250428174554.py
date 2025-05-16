from firebase_admin import firestore

def add_client_to_firestore(client_id, retours, livraisons):
    db = firestore.client()
    client_ref = db.collection('clients').document(client_id)
    client_ref.set({
        "client_id": client_id,
        "retours": retours,
        "livraisons": livraisons,
        "score_fiabilite": 0.0,
        "is_bad_customer": False
    })
def calculate_customer_score(client_id: str):
    db = firestore.client()
    client_ref = db.collection("clients").document(client_id)
    client_doc = client_ref.get()
    
    if client_doc.exists:
        client_data = client_doc.to_dict()
        
        retours = client_data["retours"]
        livraisons = client_data["livraisons"]
        
        # Score de base : moins de retours est meilleur
        score = 1 - (retours / max(livraisons, 1))  # Eviter la division par zéro
        
        # Si plus d'un retour, le client est un mauvais client
        is_bad_customer = retours > 1
        
        # Mettre à jour le score et le statut "mauvais client" dans Firestore
        client_ref.update({
            "score_fiabilite": score,
            "is_bad_customer": is_bad_customer
        })
        
        return score, is_bad_customer
    return None, None
def update_all_customer_scores():
    db = firestore.client()
    clients_ref = db.collection('clients')
    clients = clients_ref.stream()
    
    for client in clients:
        client_data = client.to_dict()
        client_id = client.id
        score, is_bad_customer = calculate_customer_score(client_id)
        print(f"Client {client_id}: Score {score}, Bad Customer: {is_bad_customer}")
