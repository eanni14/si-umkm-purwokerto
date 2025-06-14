'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch('/api/auth/csrf-token');
        if (!res.ok) throw new Error('Gagal memuat token keamanan.');
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error(error);
        setError('Gagal memuat token keamanan. Silakan segarkan halaman.');
      }
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!csrfToken) {
        setError('Token keamanan tidak valid. Harap segarkan halaman.');
        setLoading(false);
        return;
    }
    if (!user) {
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: description,
          price: parseFloat(price),
          ownerId: user.uid,
          storeName: user.email,
          csrfToken: csrfToken,
          imageUrl: imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menambahkan produk.');

      setSuccess('Produk berhasil ditambahkan!');
      setProductName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    // PERBAIKAN: Mengganti 'any' dengan 'unknown'
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) return <div className="flex justify-center items-center h-screen">Memuat sesi...</div>;
  if (user === null) return <div className="flex justify-center items-center h-screen">Anda harus login. Mengalihkan...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-10 font-sans">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <a href="/dashboard/my-products" className="text-blue-600 hover:underline">&larr; Kembali ke Produk Saya</a>
        <h1 className="text-3xl font-bold text-gray-900 text-center">Tambah Produk Baru</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-100 p-3 rounded-md">{success}</p>}
          
          <div>
            <label htmlFor="productName" className="text-sm font-medium text-gray-700">Nama Produk</label>
            <input id="productName" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Kopi Robusta Premium" required />
          </div>
          <div>
            <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">URL Gambar Produk</label>
            <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="https://... (Contoh: dari Imgur, Postimages, dll)" required />
            {imageUrl && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500">Pratinjau:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Pratinjau Gambar" className="mt-2 rounded-md max-h-40 border" onError={(e) => e.currentTarget.style.display='none'} onLoad={(e) => e.currentTarget.style.display='block'} />
                </div>
            )}
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Jelaskan keunggulan produk Anda..." required />
          </div>
          <div>
            <label htmlFor="price" className="text-sm font-medium text-gray-700">Harga (Rp)</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="50000" required />
          </div>
          <button type="submit" disabled={loading || !csrfToken} className="w-full flex justify-center py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? 'Menyimpan...' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  );
}
