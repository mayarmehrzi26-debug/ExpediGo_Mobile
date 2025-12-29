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
    console.log("[CashPresenter] Preparing withdrawal...");
    
    const pendingTransactions = await this.model.getPendingTransactions();
    console.log(`[CashPresenter] Found ${pendingTransactions.length} pending transactions`);
    
    if (pendingTransactions.length === 0) {
      this.view.showError("Aucune transaction disponible pour versement");
      return;
    }

    const selectedIds = await this.view.showTransactionSelectionDialog(pendingTransactions);
    console.log(`[CashPresenter] User selected ${selectedIds.length} transactions`);
    
    if (selectedIds.length === 0) return;

    const totalAmount = pendingTransactions
      .filter(t => selectedIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
    
    console.log(`[CashPresenter] Total amount to withdraw: ${totalAmount}`);

    const { method } = await this.view.showWithdrawalDialog(totalAmount);
    console.log(`[CashPresenter] Payment method selected: ${method}`);

    console.log("[CashPresenter] Marking transactions as pending...");
    await this.model.markTransactionsAsPending(selectedIds);

    console.log("[CashPresenter] Creating withdrawal request...");
    await this.model.requestWithdrawal(totalAmount, method, selectedIds);

    this.view.showSuccess(`Demande de versement de ${totalAmount.toFixed(3)} dt envoyée`);
    await this.loadData();
  } catch (error) {
    console.error("[CashPresenter] Error in prepareWithdrawal:", error);
    if (error.message !== "User cancelled") {
      this.view.showError(error.message || "Échec de la demande de versement");
    }
  }
}

  async requestWithdrawal(amount: number, paymentMethod: "Espèces" | "Virement", transactionIds?: string[]): Promise<string> {
  try {
    console.log("[DEBUG] Starting requestWithdrawal");
    console.log("[DEBUG] User:", this.userId);
    console.log("[DEBUG] Amount:", amount);
    console.log("[DEBUG] Method:", paymentMethod);
    console.log("[DEBUG] Transaction IDs:", transactionIds);

    if (!this.userId) {
      console.error("[ERROR] User ID is undefined");
      throw new Error("User ID non défini");
    }

    // Vérification de la connexion Firestore
    try {
      const testDoc = doc(firebasestore, "test", "test");
      await setDoc(testDoc, { test: true });
      console.log("[DEBUG] Firestore connection OK");
      await deleteDoc(testDoc);
    } catch (error) {
      console.error("[ERROR] Firestore connection failed:", error);
      throw error;
    }

    // Création de la demande
    const withdrawalData = {
      userId: this.userId,
      amount,
      status: "pending",
      paymentMethod,
      transactionIds: transactionIds || [],
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    console.log("[DEBUG] Withdrawal data:", withdrawalData);

    const docRef = await addDoc(collection(firebasestore, "withdrawalRequests"), withdrawalData);
    console.log("[DEBUG] Document created with ID:", docRef.id);

    // Mise à jour du solde
    await updateDoc(doc(firebasestore, "soldes", this.userId), {
      soldeEnAttente: increment(-amount),
      lastUpdated: serverTimestamp()
    });

    console.log("[DEBUG] Balance updated successfully");

    return docRef.id;
  } catch (error) {
    console.error("[ERROR] in requestWithdrawal:", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
}