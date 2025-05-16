export interface Livraison {
  id: string;
  client: string;
  product: string;
  address: string;
  status: string;
  createdAt: Date;
  totalAmount: number;
  qrCodeUrl: string;
}
