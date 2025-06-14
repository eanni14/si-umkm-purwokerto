'use client';

import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use': return 'Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.';
      case 'auth/invalid-email': return 'Format alamat email tidak valid.';
      case 'auth/weak-password': return 'Password terlalu lemah. Harap gunakan minimal 6 karakter.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email atau password yang Anda masukkan salah.';
      default: return 'Terjadi kesalahan. Silakan coba beberapa saat lagi.';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
        setIsLoginView(true);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900"><a href="/">Si-UMKM</a></h1>
            <p className="mt-2 text-gray-600">{isLoginView ? 'Selamat datang kembali!' : 'Buat akun baru Anda'}</p>
        </div>
        
        <div className="flex border-b">
            <button onClick={() => { setIsLoginView(true); setError(''); setSuccessMessage(''); }} className={`w-1/2 py-3 font-semibold text-center transition-colors ${isLoginView ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Masuk</button>
            <button onClick={() => { setIsLoginView(false); setError(''); setSuccessMessage(''); }} className={`w-1/2 py-3 font-semibold text-center transition-colors ${!isLoginView ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Daftar</button>
        </div>

        {successMessage && <p className="text-green-600 text-sm text-center bg-green-100 p-3 rounded-md">{successMessage}</p>}
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md">{error}</p>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Alamat Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="anda@email.com" />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
            {loading ? 'Memproses...' : (isLoginView ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Atau lanjutkan dengan</span></div>
        </div>

        <div>
          <button onClick={handleGoogleSignIn} className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <img className="w-5 h-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}
