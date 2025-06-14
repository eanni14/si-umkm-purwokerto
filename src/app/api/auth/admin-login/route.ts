import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const ADMIN_USERNAME = "admin";
        const ADMIN_PASSWORD = "password123";

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT Secret Key belum diatur di .env.local");
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { username: username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            const response = NextResponse.json({ message: "Login berhasil" });
            response.cookies.set('admin_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60,
                path: '/',
            });
            return response;

        } else {
            return NextResponse.json({ message: "Username atau password salah" }, { status: 401 });
        }

    // PERBAIKAN: Mengganti 'any' dengan 'unknown' dan melakukan pengecekan tipe
    } catch (error: unknown) {
        let message = "Terjadi kesalahan internal";
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json({ message }, { status: 500 });
    }
}
