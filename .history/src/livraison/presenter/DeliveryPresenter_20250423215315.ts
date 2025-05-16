import { Dispatch } from 'redux';
import DeliveryModel from '..//DeliveryModel';
import { generateQRCode } from './utils';
import {
  setIsExchange,
  setIsFragile,
  setTermsAccepted,
  setSelectedAddress,
  setSelectedClient,
  setSelectedProduct,
  setSelectedPayment,
  setQuantity,
  setProductPrice,
} from './deliverySlice';

export default class DeliveryPresenter {
  static async loadInitialData(dispatch: Dispatch) {
    const [products, clients, adresses, defaultStatus] = await Promise.all([
      DeliveryModel.fetchProducts(),
      DeliveryModel.fetchClients(),
      DeliveryModel.fetchAdresses(),
      DeliveryModel.fetchDefaultStatus(),
    ]);

    return { products, clients, adresses, defaultStatus };
  }

  static handleToggleExchange(dispatch: Dispatch, currentValue: boolean) {
    dispatch(setIsExchange(!currentValue));
  }

  static handleToggleFragile(dispatch: Dispatch, currentValue: boolean) {
    dispatch(setIsFragile(!currentValue));
  }

  static handleTermsAccepted(dispatch: Dispatch, currentValue: boolean) {
    dispatch(setTermsAccepted(!currentValue));
  }

  static handleSelectAddress(dispatch: Dispatch, value: string, navigation: any) {
    if (value === "new_adresse") {
      navigation.navigate("AjoutAdress" as never);
    } else {
      dispatch(setSelectedAddress(value));
    }
  }

  static handleSelectClient(dispatch: Dispatch, value: string, navigation: any) {
    if (value === "new_client") {
      navigation.navigate("AjoutClientView" as never);
    } else {
      dispatch(setSelectedClient(value));
    }
  }

  static handleSelectProduct(
    dispatch: Dispatch,
    value: string,
    products: any[],
    navigation: any
  ) {
    if (value === "new_product") {
      navigation.navigate("AjoutProd" as never);
    } else {
      dispatch(setSelectedProduct(value));
      const selectedProductData = products.find((product) => product.value === value);
      if (selectedProductData) {
        dispatch(setProductPrice(selectedProductData.price || 0));
      }
    }
  }

  static handleQuantityChange(dispatch: Dispatch, newQuantity: number) {
    dispatch(setQuantity(Math.max(1, newQuantity)));
  }

  static handleIncrementQuantity(dispatch: Dispatch, currentQuantity: number) {
    dispatch(setQuantity(currentQuantity + 1));
  }

  static handleDecrementQuantity(dispatch: Dispatch, currentQuantity: number) {
    dispatch(setQuantity(Math.max(1, currentQuantity - 1)));
  }

  static async handleSaveDelivery(
    deliveryState: any,
    navigation: any,
    dispatch: Dispatch
  ) {
    const {
      selectedAddress,
      selectedClient,
      selectedProduct,
      selectedPayment,
      isExchange,
      isFragile,
      termsAccepted,
      quantity,
      totalAmount,
    } = deliveryState;

    if (!selectedAddress || !selectedClient || !selectedProduct || !selectedPayment) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const newId = Math.floor(Math.random() * 1000000).toString();
      const qrCodeUrl = generateQRCode(newId);

      const deliveryData = {
        id: newId,
        address: selectedAddress,
        client: selectedClient,
        product: selectedProduct,
        payment: selectedPayment,
        isExchange,
        isFragile,
        termsAccepted,
        quantity,
        totalAmount,
        createdAt: new Date(),
        status: deliveryState.defaultStatus,
        qrCodeUrl,
      };

      await DeliveryModel.saveDelivery(deliveryData);
      alert("Livraison enregistrée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la livraison : ", error);
      alert("Une erreur s'est produite lors de l'enregistrement de la livraison.");
    }
  }
}