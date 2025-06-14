import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    // Buat token acak yang aman
    const token = randomBytes(32).toString('hex');

    // Siapkan respons JSON yang akan berisi token
    const response = NextResponse.json({ csrfToken: token });

    // Atur token yang sama ke dalam httpOnly cookie.
    // Cookie ini tidak bisa dibaca oleh JavaScript di sisi klien, sehingga lebih aman.
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("CSRF Token Generation Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
