'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types/product';
import Link from 'next/link'; // PERBAIKAN

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        
        if (user) {
            const fetchProducts = async () => {
                setLoadingProducts(true);
                try {
                    const response = await fetch(`/api/products?ownerId=${user.uid}`);
                    if (!response.ok) throw new Error('Gagal mengambil data produk.');
                    const data = await response.json();
                    setProducts(data);
                // PERBAIKAN
                } catch (err: unknown) {
                    if (err instanceof Error) setError(err.message);
                } finally {
                    setLoadingProducts(false);
                }
            };
            fetchProducts();
        }
    }, [user, authLoading, router]);

    if (authLoading || loadingProducts) {
        return <div className="text-center mt-20">Memuat data profil...</div>;
    }
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                         <Link href="/dashboard/my-products" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Manajemen Produk
                        </Link>
                        <button onClick={logout} className="bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
                            Keluar
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Produk yang Saya Jual ({products.length})</h2>
                    {error && <p className="text-red-500">{error}</p>}
                    {products.length > 0 ? (
                        <ul className="space-y-4">
                            {products.map(product => (
                                <li key={product.id} className="border-b pb-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-sm text-gray-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                                    </div>
                                    <Link href={`/dashboard/edit-product/${product.id}`} className="text-sm text-indigo-600 hover:underline">
                                        Edit
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-gray-500">Anda belum memiliki produk.</p> )}
                </div>
            </div>
        </div>
    );
}