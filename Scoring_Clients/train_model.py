import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Exemple de données d'entraînement
data = {
    'return_rate': [0.0, 0.05, 0.1, 0.15, 0.5, 0.7, 0.8, 0.9],
    'is_bad_client': [0, 0, 0, 1, 1, 1, 1, 1]
}

df = pd.DataFrame(data)

# Entraîner un modèle uniquement sur 'return_rate'
X = df[['return_rate']]
y = df['is_bad_client']

model = RandomForestClassifier()
model.fit(X, y)

# Sauvegarder le modèle
joblib.dump(model, 'bad_client_model.pkl')

print("✅ Nouveau modèle entraîné et sauvegardé avec succès.")
