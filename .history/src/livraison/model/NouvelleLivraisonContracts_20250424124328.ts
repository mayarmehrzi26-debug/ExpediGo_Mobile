import { DropdownOption } from "../model/entities/Livraison";

export interface INouvelleLivraisonView {
  setProducts: (products: DropdownOption[]) => void;
  setClients: (clients: DropdownOption[]) => void;
  setAddress: (adresses: DropdownOption[]) => void;
  setDefaultStatus: (status: string | null) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  navigateBack: () => void;
}

export interface INouvelleLivraisonPresenter {
  loadInitialData(): Promise<void>;
  saveDelivery(
    selectedAddress: string | null,
    selectedClient: string | null,
    selectedProduct: string | null,
    selectedPayment: string | null,
    isExchange: boolean,
    isFragile: boolean,
    termsAccepted: boolean,
    quantity: number,
    totalAmount: number
  ): Promise<void>;
  calculateTotalAmount(quantity: number, productId: string | null): number;
}