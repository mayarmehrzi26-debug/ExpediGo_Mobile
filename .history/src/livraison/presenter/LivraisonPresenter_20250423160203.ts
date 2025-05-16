import { Livraison } from "../models/LivraisonModel";
import { saveLivraison } from "../services/firebaseService";

export const generateQRCode = (id: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${id}&size=200x200`;

export const createLivraison = async (data: Omit<Livraison, 'qrCodeUrl' | 'createdAt'>) => {
  const newId = Math.floor(Math.random() * 1000000).toString();
  const qrCodeUrl = generateQRCode(newId);

  const livraison: Livraison = {
    ...data,
    id: newId,
    qrCodeUrl,
    createdAt: new Date(),
  };

  await saveLivraison(newId, livraison);
  return livraison;
};
