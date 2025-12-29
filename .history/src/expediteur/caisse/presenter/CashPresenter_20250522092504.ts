import { CashModel, Transaction, WithdrawalRequest } from "../model/CashModel";

export interface CashView {
  displayBalance(balance: {
    total: string;
    disponible: string;
    enAttente: string;
    currency: string;
  }): void;
  displayTransactions(transactions: Transaction[]): void;
  displayWithdrawalRequests(requests: WithdrawalRequest[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  setWithdrawalButtonEnabled(enabled: boolean): void;
  showWithdrawalDialog(maxAmount: number): Promise<{ amount: number; method: "Espèces" | "Virement" }>;
}

export class CashPresenter {
  private view: CashView;
  private model: CashModel;

  constructor(view: CashView, userId: string) {
    this.view = view;
    this.model = new CashModel(userId);
  }

  async loadData(): Promise<void> {
    try {
      const [balance, transactions, requests] = await Promise.all([
        this.model.getBalance(),
        this.model.getTransactions(),
        this.model.getWithdrawalRequests()
      ]);
      
      const hasPendingRequest = await this.model.hasPendingWithdrawal();
      this.view.setWithdrawalButtonEnabled(!hasPendingRequest && balance.disponible > 0);
      
      this.view.displayBalance({
        total: (balance.disponible + balance.enAttente).toFixed(3),
        disponible: balance.disponible.toFixed(3),
        enAttente: balance.enAttente.toFixed(3),
        currency: balance.currency
      });
      
      this.view.displayTransactions(transactions);
      this.view.displayWithdrawalRequests(requests);
    } catch (error) {
      this.view.showError(error.message || "Erreur lors du chargement des données");
    }
  }

  async requestWithdrawal(): Promise<void> {
    try {
      const balance = await this.model.getBalance();
      
      if (balance.disponible <= 0) {
        this.view.showError("Vous n'avez pas de solde disponible");
        return;
      }
      
      const { amount, method } = await this.view.showWithdrawalDialog(balance.disponible);
      
      if (amount <= 0 || amount > balance.disponible) {
        this.view.showError("Montant invalide");
        return;
      }
      
      await this.model.requestWithdrawal(amount, method);
      this.view.showSuccess(`Demande de retrait de ${amount.toFixed(3)} dt envoyée`);
      this.view.setWithdrawalButtonEnabled(false);
      this.loadData();
    } catch (error) {
      if (error.message !== "User cancelled") {
        this.view.showError(error.message);
      }
    }
  }
}