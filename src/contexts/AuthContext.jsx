import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider } from '../firebase';
import AuthModal from '../components/AuthModal';

const AuthContext = createContext(null);

function authErrorMessage(error) {
  switch (error?.code) {
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow popups and try again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window closed before it finished.';
    case 'auth/cancelled-popup-request':
      return 'Another Google sign-in window is already open.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in is not authorized for this domain yet. Add it in Firebase Authentication settings.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project yet.';
    case 'auth/account-exists-with-different-credential':
      return 'This email is already linked to a different sign-in method.';
    case 'auth/network-request-failed':
      return 'The sign-in request could not reach Firebase. Check your connection and try again.';
    case 'auth/invalid-api-key':
      return 'Google sign-in is not configured with a valid Firebase web API key.';
    case 'auth/configuration-not-found':
      return 'Google sign-in is not enabled for this Firebase project yet. Enable the Google provider under Firebase Console → Authentication → Sign-in method, then try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return "Couldn't complete Google sign-in. Please try again.";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    localStorage.removeItem('crush_o_meter_token');

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      },
      () => {
        setUser(null);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseConfigured) {
      throw new Error(
        'Google sign-in is not configured yet. Add VITE_FIREBASE_API_KEY to your environment.',
      );
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setAuthOpen(false);
      return result.user;
    } catch (error) {
      const nextError = new Error(authErrorMessage(error));
      nextError.code = error?.code || 'auth/unknown';
      throw nextError;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      logout,
      openAuth,
      closeAuth,
      authOpen,
    }),
    [user, loading, signInWithGoogle, logout, openAuth, closeAuth, authOpen],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
