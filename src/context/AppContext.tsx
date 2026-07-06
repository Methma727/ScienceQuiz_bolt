import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';

interface AppContextType {
  studentName: string;
  setStudentName: (name: string) => void;
  currentQuizId: string | null;
  setCurrentQuizId: (id: string | null) => void;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [studentName, setStudentName] = useState<string>(() => {
    return sessionStorage.getItem('studentName') || '';
  });
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(() => {
    return sessionStorage.getItem('currentQuizId') || null;
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentName) {
      sessionStorage.setItem('studentName', studentName);
    } else {
      sessionStorage.removeItem('studentName');
    }
  }, [studentName]);

  useEffect(() => {
    if (currentQuizId) {
      sessionStorage.setItem('currentQuizId', currentQuizId);
    } else {
      sessionStorage.removeItem('currentQuizId');
    }
  }, [currentQuizId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        studentName,
        setStudentName,
        currentQuizId,
        setCurrentQuizId,
        user,
        isAdmin,
        loading,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
