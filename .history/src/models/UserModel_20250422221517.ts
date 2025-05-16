// src/models/UserModel.ts
export interface UserModel {
  id: string; // Correspond à l'UID Firebase
  email: string;
  role: 'admin' | 'destinataire' | 'livreur'| 'expediteur';
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  isActive: boolean;
}