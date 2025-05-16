import { CaisseModel, Transaction, WithdrawalRequest } from "../model/";

export interface CaisseView {
  displayBalance(balance: {
    amount: string;
    availableAmount: string;
    pendingAmount: string;
    currency: string;
  }): void;
  displayTransactions(transactions: Transaction[]): void;
  displayWithdrawalRequests(requests: WithdrawalRequest[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  disableWithdrawalButton(): void;
  showPaymentMethodDialog(): Promise<"Espèces" | "Virement">;
}

export class CaissePresenter {
  private view: CaisseView;

  constructor(view: CaisseView) {
    this.view = view;
  }

  async loadData(): Promise<void> {
    try {
      const [balance, transactions, requests] = await Promise.all([
        CaisseModel.getBalance(),
        CaisseModel.getTransactions(),
        CaisseModel.getWithdrawalRequests()
      ]);
      
      const hasPendingRequest = requests.some(r => r.status === 'pending');
      if (hasPendingRequest) {
        this.view.disableWithdrawalButton();
      }
      
      this.view.displayBalance({
        amount: balance.amount.toFixed(3),
        availableAmount: balance.availableAmount.toFixed(3),
        pendingAmount: balance.pendingAmount.toFixed(3),
        currency: balance.currency
      });
      
      this.view.displayTransactions(transactions);
      this.view.displayWithdrawalRequests(requests);
    } catch (error) {
      this.view.showError("Erreur lors du chargement des données");
    }
  }

  async requestPendingWithdrawal(): Promise<void> {
    try {
      const paymentMethod = await this.view.showPaymentMethodDialog();
      const canRequest = await CaisseModel.canRequestWithdrawal();
      
      if (!canRequest) {
        this.view.showError("Vous avez déjà une demande en attente");
        this.view.disableWithdrawalButton();
        return;
      }
      
      await CaisseModel.requestPendingWithdrawal(paymentMethod);
      this.view.showSuccess(`Demande de versement par ${paymentMethod.toLowerCase()} envoyée`);
      this.view.disableWithdrawalButton();
      this.loadData();
    } catch (error) {
      if (error.message !== "User cancelled") {
        this.view.showError(error.message);
      }
    }
  }
}