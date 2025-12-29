export const firebaseAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

export const getFirestore = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn();