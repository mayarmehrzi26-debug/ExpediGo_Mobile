// src/models/UserModel.ts
export interface UserModel {
    id?: string;
    email: string;
    role: 'admin' | 'destinataire'| 'livreur'| 'l';
    clientId?: string; // référence vers le client associé
    createdAt: string;
    isActive: boolean;
  }