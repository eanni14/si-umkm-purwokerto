// src/app/produk/[productId]/page.tsx

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types/product';
import { notFound } from 'next/navigation';
import ProductImage from '@/components/ProductImage';

export async function generateStaticParams() {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const products = productSnapshot.docs.map(doc => ({
      productId: doc.id,
    }));
    return products;
  // PERBAIKAN: Memberikan tipe 'unknown' pada error
  } catch (error: unknown) {
    console.error("Gagal membuat parameter statis:", error);
    return [];
  }
}

async function getProductData(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  // PERBAIKAN: Memberikan tipe 'unknown' pada error
  } catch (error: unknown) {
    console.error("Gagal mengambil data produk:", error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = await getProductData(params.productId);

  if (!product) {
    notFound();
  }
  
  const imageSrc = product.imageUrl || `https://placehold.co/800x600/e2e8f0/334155?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="bg-gray-50 min-h-screen">
       <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">Si-UMKM Purwokerto</a>
            <a href="/#products" className="text-blue-600 hover:underline">&larr; Kembali ke Katalog</a>
          </div>
       </header>

       <main className="container mx-auto p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        <div className="relative h-64 w-full md:w-80">
                            <ProductImage src={imageSrc} alt={product.name} />
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{product.storeName || 'Toko UMKM'}</div>
                        <h1 className="mt-1 text-3xl leading-tight font-extrabold text-gray-900">{product.name}</h1>
                        <p className="mt-4 text-gray-600">{product.description}</p>
                        <p className="mt-6 text-4xl font-bold text-gray-900">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                        </p>
                        <button className="mt-8 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                            Hubungi Penjual
                        </button>
                    </div>
                </div>
            </div>
       </main>
    </div>
  );
}
