'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import type { Product } from '@/types/product';
import ProductImage from '@/components/ProductImage';
import { useAuth } from '@/context/AuthContext';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';

// Definisikan tipe untuk Ulasan
type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
};

// Komponen untuk input bintang rating
const StarRatingInput = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index} className="cursor-pointer">
                        <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} className="hidden" />
                        <svg className={`w-8 h-8 ${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300 transition-colors`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </label>
                );
            })}
        </div>
    );
};


export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Dibuat sebagai fungsi terpisah agar bisa dipanggil ulang
  const fetchAllData = useCallback(async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/reviews?productId=${productId}`)
        ]);
        if (!productRes.ok) throw new Error('Produk tidak ditemukan');
        
        const productData = await productRes.json();
        const reviewsData = await reviewsRes.json();
        
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
  }, [productId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleReviewSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (newRating === 0 || !newComment.trim()) { setFormError('Rating dan komentar harus diisi.'); return; }
      if (!user) { router.push('/login'); return; }
      setSubmitting(true);
      setFormError('');
      try {
          const response = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, userId: user.uid, userName: user.email?.split('@')[0] || 'Anonim', rating: newRating, comment: newComment, })
          });
          if (!response.ok) throw new Error('Gagal mengirim ulasan.');
          await fetchAllData(); // Re-fetch semua data untuk sinkronisasi
          setNewComment(''); setNewRating(0);
      } catch (error: unknown) {
          if(error instanceof Error) setFormError(error.message);
      } finally {
          setSubmitting(false);
      }
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    if(!user) {
        alert("Anda harus login untuk menghapus ulasan.");
        return;
    }
    // Ganti window.confirm dengan UI custom jika diperlukan
    if(!confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid })
        });

        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Gagal menghapus ulasan.");
        }
        await fetchAllData(); // Re-fetch semua data untuk sinkronisasi
    } catch (error: unknown) {
        if(error instanceof Error) alert(error.message);
    }
  };

  if (loading) return <div className="text-center mt-20">Memuat produk...</div>;
  if (!product) return notFound();

  const imageSrc = product.imageUrl || `https://placehold.co/800x600/e2e8f0/334155?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="bg-gray-50 min-h-screen">
       <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center"><Link href="/" className="text-2xl font-bold text-blue-600">Si-UMKM Purwokerto</Link><Link href="/#products" className="text-blue-600 hover:underline">&larr; Kembali ke Katalog</Link></div>
       </header>
       <main className="container mx-auto p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="md:flex">
                    <div className="md:flex-shrink-0"><div className="relative h-64 w-full md:w-80"><ProductImage src={imageSrc} alt={product.name} /></div></div>
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{product.storeName || 'Toko UMKM'}</div>
                        <h1 className="mt-1 text-3xl leading-tight font-extrabold text-gray-900">{product.name}</h1>
                        <p className="mt-4 text-gray-600">{product.description}</p>
                        <p className="mt-6 text-4xl font-bold text-gray-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                        <button className="mt-8 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">Hubungi Penjual</button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ulasan Pengguna ({reviews.length})</h2>
                        <div className="space-y-6">
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.id} className="border-b pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center mb-1"><p className="font-semibold text-gray-900">{review.userName}</p><div className="ml-4"><StarRatingInput rating={review.rating} setRating={() => {}} /></div></div>
                                            <p className="text-gray-900">{review.comment}</p>
                                        </div>
                                        {user && user.uid === review.userId && (<button onClick={() => handleDeleteReview(review.id)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>)}
                                    </div>
                                </div>
                            )) : <p className="text-gray-500">Belum ada ulasan untuk produk ini.</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Beri Ulasan</h2>
                        {user ? (
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-4"><p className="font-medium mb-2 text-gray-900">Rating Anda:</p><StarRatingInput rating={newRating} setRating={setNewRating} /></div>
                                <div className="mb-4"><label htmlFor="comment" className="block font-medium mb-1 text-gray-900">Komentar:</label><textarea id="comment" rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-2 border rounded-md text-gray-900 placeholder:text-gray-400" placeholder="Bagaimana pendapat Anda tentang produk ini?"/></div>
                                {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
                                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{submitting ? 'Mengirim...' : 'Kirim Ulasan'}</button>
                            </form>
                        ) : ( <p className="text-gray-600">Anda harus <Link href="/login" className="text-blue-600 font-bold hover:underline">login</Link> untuk memberikan ulasan.</p> )}
                    </div>
                </div>
            </div>
       </main>
    </div>
  );
}
