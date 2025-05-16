import { CashModel } from "../model/CashModel";

export class CashPresenter {
  private view: CashView;

  constructor(view: CashView) {
    this.view = view;
  }

  async loadData(): Promise<void> {
    try {
      const [balance, transactions] = await Promise.all([
        CashModel.getBalance(),
        CashModel.getTransactions()
      ]);
      
      this.view.displayBalance(balance);
      this.view.displayTransactions(transactions);
    } catch (error) {
      this.view.showError("Erreur de chargement des données");
    }
  }

  async requestPayment(): Promise<void> {
    try {
      const balance = await CashModel.getBalance();
      
      if (balance.pending > 0) {
        this.view.showError("Une demande est déjà en cours");
        return;
      }

      if (balance.available <= 0) {
        this.view.showError("Solde disponible insuffisant");
        return;
      }

      await CashModel.requestPayment(balance.available);
      this.view.showSuccess("Demande de versement envoyée");
      this.view.updateBalance({ available: 0, pending: balance.available });
    } catch (error) {
      this.view.showError("Échec de la demande de versement");
    }
  }
}

export interface CashView {
  displayBalance(balance: Balance): void;
  displayTransactions(transactions: Transaction[]): void;
  updateBalance(balance: Balance): void;
  showError(message: string): void;
  showSuccess(message: string): void;
}