import { CaisseModel, Transaction, WithdrawalRequest } from "../model/CashModel";

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
      
      // Vérifier s'il y a une demande en attente
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
      const canRequest = await CaisseModel.canRequestWithdrawal();
      
      if (!canRequest) {
        this.view.showError("Vous avez déjà une demande en attente");
        this.view.disableWithdrawalButton();
        return;
      }
      
      await CaisseModel.requestPendingWithdrawal();
      this.view.showSuccess("Demande de versement envoyée");
      this.view.disableWithdrawalButton();
      this.loadData();
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}