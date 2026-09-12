import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, loginWithEmail, logoutUser, testFirestoreConnection, handleFirestoreError, OperationType } from './firebase';
import { PaperData, PaymentConfig } from '../types';

interface CloudPaperItem {
  id: string;
  title: string;
  author: string;
  date: string;
  updatedAt: string;
  data: PaperData;
}

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  isFirebaseConnected: boolean;
  connectionError: string | null;
  cloudPaymentConfig: PaymentConfig | null;
  signIn: () => Promise<void>;
  signInWithEmail: (emailOrUser: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  saveCurrentPaperToCloud: (paper: PaperData) => Promise<{ success: boolean; id?: string; error?: string }>;
  loadUserPapers: () => Promise<CloudPaperItem[]>;
  deleteCloudPaper: (paperId: string) => Promise<boolean>;
  syncPaymentConfigToCloud: (cfg: PaymentConfig) => Promise<boolean>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cloudPaymentConfig, setCloudPaymentConfig] = useState<PaymentConfig | null>(null);

  // 1. Initial Connection Validation
  useEffect(() => {
    testFirestoreConnection()
      .then((res) => {
        setIsFirebaseConnected(res.connected);
        if (res.error) setConnectionError(res.error);
      })
      .catch((err) => {
        console.warn('Firebase test connection caught:', err);
      });
  }, []);

  // 2. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Real-time Payment Configuration Listener from Firestore
  // Adhering to SKILL.md mandate: Only attach onSnapshot listeners if auth is ready and user is authenticated
  useEffect(() => {
    if (!user) return;

    const paymentDocRef = doc(db, 'settings', 'payment');
    const unsubscribe = onSnapshot(
      paymentDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as PaymentConfig;
          setCloudPaymentConfig(data);
        }
      },
      (error) => {
        console.warn('Firestore payment listener notice:', error.message);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Sign In with Google
  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      throw err;
    }
  };

  // Sign In with Username / Email and Password (auto-appends @gmail.com if needed)
  const handleSignInWithEmail = async (emailOrUser: string, password: string): Promise<User> => {
    const clean = emailOrUser.trim().toLowerCase();
    const email = clean.includes('@') ? clean : `${clean}@gmail.com`;
    try {
      const loggedUser = await loginWithEmail(email, password);
      return loggedUser;
    } catch (err: unknown) {
      console.error('Firebase Email sign-in error:', err);
      throw err;
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
    }
  };

  // Save current active paper to user's personal cloud vault
  const saveCurrentPaperToCloud = async (paper: PaperData): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Please sign in with your Google account to save papers to the cloud.' };
    }

    const paperId = `paper_${Date.now()}`;
    const docPath = `users/${user.uid}/papers/${paperId}`;

    try {
      const payload = {
        id: paperId,
        userId: user.uid,
        title: paper.title || 'Untitled Thesis Draft',
        author: paper.author || 'Anonymous Student',
        affiliation: paper.affiliation || '',
        studentId: paper.studentId || '',
        email: paper.email || user.email || '',
        publicationTag: paper.publicationTag || '',
        date: paper.date || new Date().toLocaleDateString(),
        keywords: paper.keywords || '',
        abstract: paper.abstract || '',
        keyModules: paper.keyModules || '',
        fullPaperData: JSON.stringify(paper),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid, 'papers', paperId), payload);
      return { success: true, id: paperId };
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  };

  // Load user's cloud saved papers
  const loadUserPapers = async (): Promise<CloudPaperItem[]> => {
    if (!user) return [];

    const collectionPath = `users/${user.uid}/papers`;
    try {
      const q = query(collection(db, 'users', user.uid, 'papers'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: CloudPaperItem[] = [];

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let parsedData: PaperData | null = null;
        if (d.fullPaperData) {
          try {
            parsedData = JSON.parse(d.fullPaperData);
          } catch {
            parsedData = null;
          }
        }
        if (parsedData) {
          items.push({
            id: docSnap.id,
            title: d.title,
            author: d.author,
            date: d.date,
            updatedAt: d.updatedAt,
            data: parsedData,
          });
        }
      });
      return items;
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    }
  };

  // Delete paper from cloud
  const deleteCloudPaper = async (paperId: string): Promise<boolean> => {
    if (!user) return false;
    const docPath = `users/${user.uid}/papers/${paperId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'papers', paperId));
      return true;
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  // Sync Payment Config to Cloud (Firestore)
  const syncPaymentConfigToCloud = async (cfg: PaymentConfig): Promise<boolean> => {
    const docPath = 'settings/payment';
    try {
      await setDoc(doc(db, 'settings', 'payment'), {
        ...cfg,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err: unknown) {
      console.warn('Syncing payment config to cloud failed:', err);
      return false;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        isFirebaseConnected,
        connectionError,
        cloudPaymentConfig,
        signIn: handleSignIn,
        signInWithEmail: handleSignInWithEmail,
        signOut: handleSignOut,
        saveCurrentPaperToCloud,
        loadUserPapers,
        deleteCloudPaper,
        syncPaymentConfigToCloud,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
