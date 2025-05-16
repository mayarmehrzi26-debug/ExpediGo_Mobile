import { Livraison } from '../models/LivraisonModel';
import { setLivraison } from '../redux/actions';

export const handleNewLivraison = (dispatch: any, livraison: Livraison) => {
  dispatch(setLivraison(livraison));
};
