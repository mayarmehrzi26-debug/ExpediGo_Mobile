import { useCallback, useState, useEffect } from "react";
import { createOrder, sizes, fetchAdresses } from "../model/emballage.model";

export const useEmballagePresenter = () => {
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [adresses, setAdresses] = useState<{label: string, value: string}[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loadingAdresses, setLoadingAdresses] = useState(true);

  useEffect(() => {
    const loadAdresses = async () => {
      try {
        const addresses = await fetchAdresses();
        setAdresses(addresses);
      } catch (error) {
        console.error("Failed to load addresses:", error);
      } finally {
        setLoadingAdresses(false);
      }
    };

    loadAdresses();
  }, []);

  const selectedSizeData = sizes.find((size) => size.id === selectedSize);
  const totalPrice = (selectedSizeData?.price * (parseInt(quantity) || 0)) / 1000 || 0;

  const handleQuantityChange = useCallback((text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text);
      setError("");
    }
  }, []);

  const handleOrder = useCallback(async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Veuillez entrer une quantité valide.");
      return false;
    }

    if (!selectedSizeData) {
      setError("Veuillez sélectionner une taille valide.");
      return false;
    }

    if (!selectedAddress) {
      setError("Veuillez sélectionner une adresse.");
      return false;
    }

    try {
      await createOrder({
        size: selectedSizeData.label,
        quantity: parseInt(quantity),
        price: selectedSizeData.price / 1000,
        totalPrice: totalPrice,
        addressId: selectedAddress
      });
      setQuantity("");
      return true;
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de la commande.");
      console.error(err);
      return false;
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
    setSelectedAddress,
    loadingAdresses
  };
};