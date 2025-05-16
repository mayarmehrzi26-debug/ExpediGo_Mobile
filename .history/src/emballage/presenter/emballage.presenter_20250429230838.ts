import { useCallback, useEffect, useState } from "react";
import { createOrder, fetchAdresses, sizes } from "../model/emballage.model";

export const useEmballagePresenter = () => {
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [adresses, setAdresses] = useState<DropdownOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState({
    addresses: true,
    submission: false
  });

  const refreshAddresses = useCallback(async () => {
    setLoading(prev => ({ ...prev, addresses: true }));
    try {
      const addresses = await fetchAdresses();
      setAdresses(addresses);
      if (addresses.length > 0 && !selectedAddress) {
        setSelectedAddress(addresses[0].value);
      }
    } catch (err) {
      setError("Erreur de chargement des adresses");
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }));
    }
  }, [selectedAddress]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const selectedSizeData = sizes.find(size => size.id === selectedSize);
  const totalPrice = (selectedSizeData?.price * (parseInt(quantity) || 0)) / 1000 || 0;

  const handleQuantityChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text);
      setError("");
    }
  }, []);

  const handleAddressSelect = useCallback((value: string) => {
    if (value === "new_address") {
      // Navigation gérée dans le composant
      return;
    }
    setSelectedAddress(value);
  }, []);

  const handleOrder = useCallback(async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Quantité invalide");
      return false;
    }

    if (!selectedSizeData) {
      setError("Taille non sélectionnée");
      return false;
    }

    if (!selectedAddress) {
      setError("Adresse non sélectionnée");
      return false;
    }

    setLoading(prev => ({ ...prev, submission: true }));
    setError("");

    try {
      const { orderNumber } = await createOrder({
        size: selectedSizeData.label,
        quantity: parseInt(quantity),
        price: selectedSizeData.price / 1000,
        totalPrice: totalPrice,
        addressId: selectedAddress
      });
      
      return { success: true, orderNumber };
    } catch (err) {
      setError(err.message || "Erreur lors de la commande");
      return { success: false };
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  }, [quantity, selectedSizeData, totalPrice, selectedAddress]);


  return {
    sizes,
    selectedSize,
    setSelectedSize,
    quantity,
    handleQuantityChange,
    selectedSizeData,
    totalPrice,
    handleOrder,
    error,
    adresses,
    selectedAddress,
    handleAddressSelect,
    loading,
    refreshAddresses
  };
};