'use client';

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk nilai context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

// Buat context dengan nilai awal
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Buat komponen Provider
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChanged adalah listener dari Firebase
    // yang akan terpanggil setiap kali status login berubah
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Pengguna berhasil login
        setUser(user);
      } else {
        // Pengguna logout
        setUser(null);
      }
      setLoading(false);
    });

    // Membersihkan listener saat komponen tidak lagi digunakan
    return () => unsubscribe();
  }, []);

  const logout = () => {
    signOut(auth)
      .then(() => {
        // Redirect ke halaman login setelah berhasil logout
        router.push('/login');
      })
      .catch((error) => {
        console.error('Logout Error:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

// Buat custom hook untuk mempermudah penggunaan context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
