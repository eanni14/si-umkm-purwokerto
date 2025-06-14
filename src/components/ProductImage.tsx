'use client';

import Image from 'next/image';

type ProductImageProps = {
  src: string;
  alt: string;
};

// Komponen ini ditandai sebagai 'use client' karena menggunakan event handler onError.
export default function ProductImage({ src, alt }: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      layout="fill"
      objectFit="cover"
      onError={(e) => {
        // Fallback jika URL gambar rusak
        e.currentTarget.src = `https://placehold.co/800x600/e2e8f0/334155?text=Error`;
      }}
    />
  );
}
