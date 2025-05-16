import { CaisseModel, Balance, Transaction, WithdrawalRequest } from "./CaisseModel";

export class CaissePresenter {
  private view: CaisseView;

  constructor(view: CaisseView) {
    this.view = view;
  }

  async loadData(): Promise<void> {
    try {
      const [balance, transactions] = await Promise.all([
        CaisseModel.getBalance(),
        CaisseModel.getTransactions()
      ]);
      
      this.view.displayBalance({
        amount: balance.amount.toFixed(3),
        availableAmount: balance.availableAmount.toFixed(3),
        pendingAmount: balance.pendingAmount.toFixed(3),
        currency: balance.currency
      });
      
      this.view.displayTransactions(transactions);
    } catch (error) {
      this.view.showError("Erreur lors du chargement des données");
    }
  }

  async requestWithdrawal(amount: number): Promise<void> {
    try {
      const balance = await CaisseModel.getBalance();
      
      if (amount <= 0) {
        this.view.showError("Le montant doit être supérieur à 0");
        return;
      }
      
      if (amount > balance.availableAmount) {
        this.view.showError("Solde disponible insuffisant");
        return;
      }
      
      await CaisseModel.requestWithdrawal(amount);
      this.view.showSuccess("Demande de versement envoyée");
      this.view.resetWithdrawalForm();
      this.loadData(); // Rafraîchir les données
    } catch (error) {
      this.view.showError("Erreur lors de la demande de versement");
    }
  }
}

export interface CaisseView {
  displayBalance(balance: Omit<Balance, 'amount'> & { amount: string }): void;
  displayTransactions(transactions: Transaction[]): void;
  showError(message: string): void;
  showSuccess(message: string): void;
  resetWithdrawalForm(): void;
}