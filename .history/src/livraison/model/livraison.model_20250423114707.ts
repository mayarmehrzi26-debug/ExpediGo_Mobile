export interface DropdownOption {
  label: string | JSX.Element;
  value: string;
  image?: string;
  price?: number;
}

export interface DeliveryForm {
  address: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  termsAccepted: boolean;
  quantity: number;
  totalAmount: number;
  status: string | null;
  products: DropdownOption[];
  clients: DropdownOption[];
  adresses: DropdownOption[];
  defaultStatus: string | null;
}

export interface DeliveryFormState {
  form: DeliveryForm;
  isLoading: boolean;
  error: string | null;
}