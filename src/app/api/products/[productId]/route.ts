import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify untuk sanitasi input
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// GET handler - ambil produk by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }

    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler - update produk
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
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

  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler - hapus produk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
