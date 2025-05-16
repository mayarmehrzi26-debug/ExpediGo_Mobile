export interface Delivery {
    id: string;
    address: string;
    client: string;
    product: string;
    payment: string;
    isExchange: boolean;
    isFragile: boolean;
    termsAccepted: boolean;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
    status: string;
    qrCodeUrl: string;
  }