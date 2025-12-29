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
      throw new Error("Aucune transaction disponible");
    }

    console.log("[3/6] Showing selection dialog...");
    const selectedIds = await this.view.showTransactionSelectionDialog(pendingTransactions);
    console.log(`[4/6] Selected IDs: ${selectedIds.join(', ')}`);

    if (selectedIds.length === 0) return;

    const totalAmount = pendingTransactions
      .filter(t => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
    console.log(`[5/6] Total amount: ${totalAmount}`);

    console.log("[6/6] Starting withdrawal process...");
    const { method } = await this.view.showWithdrawalDialog(totalAmount);
    
    // Vérification finale avant envoi
    console.log("[6.1/6] Validating data...");
    if (!this.model.userId) throw new Error("User non authentifié");
    if (totalAmount <= 0) throw new Error("Montant invalide");

    console.log("[6.2/6] Marking transactions as pending...");
    await this.model.markTransactionsAsPending(selectedIds);

    console.log("[6.3/6] Creating withdrawal request...");
    const requestId = await this.model.requestWithdrawal(totalAmount, method, selectedIds);
    
    console.log(`[SUCCESS] Withdrawal ${requestId} created`);
    this.view.showSuccess(`Demande de ${totalAmount} dt envoyée`);
    
  } catch (error) {
    console.error("[FINAL ERROR]", error);
    this.view.showError(error.message || "Erreur inconnue");
  }
}

 async requestWithdrawal(amount: number, paymentMethod: "Espèces" | "Virement", transactionIds?: string[]): Promise<string> {
  try {
    console.log("[DEBUG] 1/4 - Starting withdrawal with:", {
      userId: this.userId,
      amount,
      paymentMethod
    });

    // Vérification Firestore
    const testRef = doc(firebasestore, "test", "test");
    await setDoc(testRef, { test: true });
    console.log("[DEBUG] 2/4 - Firestore connection OK");
    await deleteDoc(testRef);

    const withdrawalData = {
      userId: this.userId,
      amount,
      status: "pending",
      paymentMethod,
      transactionIds: transactionIds || [],
      createdAt: serverTimestamp(),
      _debug: new Date().toISOString()
    };

    console.log("[DEBUG] 3/4 - Data to be saved:", withdrawalData);
    
    const docRef = await addDoc(collection(firebasestore, "withdrawalRequests"), withdrawalData);
    console.log("[SUCCESS] 4/4 - Withdrawal created with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("[FATAL ERROR] In requestWithdrawal:", {
      code: error.code, // Important pour Firestore
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
}