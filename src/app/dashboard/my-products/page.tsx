'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';

// Definisikan tipe untuk objek produk
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

// Komponen Modal Konfirmasi Hapus
const DeleteConfirmationModal = ({ product, onConfirm, onCancel }: { product: Product, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold">Konfirmasi Hapus</h2>
            <p className="my-4">Apakah Anda yakin ingin menghapus produk "{product.name}"?</p>
            <div className="flex justify-end space-x-4">
                <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
            </div>
        </div>
    </div>
);


export default function MyProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null); // State untuk modal

  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchProducts = async () => {
        try {
          const response = await fetch(`/api/products?ownerId=${user.uid}`);
          if (!response.ok) throw new Error('Gagal mengambil data produk.');
          const data = await response.json();
          setProducts(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    } else {
        const timer = setTimeout(() => {
            if (!auth.currentUser) router.push('/login');
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus produk.');
      }

      // Hapus produk dari state agar UI terupdate
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null); // Tutup modal

    } catch (err: any) {
      setError(err.message);
      setProductToDelete(null);
    }
  };

  if (loading) return <div className="text-center mt-20">Memuat data produk...</div>;
  if (!user && !loading) return <div className="text-center mt-20">Mengalihkan ke halaman login...</div>;
  

  return (
    <>
      {productToDelete && (
        <DeleteConfirmationModal
          product={productToDelete}
          onConfirm={handleDeleteProduct}
          onCancel={() => setProductToDelete(null)}
        />
      )}
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          {error && <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</div>}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Produk Saya</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="/dashboard/add-product" className="text-sm sm:text-base bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                + Tambah Produk
              </a>
              <a href="/" className="text-sm sm:text-base text-blue-600 hover:underline whitespace-nowrap">
                &larr; Beranda
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            {products.length === 0 ? (
              <p className="text-center p-8 text-gray-500">Anda belum memiliki produk.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{product.name}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Tombol Edit menjadi link */}
                        <a href={`/dashboard/edit-product/${product.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        <button onClick={() => setProductToDelete(product)} className="ml-4 text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
