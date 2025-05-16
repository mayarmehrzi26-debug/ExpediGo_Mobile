import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os
from pathlib import Path

class FirebaseService:
    def __init__(self):
        current_dir = Path(__file__).parent
        cred_path = current_dir / "serviceAccountKey.json"
        
        if not cred_path.exists():
            raise FileNotFoundError(f"Firebase credentials not found at {cred_path}")

        if not firebase_admin._apps:
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
    
    def create_ticket(self, ticket_data: dict) -> str:
        try:
            ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            ticket_data.update({
                "ticket_id": ticket_id,
                "status": "open",
                "created_at": datetime.now(),
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            
            self.db.collection("tickets").document(ticket_id).set(ticket_data)
            return ticket_id
        except Exception as e:
            raise Exception(f"Failed to create ticket: {str(e)}")
    
    def get_order_status(self, order_number: str) -> dict:
        try:
            # Normalize order number format
            if not order_number.startswith("CMD-"):
                order_number = f"CMD-{order_number}"
                
            doc_ref = self.db.collection("livraisons").document(order_number)
            doc = doc_ref.get()
            
            if doc.exists:
                return {
                    "exists": True,
                    "status": doc.to_dict().get("status", "unknown"),
                    "last_update": doc.to_dict().get("updated_at", "N/A")
                }
            return {"exists": False}
        except Exception as e:
            raise Exception(f"Failed to get order status: {str(e)}")