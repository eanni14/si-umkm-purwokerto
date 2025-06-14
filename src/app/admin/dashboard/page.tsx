import AdminHeaderClient from "@/components/AdminHeaderClient";
// 'cookies' dan 'redirect' tidak lagi diperlukan di sini karena sudah ditangani middleware
// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';

// Definisikan tipe untuk statistik
type DashboardStats = {
    totalProducts: number;
};

// Fungsi ini akan berjalan di server untuk setiap permintaan
async function getStats(): Promise<DashboardStats> {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        // 'no-store' adalah kunci dari SSR, memastikan data selalu baru
        const res = await fetch(`${apiBaseUrl}/api/products`, { cache: 'no-store' });
        
        if (!res.ok) {
            throw new Error('Gagal mengambil data statistik');
        }
        
        const products = await res.json();
        
        return {
            totalProducts: products.length,
        };

    } catch (error) {
        console.error(error);
        return { totalProducts: 0 };
    }
}

// Ini adalah Server Component
export default async function AdminDashboardPage() {
    // Keamanan rute ini sudah sepenuhnya ditangani oleh middleware.ts.
    
    // Panggil fungsi untuk mengambil data di server
    const stats = await getStats();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header sekarang menjadi komponen terpisah */}
            <AdminHeaderClient />
            
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Bagian Selamat Datang */}
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                            {/* PERUBAHAN: Menambahkan class `text-gray-900` */}
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Selamat Datang, Admin!</h2>
                            <p className="text-gray-700">
                                Ini adalah ringkasan aktivitas di platform Si-UMKM.
                            </p>
                        </div>
                    </div>

                    {/* Bagian Statistik */}
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Statistik Saat Ini
                        </h3>
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                            {/* Kartu Statistik: Total Produk */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7l8 4" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Produk
                                                </dt>
                                                <dd className="text-3xl font-semibold text-gray-900">
                                                    {stats.totalProducts}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Kartu statistik lainnya bisa ditambahkan di sini */}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
