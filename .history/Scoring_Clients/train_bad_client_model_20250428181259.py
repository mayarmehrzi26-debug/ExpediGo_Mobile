import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

# Exemple de données collectées
data = {
    'total_deliveries': [50, 30, 80, 45, 60],
    'total_returns': [5, 1, 10, 3, 2],
    'delivery_delay_avg': [2, 3, 5, 4, 2],
    'total_spent': [1000, 500, 1200, 800, 1100],
    'is_bad_client': [1, 0, 1, 0, 0]  # 1 si mauvais client, 0 sinon
}

df = pd.DataFrame(data)

# Calcul du taux de retour
df['return_rate'] = df['total_returns'] / df['total_deliveries']

# Séparer les caractéristiques et l'étiquette
X = df[['total_deliveries', 'total_returns', 'delivery_delay_avg', 'total_spent', 'return_rate']]
y = df['is_bad_client']

# Diviser les données en ensemble d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Normalisation des données
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Entraînement du modèle
model = RandomForestClassifier(random_state=42)
model.fit(X_train_scaled, y_train)

# Enregistrer le modèle
joblib.dump(model, 'bad_client_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
