from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import os
import time

app = Flask(__name__)
CORS(app)

# Configuration Firebase
def initialize_firebase():
    try:
        cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as e:
        print(f"Erreur initialisation Firebase: {str(e)}")
        raise

db = initialize_firebase()

# Configuration Rasa - utiliser l'adresse IP du serveur Rasa si différent
RASA_URL = "http://localhost:5005/webhooks/rest/webhook"  # Modifier si nécessaire
MAX_RETRIES = 3
RETRY_DELAY = 1

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"reply": "Format de requête invalide."}), 400
            
        user_message = data['message']
        
        if not user_message or not user_message.strip():
            return jsonify({"reply": "Message vide reçu."}), 400

        # Journalisation
        print(f"Message reçu: {user_message}")

        # Tentative avec reprise
        for attempt in range(MAX_RETRIES):
            try:
                response = requests.post(
                    RASA_URL,
                    json={"sender": "user", "message": user_message},
                    timeout=10
                )
                response.raise_for_status()
                
                response_data = response.json()
                print(f"Réponse Rasa: {response_data}")

                # Traitement de la réponse Rasa
                bot_reply = ""
                if response_data and isinstance(response_data, list):
                    for resp in response_data:
                        if 'text' in resp:
                            bot_reply += resp['text'] + "\n"
                        elif 'image' in resp:
                            bot_reply += f"[Image: {resp['image']}]\n"
                
                bot_reply = bot_reply.strip() or "Je n'ai pas compris votre demande."

                # Sauvegarde dans Firestore
                try:
                    chat_ref = db.collection('chat_messages').document()
                    chat_ref.set({
                        'user_id': user_id,
                        'user_message': user_message,
                        'bot_reply': bot_reply,
                        'timestamp': firestore.SERVER_TIMESTAMP
                    })
                except Exception as firestore_error:
                    print(f"Erreur Firestore: {firestore_error}")
                    # On continue même si Firestore échoue

                return jsonify({"reply": bot_reply})

            except requests.exceptions.RequestException as e:
                print(f"Tentative {attempt + 1} échouée: {str(e)}")
                if attempt == MAX_RETRIES - 1:
                    return jsonify({"reply": "Désolé, le service de chat est temporairement indisponible."}), 503
                time.sleep(RETRY_DELAY)
                
    except Exception as e:
        print(f"Erreur inattendue: {str(e)}")
        return jsonify({"reply": "Une erreur interne est survenue."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)