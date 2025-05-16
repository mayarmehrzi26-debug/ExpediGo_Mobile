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
