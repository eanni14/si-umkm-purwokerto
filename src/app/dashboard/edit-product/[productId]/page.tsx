'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation'; // PERBAIKAN: Hapus useRouter yang tidak terpakai

type ProductData = {
    name: string;
    description: string;
    price: string;
};

export default function EditProductPage() {
    const { user } = useAuth();
    const params = useParams();
    const productId = params.productId as string;

    const [product, setProduct] = useState<ProductData>({ name: '', description: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!productId) return;
        const fetchProductData = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) throw new Error('Produk tidak ditemukan.');
                const data = await response.json();
                if (user && user.uid !== data.ownerId) {
                   setError("Anda tidak berhak mengedit produk ini.");
                   setLoading(false);
                   return;
                }
                setProduct({
                    name: data.name,
                    description: data.description,
                    price: data.price.toString(),
                });
            // PERBAIKAN: Mengganti 'any' dengan 'unknown'
            } catch (err: unknown) {
                if(err instanceof Error) setError(err.message);
                else setError("Terjadi kesalahan yang tidak diketahui");
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [productId, user]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                }),
            });
            if (!response.ok) throw new Error('Gagal memperbarui produk.');
            setSuccess('Produk berhasil diperbarui!');
        // PERBAIKAN: Mengganti 'any' dengan 'unknown'
        } catch (err: unknown) {
            if(err instanceof Error) setError(err.message);
            else setError("Terjadi kesalahan yang tidak diketahui");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-20">Memuat data...</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-10 font-sans">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <a href="/dashboard/my-products" className="text-blue-600 hover:underline">&larr; Kembali ke Produk Saya</a>
                <h1 className="text-3xl font-bold text-gray-900 text-center">Edit Produk</h1>

                {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
                {success && <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{success}</p>}

                {!error && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="productName" className="text-sm font-medium text-gray-700">Nama Produk</label>
                            <input id="productName" type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea id="description" rows={4} value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="price" className="text-sm font-medium text-gray-700">Harga (Rp)</label>
                            <input id="price" type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
