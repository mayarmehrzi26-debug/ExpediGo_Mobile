// src/models/UserModel.ts
export interface UserModel {
    id?: string;
    email: string;
    role: 'admin' | 'destinataire';
    clientId?: string; // référence vers le client associé
    createdAt: string;
    isActive: boolean;
  }