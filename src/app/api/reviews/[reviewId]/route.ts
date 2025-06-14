import { NextResponse, NextRequest } from 'next/server';
import { doc, getDoc, runTransaction } from 'firebase/firestore'; // PERBAIKAN: Hapus deleteDoc yang tidak terpakai
import { db } from '@/lib/firebase';

export async function DELETE(
  request: NextRequest, { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId;
    const { userId } = await request.json(); 
    if (!reviewId || !userId) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);
    if (!reviewSnap.exists()) {
      return NextResponse.json({ message: 'Ulasan tidak ditemukan' }, { status: 404 });
    }
    const reviewData = reviewSnap.data();
    if (reviewData.userId !== userId) {
      return NextResponse.json({ message: 'Anda tidak berhak menghapus ulasan ini' }, { status: 403 });
    }
    const productRef = doc(db, "products", reviewData.productId);
    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) throw new Error("Produk terkait tidak ditemukan!"); // PERBAIKAN: Gunakan 'new Error'
        transaction.delete(reviewRef);
        const data = productDoc.data();
        const oldReviewCount = data.reviewCount || 0;
        const oldAverageRating = data.averageRating || 0;
        const deletedRating = reviewData.rating;
        const newReviewCount = oldReviewCount > 0 ? oldReviewCount - 1 : 0;
        let newAverageRating = 0;
        if (newReviewCount > 0) {
            newAverageRating = ((oldAverageRating * oldReviewCount) - deletedRating) / newReviewCount;
        }
        transaction.update(productRef, { 
            reviewCount: newReviewCount,
            averageRating: newAverageRating
        });
    });
    return NextResponse.json({ message: 'Ulasan berhasil dihapus' }, { status: 200 });
  } catch (error: unknown) { // PERBAIKAN
    console.error("Error deleting review: ", error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}