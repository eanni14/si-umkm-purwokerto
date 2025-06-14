import { NextResponse, NextRequest } from 'next/server';
import { collection, addDoc, getDocs, query, where, serverTimestamp, runTransaction, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    if (!productId) {
      return NextResponse.json({ message: 'Product ID diperlukan' }, { status: 400 });
    }
    const q = query(collection(db, "reviews"), where("productId", "==", productId));
    const querySnapshot = await getDocs(q);
    const reviews: object[] = []; // PERBAIKAN
    querySnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: unknown) { // PERBAIKAN
    console.error("Error getting reviews: ", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, comment } = body;
    if (!productId || !userId || !userName || !rating || !comment) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating harus antara 1 dan 5' }, { status: 400 });
    }
    const sanitizedComment = purify.sanitize(comment);
    await addDoc(collection(db, 'reviews'), {
      productId, userId, userName, rating, comment: sanitizedComment, createdAt: serverTimestamp(),
    });
    const productRef = doc(db, "products", productId);
    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error("Produk tidak ditemukan!"); // PERBAIKAN
        const data = productDoc.data();
        const currentReviewCount = data.reviewCount || 0;
        const currentAverageRating = data.averageRating || 0;
        const newReviewCount = currentReviewCount + 1;
        const newAverageRating = (currentAverageRating * currentReviewCount + rating) / newReviewCount;
        transaction.update(productRef, { 
            reviewCount: newReviewCount,
            averageRating: newAverageRating
        });
    });
    return NextResponse.json({ message: 'Ulasan berhasil ditambahkan' }, { status: 201 });
  } catch (error: unknown) { // PERBAIKAN
    console.error("Error adding review: ", error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}