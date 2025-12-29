import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '..';
import { Auth } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Mock des fonctions Firebase
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Mock de navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

// Mock des icônes FontAwesome
jest.mock('@expo/vector-icons', () => ({
  FontAwesome: () => 'FontAwesomeIcon',
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('affiche le loader initial pendant le chargement', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('affiche correctement le formulaire de connexion après chargement', async () => {
    // Mock pour passer rapidement le state initial de chargement
    jest.spyOn(require('firebase/auth'), 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(null); // Aucun utilisateur connecté
      return jest.fn(); // Retourne la fonction unsubscribe
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
      expect(getByText('Se connecter')).toBeTruthy();
      expect(getByText('Créer un compte')).toBeTruthy();
    });
  });

  it('affiche une erreur lorsque les champs sont vides', async () => {
    jest.spyOn(require('firebase/auth'), 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    const { getByText, queryByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      const loginButton = getByText('Se connecter');
      fireEvent.press(loginButton);
      
      expect(queryByText('Veuillez remplir tous les champs.')).toBeTruthy();
    });
  });

  it('permet de basculer la visibilité du mot de passe', async () => {
    jest.spyOn(require('firebase/auth'), 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    
    await waitFor(() => {
      const passwordInput = getByPlaceholderText('Mot de passe');
      const toggleButton = getByTestId('eye-icon'); // Vous devrez ajouter testID="eye-icon" à votre composant

      // Par défaut, le mot de passe est masqué
      expect(passwordInput.props.secureTextEntry).toBe(true);
      
      // Cliquer sur le bouton pour afficher le mot de passe
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);
      
      // Cliquer à nouveau pour masquer le mot de passe
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  it('appelle la fonction de connexion avec les bonnes informations', async () => {
    const mockSignIn = jest.fn();
    jest.spyOn(require('firebase/auth'), 'signInWithEmailAndPassword').mockImplementation(mockSignIn);
    jest.spyOn(require('firebase/auth'), 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    await waitFor(() => {
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Mot de passe');
      const loginButton = getByText('Se connecter');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      expect(mockSignIn).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    });
  });

  it('affiche une erreur lorsque la connexion échoue', async () => {
    const errorMessage = 'Email ou mot de passe incorrect';
    jest.spyOn(require('firebase/auth'), 'signInWithEmailAndPassword').mockRejectedValue(new Error(errorMessage));
    jest.spyOn(require('firebase/auth'), 'onAuthStateChanged').mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
    
    await waitFor(async () => {
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Mot de passe');
      const loginButton = getByText('Se connecter');

      fireEvent.changeText(emailInput, 'wrong@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      // Vérifie que l'erreur est affichée
      const errorAlert = await findByText(errorMessage);
      expect(errorAlert).toBeTruthy();
    });
  });
});