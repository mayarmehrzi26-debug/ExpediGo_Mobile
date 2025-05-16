import { useState } from "react";
import { EmballageModel, sizes } from "../model/emballage.model";

export class EmballagePresenter {
  private model: EmballageModel;

  constructor() {
    this.model = new EmballageModel();
  }

  async createOrder(
    size: string,
    quantity: number,
    price: number,
    totalPrice: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!size || quantity <= 0) {
        return { success: false, message: "Veuillez remplir tous les champs" };
      }

      const orderData = {
        size,
        quantity,
        price,
        totalPrice,
        status: "non traité" as const
      };

      await this.model.createOrder(orderData);
      return { success: true, message: "Commande créée avec succès" };
    } catch (error) {
      console.error("Erreur création commande:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  }

  getUserOrders(userId: string, callback: (orders: EmballageOrder[]) => void) {
    return this.model.getUserOrders(userId, callback);
  }

  async updateOrderStatus(
    orderId: string,
    status: EmballageOrder['status']
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.model.updateOrderStatus(orderId, status);
      return { success: true, message: "Statut mis à jour" };
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue"
      };
    }
  }
}

// Hook React pour les composants
export const useEmballagePresenter = () => {
  const [presenter] = useState(() => new EmballagePresenter());
  const [selectedSize, setSelectedSize] = useState("petit");
  const [quantity, setQuantity] = useState("");

  const selectedSizeData = sizes.find((size) => size.id === selectedSize);
  const totalPrice = (selectedSizeData?.price * (parseInt(quantity) || 0)) / 1000 || 0;

  const handleQuantityChange = (text: string) => {
    if (/^\d*$/.test(text)) {
      setQuantity(text);
    }
  };

  return {
    sizes,
    selectedSize,
    setSelectedSize,
    quantity,
    handleQuantityChange,
    selectedSizeData,
    totalPrice,
    createOrder: presenter.createOrder.bind(presenter),
    getUserOrders: presenter.getUserOrders.bind(presenter),
    updateOrderStatus: presenter.updateOrderStatus.bind(presenter)
  };
};