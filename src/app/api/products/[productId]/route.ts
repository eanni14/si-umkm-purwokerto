// src/app/api/products/[productId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// PERBAIKAN: Menghapus tipe RouteContext yang custom

// Handler untuk GET (Mengambil satu produk)
// PERBAIKAN: Mendefinisikan tipe parameter secara inline
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

  } catch (error: unknown) {
    console.error("Error getting document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk PUT (Memperbarui produk)
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await request.json();
    const { name, description, price } = body;

    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }
    if (!name || !description || !price) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const sanitizedName = purify.sanitize(name);
    const sanitizedDescription = purify.sanitize(description);

    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      name: sanitizedName,
      description: sanitizedDescription,
      price
    });

    return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error updating document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk metode DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }

    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });
  
  } catch (error: unknown) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
