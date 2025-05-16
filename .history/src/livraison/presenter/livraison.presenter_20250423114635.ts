import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { 
  fetchProducts, 
  fetchClients, 
  fetchAdresses, 
  fetchDefaultStatus,
  saveDelivery 
} from "../service/livraison.service";
import { 
  setDeliveryField, 
  setProducts, 
  setClients, 
  setAdresses, 
  setDefaultStatus 
} from "../store/livraison.actions";
import { 
  selectDeliveryForm,
  selectProducts,
  selectClients,
  selectAdresses,
  selectIsLoading
} from "../store/livraison.selectors";
import { useEffect, useState } from "react";

export const useLivraisonPresenter = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useSelector(selectDeliveryForm);
  const products = useSelector(selectProducts);
  const clients = useSelector(selectClients);
  const adresses = useSelector(selectAdresses);
  const reduxLoading = useSelector(selectIsLoading);
  const isLoading = localLoading || reduxLoading;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLocalLoading(true);
        setError(null);
        
        const [productsData, clientsData, adressesData, defaultStatus] = await Promise.all([
          fetchProducts(),
          fetchClients(),
          fetchAdresses(),
          fetchDefaultStatus()
        ]);
        
        dispatch(setProducts(productsData));
        dispatch(setClients(clientsData));
        dispatch(setAdresses(adressesData));
        dispatch(setDefaultStatus(defaultStatus));
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error("Loading error:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  const handleFieldChange = (field: string, value: any) => {
    dispatch(setDeliveryField({ field, value }));
  };

  const handleSaveDelivery = async () => {
    if (!form.address || !form.client || !form.product || !form.payment) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLocalLoading(true);
      setError(null);
      
      await saveDelivery({
        ...form,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?data=${Math.floor(Math.random() * 1000000)}&size=200x200`,
      });

      navigation.goBack();
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
      console.error("Save error:", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    isLoading,
    error,
    form,
    products,
    clients,
    adresses,
    handleFieldChange,
    handleSaveDelivery,
  };
};