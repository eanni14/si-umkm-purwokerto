import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// 'cookies' tidak lagi dibutuhkan untuk mengatur cookie, jadi bisa dihapus jika hanya untuk 'set'
// import { cookies } from 'next/headers'; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Di aplikasi nyata, Anda akan memeriksa kredensial ini di database.
        // Untuk saat ini, kita gunakan nilai yang di-hardcode.
        const ADMIN_USERNAME = "admin";
        const ADMIN_PASSWORD = "password123";

        // Ambil secret key dari variabel lingkungan
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT Secret Key belum diatur di .env.local");
        }

        // Periksa apakah kredensial cocok
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Jika cocok, buat token JWT
            const token = jwt.sign(
                { username: username, role: 'admin' }, // Payload token
                JWT_SECRET, // Secret key
                { expiresIn: '1h' } // Token akan kadaluarsa dalam 1 jam
            );

            // PERBAIKAN: Buat respons terlebih dahulu, lalu atur cookie padanya
            const response = NextResponse.json({ message: "Login berhasil" });
            
            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60, // 1 jam dalam detik
                path: '/',
            });

            return response;

        } else {
            // Jika kredensial salah
            return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
        }

    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Terjadi kesalahan internal" }, { status: 500 });
    }
}
