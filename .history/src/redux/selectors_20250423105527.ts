import { Livraison } from '../models/LivraisonModel';
import { RootState } from './store';

export const selectLivraisons = (state: RootState): Livraison[] => state.livraisons;
