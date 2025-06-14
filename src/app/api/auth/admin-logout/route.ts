import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Buat respons
        const response = NextResponse.json({ message: "Logout berhasil" });
        
        // Hapus cookie dengan mengatur maxAge menjadi 0
        response.cookies.set('admin_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Terjadi kesalahan" }, { status: 500 });
    }
}
