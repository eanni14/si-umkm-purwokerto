import { NextResponse, NextRequest } from 'next/server';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function POST(request: NextRequest) {
  try {
    const csrfCookie = request.cookies.get('csrf-token')?.value;
    const body = await request.json();
    const { name, description, price, ownerId, storeName, csrfToken, imageUrl } = body;

    if (!csrfCookie || !csrfToken || csrfCookie !== csrfToken) {
        return NextResponse.json({ message: 'Token CSRF tidak valid.' }, { status: 403 });
    }
    if (!name || !description || !price || !ownerId || !imageUrl) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }
    const sanitizedName = purify.sanitize(name);
    const sanitizedDescription = purify.sanitize(description);
    const docRef = await addDoc(collection(db, 'products'), {
      name: sanitizedName, description: sanitizedDescription, price, ownerId, storeName, imageUrl, createdAt: serverTimestamp(),
    });
    return NextResponse.json({ message: 'Produk berhasil ditambahkan', productId: docRef.id }, { status: 201 });
  } catch (error: unknown) { // PERBAIKAN
    console.error("Error adding document: ", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    let q = query(collection(db, "products"));
    if (ownerId) {
      q = query(collection(db, "products"), where("ownerId", "==", ownerId));
    }
    const querySnapshot = await getDocs(q);
    const products: object[] = []; // PERBAIKAN
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error: unknown) { // PERBAIKAN
    console.error("Error getting documents: ", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
