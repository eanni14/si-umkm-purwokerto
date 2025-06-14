import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Inisialisasi DOMPurify untuk lingkungan server (Node.js)
const window = new JSDOM('').window;
const purify = DOMPurify(window);


// Handler untuk GET (Mengambil satu produk)
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
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
    console.error("Error getting document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk PUT (Memperbarui produk)
export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const body = await request.json();
    const { name, description, price } = body;

    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }
    if (!name || !description || !price) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // SANITASI INPUT: Bersihkan data sebelum diperbarui
    const sanitizedName = purify.sanitize(name);
    const sanitizedDescription = purify.sanitize(description);

    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      name: sanitizedName,
      description: sanitizedDescription,
      price
    });

    return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });

  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk metode DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }

    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });
  
  } catch (error) {
    console.error("Error deleting document: ", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
