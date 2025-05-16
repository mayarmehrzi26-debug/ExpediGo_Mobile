import { setSelectedAddress, setSelectedClient, setSelectedProduct } from '../redux/deliverySlice';

export default class DeliveryPresenter {
  static handleSelectAddress(dispatch: Dispatch, value: string, navigation: any) {
    console.log('Selecting address:', value); // Debug
    if (value === "new_adresse") {
      navigation.navigate("AjoutAdress");
    } else {
      dispatch(setSelectedAddress(value));
    }
  }

  static handleSelectClient(dispatch: Dispatch, value: string, navigation: any) {
    console.log('Selecting client:', value); // Debug
    if (value === "new_client") {
      navigation.navigate("AjoutClientView");
    } else {
      dispatch(setSelectedClient(value));
    }
  }

  static handleSelectProduct(dispatch: Dispatch, value: string, products: any[], navigation: any) {
    console.log('Selecting product:', value); // Debug
    if (value === "new_product") {
      navigation.navigate("AjoutProd");
    } else {
      dispatch(setSelectedProduct(value));
      const selectedProduct = products.find(p => p.value === value);
      if (selectedProduct) {
        dispatch(setProductPrice(selectedProduct.price || 0));
      }
    }
  }
}