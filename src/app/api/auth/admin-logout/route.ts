import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: "Logout berhasil" });
        
        response.cookies.set('admin_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 0,
            path: '/',
        });

        return response;
    // PERBAIKAN: Mengganti 'any' dengan 'unknown' dan melakukan pengecekan tipe
    } catch (error: unknown) {
        let message = "Terjadi kesalahan";
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json({ message }, { status: 500 });
    }
}
