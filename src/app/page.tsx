import HomepageClient from "@/components/HomepageClient";
import type { Product } from '@/types/product';

// Fungsi untuk mengambil data produk dari API kita
async function getProducts() {
  try {
    // URL absolut diperlukan untuk fetch di sisi server
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBaseUrl}/api/products`, {
      // Ini adalah kunci dari Incremental Static Regeneration (ISR)
      // Halaman akan dibuat statis, tapi akan coba dibuat ulang setiap 60 detik
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      throw new Error('Gagal mengambil data produk');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return []; // Kembalikan array kosong jika terjadi error
  }
}

export default async function HomePage() {
  const products: Product[] = await getProducts();

  return <HomepageClient initialProducts={products} />;
}
