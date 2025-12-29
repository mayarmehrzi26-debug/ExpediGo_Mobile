import { Ticket, TicketModel } from "../models/TicketModel";

export class TicketListPresenter {
  private view: TicketListView;
  private isAdmin: boolean;

  constructor(view: TicketListView, isAdmin: boolean = false) {
    this.view = view;
    this.isAdmin = isAdmin;
  }

  async loadTickets(): Promise<void> {
    try {
      const tickets = await TicketModel.fetchTickets(this.isAdmin);
      this.view.setTickets(tickets);
    } catch (error) {
      this.view.showError("Failed to load tickets");
      console.error(error);
    }
  }
}

export interface TicketListView {
  setTickets(tickets: Ticket[]): void;
  showError(message: string): void;
  showImage(imageUrl: string): void;
}