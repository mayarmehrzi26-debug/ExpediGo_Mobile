export interface DropdownOption {
    label: string | JSX.Element;
    value: string;
    image?: string;
    price?: number;
  }
  
  export interface CustomDropdownProps {
    options?: DropdownOption[];
    placeholder: string;
    onSelect: (value: string) => void;
    selectedValue?: string;
  }
  
  export interface CustomCheckboxProps {
    checked: boolean;
    onToggle: () => void;
    label?: string;
  }
  
  export interface CustomToggleProps {
    isEnabled: boolean;
    onToggle: () => void;
    label: string;
  }
  
  export interface DeliveryData {
    id: string;
    address: string;
    client: string;
    product:string,
    payment: string;
    isExchange: boolean;
    isFragile: boolean;
    termsAccepted: boolean;
    quantity: number;
    totalAmount: number;
    createdAt: Date;
    status: string | null;
    qrCodeUrl: string;
    createdBy: string; 
    
  }