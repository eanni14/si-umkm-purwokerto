// src/components/ProductCard.tsx

import Image from 'next/image';
import type { Product } from '@/types/product';

// Gunakan 'Pick' untuk memilih hanya properti yang dibutuhkan
type ProductCardProps = Pick<Product, 'id' | 'name' | 'storeName' | 'price' | 'imageUrl' | 'averageRating' | 'reviewCount'>;

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const ProductCard = ({ id, name, storeName, price, imageUrl, averageRating = 0, reviewCount = 0 }: ProductCardProps) => {
  const imageSrc = imageUrl || `https://placehold.co/400x300/e2e8f0/334155?text=${encodeURIComponent(name)}`;

  return (
    <a href={`/produk/${id}`} className="block group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300">
        <div className="relative w-full h-48">
          <Image src={imageSrc} alt={name} layout="fill" objectFit="cover" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/e2e8f0/334155?text=Error`; }} />
        </div>
        <div className="p-4">
          <h4 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{name}</h4>
          <p className="text-gray-500 text-sm mb-2">{storeName || 'Toko UMKM'}</p>
          <div className="flex items-center mb-2">
              <StarRating rating={averageRating} />
              <span className="text-xs text-gray-500 ml-2">({reviewCount} ulasan)</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)}
          </p>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
