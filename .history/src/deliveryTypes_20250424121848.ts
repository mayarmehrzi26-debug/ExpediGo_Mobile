export interface Delivery {
    id: string;
    client: string;
    product: string;
    address: string;
    status: 'En cours' | 'Livré' | 'Picked' | 'Retour' | 'Échange';
    createdAt: Date;
    totalAmount: number;
    qrCodeUrl?: string;
  }
  
  export interface eliveryCardProps {
    delivery: Delivery;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onViewDetails: (id: string) => void;
    onEditPickup: () => void;
  }
  
  export type DeliveryFilterOption = 'Toutes' | 'Livrés' | 'Retours' | 'Échanges';