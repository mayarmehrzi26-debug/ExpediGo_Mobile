import { Delivery } from "../models/Delivery";
import { DeliveryService } from "../service/DeliveryService";
import { ProductService } from "../services/ProductService";
import { ClientService } from "../services/ClientService";
import { AddressService } from "../services/AddressService";
import { store } from "../redux/store";
import { saveDelivery } from "../redux/actions/deliveryActions";

export class DeliveryPresenter {
  private view: DeliveryView;
  
  constructor(view: DeliveryView) {
    this.view = view;
  }

  async fetchProducts() {
    try {
      const products = await ProductService.fetchProducts();
      this.view.setProducts(products);
    } catch (error) {
      this.view.showError("Erreur lors du chargement des produits");
    }
  }

  async fetchClients() {
    try {
      const clients = await ClientService.fetchClients();
      this.view.setClients(clients);
    } catch (error) {
      this.view.showError("Erreur lors du chargement des clients");
    }
  }

  async fetchAddresses() {
    try {
      const addresses = await AddressService.fetchAddresses();
      this.view.setAddresses(addresses);
    } catch (error) {
      this.view.showError("Erreur lors du chargement des adresses");
    }
  }

  async saveDelivery(delivery: Delivery) {
    try {
      await DeliveryService.saveDelivery(delivery);
      store.dispatch(saveDelivery(delivery));
      this.view.navigateBack();
      this.view.showSuccess("Livraison enregistrée avec succès !");
    } catch (error) {
      this.view.showError("Erreur lors de l'enregistrement de la livraison");
    }
  }

  calculateTotalAmount(quantity: number, price: number): number {
    return quantity * price;
  }
}

export interface DeliveryView {
  setProducts(products: any[]): void;
  setClients(clients: any[]): void;
  setAddresses(addresses: any[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  navigateBack(): void;
}