import { useCallback, useState } from "react";
import { createOrder, sizes } from "../model/emballage.model";

export const useEmballagePresenter = () => {
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

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

    try {
      await createOrder({
        size: selectedSizeData.label,
        quantity: parseInt(quantity),
        price: selectedSizeData.price / 1000,
        totalPrice: totalPrice,
      });
      setQuantity("");
      return true;
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la commande.");
      console.error(err);
      return false;
    }
  }, [quantity, selectedSizeData, totalPrice]);

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
  };
};