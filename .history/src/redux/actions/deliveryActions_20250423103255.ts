import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { firebasestore } from '../../../FirebaseConfig';
import {
  CREATE_DELIVERY,
  DeliveryDetails,
  DropdownOption,
  FETCH_ADDRESSES,
  FETCH_CLIENTS,
  FETCH_PRODUCTS,
  FETCH_STATUS
} from '../../types';
export const FETCH_DELIVERY_DETAILS_START = 'FETCH_DELIVERY_DETAILS_START';
export const FETCH_DELIVERY_DETAILS_SUCCESS = 'FETCH_DELIVERY_DETAILS_SUCCESS';
export const FETCH_DELIVERY_DETAILS_FAILURE = 'FETCH_DELIVERY_DETAILS_FAILURE';

export const fetchDeliveryDetailsStart = () => ({
  type: FETCH_DELIVERY_DETAILS_START
});

export const fetchDeliveryDetailsSuccess = (details: DeliveryDetails) => ({
  type: FETCH_DELIVERY_DETAILS_SUCCESS,
  payload: details
});

export const fetchDeliveryDetailsFailure = (error: string) => ({
  type: FETCH_DELIVERY_DETAILS_FAILURE,
  payload: error
});
export const fetchProducts = () => async (dispatch: any) => {
  try {
    const querySnapshot = await getDocs(collection(firebasestore, "products"));
    const productOptions: DropdownOption[] = querySnapshot.docs.map((doc) => ({
      label: doc.data().name,
      value: doc.id,
      image: doc.data().imageUrl,
      price: doc.data().amount,
    }));
    dispatch({ type: FETCH_PRODUCTS, payload: productOptions });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

export const fetchClients = () => async (dispatch: any) => {
  try {
    const querySnapshot = await getDocs(collection(firebasestore, "clients"));
    const clientOptions: DropdownOption[] = querySnapshot.docs.map((doc) => ({
      label: doc.data().name,
      value: doc.id,
    }));
    dispatch({ type: FETCH_CLIENTS, payload: clientOptions });
  } catch (error) {
    console.error("Error fetching clients:", error);
  }
};

export const fetchAddresses = () => async (dispatch: any) => {
  try {
    const querySnapshot = await getDocs(collection(firebasestore, "adresses"));
    const addressOptions = querySnapshot.docs.map((doc) => ({
      label: doc.data().address || 'Adresse sans nom', // Toujours une string
      value: doc.id,
    }));
    dispatch({ type: FETCH_ADDRESSES, payload: addressOptions });
  } catch (error) {
    console.error("Error fetching addresses:", error);
  }
};

export const fetchDefaultStatus = () => async (dispatch: any) => {
  try {
    const statusSnapshot = await getDocs(collection(firebasestore, "Status"));
    if (!statusSnapshot.empty) {
      const firstStatusDoc = statusSnapshot.docs[0];
      const defaultStatus = firstStatusDoc.data().nomStat;
      dispatch({ type: FETCH_STATUS, payload: defaultStatus });
    }
  } catch (error) {
    console.error("Error fetching default status:", error);
  }
};

export const createDelivery = (deliveryData: any) => async (dispatch: any) => {
  try {
    const newId = Math.floor(Math.random() * 1000000).toString();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${newId}&size=200x200`;
    
    const completeDeliveryData = {
      ...deliveryData,
      id: newId,
      qrCodeUrl,
      createdAt: new Date().toISOString() // Convertir en string ISO
    };

    await setDoc(doc(firebasestore, "livraisons", newId), {
      ...completeDeliveryData,
      createdAt: new Date() // Garder comme Date pour Firestore
    });

    dispatch({ 
      type: CREATE_DELIVERY, 
      payload: completeDeliveryData // Déjà sérialisé
    });
    return true;
  } catch (error) {
    console.error("Error creating delivery:", error);
    return false;
  }
  
};