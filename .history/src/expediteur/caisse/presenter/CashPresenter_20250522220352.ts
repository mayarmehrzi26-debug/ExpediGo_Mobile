import { CashModel, Transaction, WithdrawalRequest, PendingTransaction } from "../model/CashModel";

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

      console.log('[CashPresenter] Balance data:', balance);
      console.log('[CashPresenter] Withdrawal requests:', requests);

      const hasPendingRequest = await this.model.hasPendingWithdrawal();
      console.log('[CashPresenter] Has pending withdrawal:', hasPendingRequest);

      const canWithdraw = !hasPendingRequest && balance.enAttente > 0;
      console.log('[CashPresenter] Can request withdrawal:', canWithdraw);

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
      console.log('[CashPresenter] Preparing withdrawal...');
      const pendingTransactions = await this.model.getPendingTransactions();
      console.log(`[CashPresenter] Found ${pendingTransactions.length} pending transactions`);

      if (pendingTransactions.length === 0) {
        this.view.showError("Aucune transaction disponible pour versement");
        return;
      }

      this.view.displayPendingTransactions(pendingTransactions);
      
      const selectedIds = await this.view.showTransactionSelectionDialog(pendingTransactions);
      console.log('[CashPresenter] Selected transaction IDs:', selectedIds);

      if (selectedIds.length === 0) {
        return; // User cancelled
      }

      const totalAmount = pendingTransactions
        .filter(t => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + t.amount, 0);
      console.log('[CashPresenter] Total withdrawal amount:', totalAmount);

      const { method } = await this.view.showWithdrawalDialog(totalAmount);
      console.log('[CashPresenter] Selected method:', method);

      await this.model.markTransactionsAsPending(selectedIds);
      console.log('[CashPresenter] Transactions marked as pending');

      await this.model.requestWithdrawal(totalAmount, method);
      console.log('[CashPresenter] Withdrawal request created');

      this.view.showSuccess(`Demande de versement de ${totalAmount.toFixed(3)} dt envoyée`);
      await this.loadData();
    } catch (error) {
      console.error('[CashPresenter] Error preparing withdrawal:', error);
      if (error.message !== "User cancelled") {
        this.view.showError(error.message || "Erreur lors de la préparation du versement");
      }
    }
  }

  async requestWithdrawal(amount: number): Promise<void> {
    try {
      console.log('[CashPresenter] Requesting withdrawal for amount:', amount);
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