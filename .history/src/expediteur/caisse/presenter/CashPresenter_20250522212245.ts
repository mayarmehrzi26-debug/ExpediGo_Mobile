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
    displayPendingTransactions(transactions: PendingTransaction[]): void;
  showTransactionSelectionDialog(transactions: PendingTransaction[]): Promise<string[]>;

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

   async requestWithdrawal(amount: number): Promise<void> {
    try {
      const balance = await this.model.getBalance();
      
      // Vérifier qu'il y a bien un solde en attente
      if (balance.enAttente <= 0) {
        this.view.showError("Vous n'avez pas de solde en attente");
        return;
      }
      
      // Demander la méthode de versement
      const { method } = await this.view.showWithdrawalDialog(balance.enAttente);
      
      // Créer la demande de versement
      await this.model.requestWithdrawal(amount, method);
      
      this.view.showSuccess(`Demande de versement de ${amount.toFixed(3)} dt envoyée`);
      this.view.setWithdrawalButtonEnabled(false);
      await this.loadData();
    } catch (error) {
      if (error.message !== "User cancelled") {
        this.view.showError(error.message || "Erreur lors de la demande de versement");
      }
    }
  }
async prepareWithdrawal(): Promise<void> {
  try {
    // 1. Récupérer les transactions non traitées
    const pendingTransactions = await this.model.getPendingTransactions();
    
    if (pendingTransactions.length === 0) {
      this.view.showError("Aucune transaction disponible pour versement");
      return;
    }
    
    // 2. Afficher la sélection à l'utilisateur
    const selectedIds = await this.view.showTransactionSelectionDialog(pendingTransactions);
    
    if (selectedIds.length === 0) {
      return; // Annulé par l'utilisateur
    }
    
    // 3. Calculer le montant total
    const totalAmount = pendingTransactions
      .filter(t => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
    
    // 4. Demander la méthode de versement
    const { method } = await this.view.showWithdrawalDialog(totalAmount);
    
    // 5. Mettre à jour les transactions sélectionnées
    await this.model.markTransactionsAsPending(selectedIds);
    
    // 6. Créer la demande de versement
    await this.model.requestWithdrawal(totalAmount, method);
    
    this.view.showSuccess(`Demande de versement de ${totalAmount.toFixed(3)} dt envoyée`);
    await this.loadData();
    
  } catch (error) {
    this.view.showError(error.message || "Erreur lors de la préparation du versement");
  }
}
}