import { NextResponse, NextRequest } from 'next/server';
import { doc, getDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Handler untuk metode DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const reviewId = params.reviewId;
    const { userId } = await request.json(); // Ambil userId dari body untuk verifikasi

    if (!reviewId || !userId) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      return NextResponse.json({ message: 'Ulasan tidak ditemukan' }, { status: 404 });
    }

    const reviewData = reviewSnap.data();

    // Verifikasi Keamanan: Pastikan userId yang meminta sama dengan userId pemilik ulasan
    if (reviewData.userId !== userId) {
      return NextResponse.json({ message: 'Anda tidak berhak menghapus ulasan ini' }, { status: 403 });
    }

    // Jalankan transaksi untuk menghapus ulasan dan memperbarui rating produk
    const productRef = doc(db, "products", reviewData.productId);
    await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw new Error("Produk terkait tidak ditemukan!");
        }

        // Hapus ulasan
        transaction.delete(reviewRef);

        // Hitung ulang rating
        const data = productDoc.data();
        const oldReviewCount = data.reviewCount || 0;
        const oldAverageRating = data.averageRating || 0;
        const deletedRating = reviewData.rating;

        const newReviewCount = oldReviewCount > 0 ? oldReviewCount - 1 : 0;
        
        let newAverageRating = 0;
        if (newReviewCount > 0) {
            newAverageRating = ((oldAverageRating * oldReviewCount) - deletedRating) / newReviewCount;
        }

        // Perbarui produk
        transaction.update(productRef, { 
            reviewCount: newReviewCount,
            averageRating: newAverageRating
        });
    });

    return NextResponse.json({ message: 'Ulasan berhasil dihapus' }, { status: 200 });
  
  } catch (error: any) {
    console.error("Error deleting review: ", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
