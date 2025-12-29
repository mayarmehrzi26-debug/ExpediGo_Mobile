// historyService.ts
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy } from 'firebase/firestore';
import { firebasestore, firebaseAuth } from '../../../FirebaseConfig';
import { getUserById } from './userService';

export const addGlobalHistoryEntry = async (
  commandeId: string,
  action: string,
  details: Record<string, any> = {},
  type: 'livraison' | 'emballage' = 'livraison'
) => {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return false;

    // Récupérer les infos utilisateur
    const userData = await getUserById(user.uid);
    
    await addDoc(collection(firebasestore, 'historiqueGlobal'), {
      commandeId,
      action,
      performedBy: user.uid,
      performedByName: userData?.name || 'Utilisateur inconnu',
      timestamp: serverTimestamp(),
      details,
      type
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout à l'historique global:", error);
    return false;
  }
};

export const getGlobalHistory = async () => {
  try {
    const q = query(
      collection(firebasestore, 'historiqueGlobal'),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return [];
  }
};