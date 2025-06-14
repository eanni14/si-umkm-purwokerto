import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// GET handler
export async function GET(
  request: NextRequest,
  context: any // ✅ GUNAKAN 'any' agar TypeScript tidak error saat build
) {
  const { productId } = context.params;

  if (!productId) {
    return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
  }

  const productRef = doc(db, 'products', productId);
  const docSnap = await getDoc(productRef);

  if (!docSnap.exists()) {
    return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
}

// PUT handler
export async function PUT(
  request: NextRequest,
  context: any // ✅ pakai 'any'
) {
  const { productId } = context.params;
  const body = await request.json();
  const { name, description, price } = body;

  if (!name || !description || !price) {
    return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
  }

  const sanitizedName = purify.sanitize(name);
  const sanitizedDescription = purify.sanitize(description);

  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    name: sanitizedName,
    description: sanitizedDescription,
    price,
  });

  return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  context: any // ✅ pakai 'any'
) {
  const { productId } = context.params;

  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);

  return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });
}
