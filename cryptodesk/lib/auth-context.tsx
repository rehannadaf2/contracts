'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '@/types';

type AuthContextState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextState>({ user: null, profile: null, loading: true });

// Auth provider keeps session persistent and ensures profile document exists.
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          uid: currentUser.uid,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber,
          role: 'user',
          createdAt: Date.now(),
          updatedAt: serverTimestamp(),
        });
      }

      const refreshed = await getDoc(ref);
      setProfile(refreshed.data() as UserProfile);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(() => ({ user, profile, loading }), [user, profile, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
