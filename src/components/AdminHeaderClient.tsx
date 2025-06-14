'use client';

import { useRouter } from 'next/navigation';

// Komponen ini khusus menangani interaktivitas pada header admin
export default function AdminHeaderClient() {
    const router = useRouter();

    const handleLogout = async () => {
        // Panggil API untuk menghapus cookie token
        const response = await fetch('/api/auth/admin-logout', {
            method: 'POST',
        });

        if (response.ok) {
            // Jika berhasil, alihkan ke halaman login admin
            router.push('/admin/login');
        } else {
            alert('Gagal untuk keluar.');
        }
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Keluar
                </button>
            </div>
        </header>
    );
}
