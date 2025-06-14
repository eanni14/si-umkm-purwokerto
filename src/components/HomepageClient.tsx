'use client';

import { useState } from 'react';
import Image from 'next/image'; // Impor Image
import { useAuth } from '@/context/AuthContext';
import { useLazyQuery, gql } from '@apollo/client';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';

// PERUBAHAN: Meminta imageUrl dalam query
const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($term: String!) {
    searchProducts(term: $term) {
      id
      name
      price
      storeName
      imageUrl 
    }
  }
`;

// PERUBAHAN: Menambahkan imageUrl ke dalam tipe
type SearchedProduct = Pick<Product, 'id' | 'name' | 'price' | 'storeName' | 'imageUrl'>;

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function HomepageClient({ initialProducts }: { initialProducts: Product[] }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [
    search, 
    { loading: searchLoading, error: searchError, data: searchData }
  ] = useLazyQuery(SEARCH_PRODUCTS_QUERY);

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      search({ variables: { term: searchQuery } });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-blue-600">Si-UMKM Purwokerto</a>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#products" className="text-gray-600 hover:text-blue-600 transition-colors">Produk Unggulan</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Kontak</a>
          </nav>
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <a href="/profil" className="font-medium text-gray-700 hover:text-blue-600">Hi, {user.email?.split('@')[0]}</a>
                <a href="/dashboard/my-products" className="font-medium text-blue-600 hover:text-blue-800">Dashboard</a>
                <button onClick={logout} className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Keluar</button>
              </div>
            ) : ( <a href="/login" className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">Masuk / Daftar</a> )}
          </div>
        </div>
      </header>

      <main>
        <section className="bg-blue-600 text-white">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Majukan Usaha Anda Bersama Si-UMKM Purwokerto</h1>
            <p className="text-lg md:text-xl mb-8 text-blue-200">Platform terintegrasi untuk pendaftaran, promosi, dan pembinaan UMKM di Purwokerto.</p>
            <div className="max-w-2xl mx-auto">
                <div className="relative">
                    <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Cari produk atau program pelatihan..." className="w-full p-4 pr-20 rounded-lg border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <button onClick={handleSearch} disabled={searchLoading} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-yellow-400 text-blue-900 font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 disabled:bg-gray-400">
                      {searchLoading ? '...' : 'Cari'}
                    </button>
                </div>
            </div>
          </div>
        </section>

        {(searchLoading || searchError || searchData) && (
          <section id="search-results" className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Hasil Pencarian</h2>
              {searchLoading && <p className="text-center">Mencari...</p>}
              {searchError && <p className="text-center text-red-500">Error: {searchError.message}</p>}
              {searchData && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {searchData.searchProducts.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">Produk tidak ditemukan.</p>
                  ) : (
                    // PERUBAHAN: Merender hasil pencarian menjadi kartu dengan gambar
                    searchData.searchProducts.map((product: SearchedProduct) => (
                      <a href={`/produk/${product.id}`} key={product.id} className="block group">
                        <div className="bg-white rounded-lg shadow-md p-4 transition-shadow duration-300 group-hover:shadow-xl h-full flex flex-col">
                          <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                            <Image
                              src={product.imageUrl || `https://placehold.co/400x300/e2e8f0/334155?text=${encodeURIComponent(product.name)}`}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/e2e8f0/334155?text=Error`; }}
                            />
                          </div>
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600">{product.name}</h3>
                          <p className="text-sm text-gray-700">{product.storeName}</p>
                          <p className="mt-2 font-semibold text-gray-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6"><h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Kenapa Memilih Si-UMKM?</h2><div className="grid md:grid-cols-3 gap-8"><FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} title="Publikasi Produk Mudah" description="Daftarkan dan tampilkan produk Anda ke jutaan calon pembeli dengan beberapa klik saja." /><FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0" /></svg>} title="Program Pembinaan" description="Akses jadwal dan materi pelatihan resmi dari pemerintah untuk meningkatkan skill bisnis Anda." /><FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Ulasan & Rating Terpercaya" description="Bangun reputasi usaha Anda melalui sistem ulasan dan rating yang transparan dari pelanggan." /></div></div>
        </section>
        
        <section id="products" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Produk Unggulan dari UMKM Lokal</h2>
            {initialProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {initialProducts.map(product => <ProductCard key={product.id} {...product} />)}
                </div>
            ) : (
                <p className="text-center text-gray-500">Belum ada produk yang ditambahkan.</p>
            )}
          </div>
        </section>
        
        <footer id="contact" className="bg-gray-800 text-white py-10">
            <div className="container mx-auto px-6 text-center">
                <p>&copy; {new Date().getFullYear()} Si-UMKM Purwokerto. All Rights Reserved.</p>
                <p className="text-sm text-gray-400 mt-2">Created by Raihan Al Arsy</p>
            </div>
        </footer>
      </main>
    </div>
  )
}
