import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/auth/Login';

// Mock des Alertes
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.setPrototypeOf(
    {
      Alert: {
        alert: jest.fn(),
      },
      ActivityIndicator: 'ActivityIndicator',
      ImageBackground: 'ImageBackground',
      TextInput: 'TextInput',
      TouchableOpacity: 'TouchableOpacity',
    },
    RN
  );
});

// Mock de navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Firebase
const mockSignIn = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetDoc = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: () => mockSignIn(),
  onAuthStateChanged: () => mockOnAuthStateChanged(),
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: () => mockGetDoc(),
}));

// Mock des icônes
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesomeIcon',
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((callback) => {
      callback(null); // Aucun utilisateur connecté initialement
      return jest.fn(); // Fonction unsubscribe
    });
  });

  it('affiche le loader initial pendant le chargement', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('affiche correctement le formulaire après chargement', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<LoginScreen />);
    
    await waitFor(() => {
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
      expect(getByText('Se connecter')).toBeTruthy();
      expect(getByText('Créer un compte')).toBeTruthy();
      expect(getByTestId('eye-icon')).toBeTruthy();
    });
  });

  it('affiche une erreur lorsque les champs sont vides', async () => {
    const { getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByText('Se connecter'));
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez remplir tous les champs.');
    });
  });

  it('permet de basculer la visibilité du mot de passe', async () => {
    const { getByTestId, getByPlaceholderText } = render(<LoginScreen />);
    
    await waitFor(() => {
      const passwordInput = getByPlaceholderText('Mot de passe');
      const toggleButton = getByTestId('eye-icon');

      expect(passwordInput.props.secureTextEntry).toBe(true);
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  it('appelle la fonction de connexion avec les bonnes informations', async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: '123' } });
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'expediteur' }) });

    const { getByTestId, getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByText('Se connecter'));

      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('affiche une erreur lorsque la connexion échoue', async () => {
    const errorMessage = 'Email ou mot de passe incorrect';
    mockSignIn.mockRejectedValueOnce(new Error(errorMessage));

    const { getByTestId, getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('email-input'), 'wrong@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpassword');
      fireEvent.press(getByText('Se connecter'));

      expect(Alert.alert).toHaveBeenCalledWith('Erreur', errorMessage);
    });
  });

  it('redirige vers HomeScreen après connexion réussie', async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: '123' } });
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'expediteur' }) });

    const { getByTestId, getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByText('Se connecter'));

      expect(mockNavigate).toHaveBeenCalledWith('HomeScreen');
    });
  });

  it('gère correctement les différents rôles utilisateur', async () => {
    const testCases = [
      { role: 'expediteur', expectedScreen: 'HomeScreen' },
      { role: 'livreur', expectedScreen: 'HomeLivreur' },
      { role: 'destinataire', expectedScreen: 'HomeClient' },
      { role: 'inconnu', expectedScreen: 'HomeScreen' },
    ];

    for (const { role, expectedScreen } of testCases) {
      mockSignIn.mockResolvedValueOnce({ user: { uid: '123' } });
      mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ role }) });

      const { getByTestId, getByText } = render(<LoginScreen />);
      
      await waitFor(() => {
        fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('password-input'), 'password123');
        fireEvent.press(getByText('Se connecter'));

        expect(mockNavigate).toHaveBeenCalledWith(expectedScreen);
      });

      jest.clearAllMocks();
    }
  });

  it('affiche le loader pendant la connexion', async () => {
    mockSignIn.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ user: { uid: '123' } }), 1000)));
    mockGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'expediteur' }) });

    const { getByTestId, getByText, queryByTestId } = render(<LoginScreen />);
    
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByText('Se connecter'));

    // Vérifie que le loader est affiché pendant la connexion
    expect(queryByTestId('loading-indicator')).toBeTruthy();
    
    await waitFor(() => {
      // Vérifie que le loader est caché après la connexion
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });
});