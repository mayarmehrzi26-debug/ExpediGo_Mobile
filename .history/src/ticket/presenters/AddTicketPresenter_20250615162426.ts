import { Option, Ticket, TicketModel } from "../models/TicketModel";

export class AddTicketPresenter {
  private view: AddTicketView;
  private typeOptions: Option[] = [
    { label: "Standard", value: "Standard" },
    { label: "Retard de livraison", value: "Retard de livraison" },
    { label: "Changer le prix du colis", value: "Changer le prix du colis" },
  ];

  private serviceOptions: Option[] = [
    { label: "Service Commercial", value: "Commercial" },
    { label: "Service Technique", value: "Technique" },
  ];

  constructor(view: AddTicketView) {
    this.view = view;
  }

  async loadBordOptions(): Promise<void> {
    try {
      const orders = await TicketModel.fetchOrderIds();
      this.view.setBordOptions(orders);
    } catch (error) {
      this.view.showError("Erreur lors de la récupération des orderId");
    }
  }

  getTypeOptions(): Option[] {
    return this.typeOptions;
  }

  getServiceOptions(): Option[] {
    return this.serviceOptions;
  }

  validateForm(
    selectedType: string | null,
    selectedBord: string | null,
    titre: string,
    description: string,
    selectedService: string | null
  ): boolean {
    if (!selectedType || !selectedBord) {
      this.view.showError("Veuillez remplir tous les champs obligatoires.");
      return false;
    }

    if (selectedType === "Standard" && (!titre || !description || !selectedService)) {
      this.view.showError("Veuillez remplir tous les champs supplémentaires pour le type Standard.");
      return false;
    }

    return true;
  }
 async fetchTickets(isAdmin: boolean = false): Promise<Ticket[]> {
    try {
      if (isAdmin) {
        return await TicketModel.fetchAllTickets();
      } else {
        return await TicketModel.fetchTickets();
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      this.view.showError("Erreur lors de la récupération des tickets");
      return [];
    }
  }
  async handleAddTicket(
  selectedType: string,
  selectedBord: string,
  titre: string,
  description: string,
  selectedService: string | null,
   imageUrl: string | null,
  refreshTickets?: () => void
): Promise<void> {
  const ticketData: Omit<Ticket, 'id'> = {
    type: selectedType,
    bordereau: selectedBord,
    titre: selectedType === "Standard" ? titre : null,
    description: selectedType === "Standard" ? description : null,
    service: selectedType === "Standard" ? selectedService : null,
    status: "Non traité",
    createdAt: new Date(),
    imageUrl: selectedType === "Retard de livraison" ? image : null,
  };
    try {
      await TicketModel.addTicket(ticketData);
      this.view.showSuccess("Ticket ajouté avec succès !");
      this.view.resetForm();
      if (refreshTickets) refreshTickets();
    } catch (error) {
      console.error("Erreur lors de l'ajout du ticket :", error);
      this.view.showError("Une erreur s'est produite.");
    }
  }
}

export interface AddTicketView {
  setBordOptions(options: Option[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  resetForm(): void;
}