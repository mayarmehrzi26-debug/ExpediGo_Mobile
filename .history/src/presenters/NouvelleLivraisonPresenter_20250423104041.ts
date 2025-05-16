export const generateQRCode = (deliveryId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?data=${deliveryId}&size=200x200`;
  };
  
  export const calculateTotalAmount = (price: number, quantity: number) => {
    return price * quantity;
  };
  