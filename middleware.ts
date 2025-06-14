import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
        // Jika tidak ada token, alihkan ke halaman login
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
        // Verifikasi token
        await jwtVerify(token, JWT_SECRET);
        // Jika token valid, lanjutkan ke halaman yang diminta
        return NextResponse.next();
    } catch (error) {
        // Jika token tidak valid (kadaluarsa, salah, dll.), alihkan ke halaman login
        console.error('JWT Verification Error:', error);
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }
}

// Konfigurasi Matcher: Middleware ini HANYA akan berjalan
// untuk rute yang cocok dengan pola di bawah ini.
export const config = {
    matcher: '/admin/dashboard/:path*',
};
