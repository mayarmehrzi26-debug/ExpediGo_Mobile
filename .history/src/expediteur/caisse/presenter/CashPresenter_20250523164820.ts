import { CashModel, PendingTransaction, Transaction, WithdrawalRequest } from "../model/CashModel";

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
      const canWithdraw = !hasPendingRequest && balance.enAttente > 0;

      this.view.setWithdrawalButtonEnabled(canWithdraw);
      
      this.view.displayBalance({
        total: (balance.disponible + balance.enAttente).toFixed(3),
        disponible: balance.disponible.toFixed(3),
        enAttente: balance.enAttente.toFixed(3),
        currency: balance.currency
      });
      
      this.view.displayTransactions(transactions);
      this.view.displayWithdrawalRequests(requests);
    } catch (error) {
      console.error('[CashPresenter] Error loading data:', error);
      this.view.showError(error.message || "Erreur lors du chargement des données");
    }
  }

async prepareWithdrawal(): Promise<void> {
  try {
    console.log("[1/6] Fetching pending transactions...");
    const pendingTransactions = await this.model.getPendingTransactions();
    console.log(`[2/6] Found ${pendingTransactions.length} pending transactions`);

    if (pendingTransactions.length === 0) {
      this.view.showError("Aucune transaction disponible pour versement");
      return;
    }

    // Afficher la sélection des transactions
    const selectedIds = await this.view.showTransactionSelectionDialog(pendingTransactions);
    console.log(`[4/6] User selected ${selectedIds.length} transactions`);
    
    if (selectedIds.length === 0) return;

    // Calcul du montant total
    const totalAmount = pendingTransactions
      .filter(t => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
    console.log(`[5/6] Total amount: ${totalAmount}`);

    // Sélection du mode de paiement
    console.log("[6/6] Showing payment method dialog...");
    const paymentMethod = await this.view.showPaymentMethodDialog();
    
    // Marquer les transactions comme "En attente"
    await this.model.markTransactionsAsPending(selectedIds);
    
    // Créer la demande de versement
    const requestId = await this.model.requestWithdrawal(
      totalAmount, 
      paymentMethod, 
      selectedIds
    );
    
    this.view.showSuccess(`Demande de versement (${paymentMethod}) de ${totalAmount.toFixed(3)} dt envoyée`);
    await this.loadData();

  } catch (error) {
    console.error("[FINAL ERROR]", error);
    if (error.message !== "User cancelled") {
      this.view.showError(error.message || "Erreur lors de la demande");
    }
  }
}

  async requestWithdrawal(amount: number): Promise<void> {
    try {
      const balance = await this.model.getBalance();

      if (balance.enAttente <= 0) {
        throw new Error("Vous n'avez pas de solde en attente");
      }

      if (amount > balance.enAttente) {
        throw new Error("Le montant demandé dépasse votre solde en attente");
      }

      const { method } = await this.view.showWithdrawalDialog(balance.enAttente);
      await this.model.requestWithdrawal(amount, method);

      this.view.showSuccess(`Demande de versement de ${amount.toFixed(3)} dt envoyée`);
      this.view.setWithdrawalButtonEnabled(false);
      await this.loadData();
    } catch (error) {
      console.error('[CashPresenter] Error requesting withdrawal:', error);
      if (error.message !== "User cancelled") {
        this.view.showError(error.message || "Erreur lors de la demande de versement");
      }
    }
  }
}