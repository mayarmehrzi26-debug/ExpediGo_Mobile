import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  HomeScreen: undefined;
  EmballageCommand: undefined;
  NouvelleLivraison: undefined;
  Pickups: undefined;
  Livraison: undefined;
  Support: undefined;
  CommandesClient: undefined;
  CommandeDetails: { commandeId: string };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeScreen'>;