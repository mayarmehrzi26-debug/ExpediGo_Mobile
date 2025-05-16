import { Ticket, TicketModel } from "../models/TicketModel";

export class TicketListPresenter {
  private view: TicketListView;

  constructor(view: TicketListView) {
    this.view = view;
  }

  async loadTickets(): Promise<void> {
    try {
      const tickets = await TicketModel.fetchTickets();
      this.view.setTickets(tickets);
    } catch (error) {
      this.view.showError("Erreur lors de la récupération des tickets");
    }
  }
}

export interface TicketListView {
  setTickets(tickets: Ticket[]): void;
  showError(message: string): void;
}