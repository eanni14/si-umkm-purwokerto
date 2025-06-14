import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming '@/lib/firebase' exports your Firestore db instance
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize JSDOM and DOMPurify for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Define the type for the context object, specifically for the params
interface ProductContext {
  params: {
    productId: string;
  };
}

/**
 * Handles GET requests for a specific product by its ID.
 * Fetches product data from Firestore.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {ProductContext} context - The context object containing dynamic route parameters.
 * @returns {NextResponse} - The JSON response containing the product data or an error message.
 */
export async function GET(
  request: NextRequest,
  context: ProductContext // Using the defined interface for correct typing
) {
  try {
    const { productId } = context.params;

    // Validate productId presence
    if (!productId) {
      return NextResponse.json({ message: 'Product ID tidak ditemukan' }, { status: 400 });
    }

    // Reference to the product document in Firestore
    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);

    // Check if the product document exists
    if (!docSnap.exists()) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Return the product data with its ID
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a specific product by its ID.
 * Updates product data in Firestore after sanitization.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {ProductContext} context - The context object containing dynamic route parameters.
 * @returns {NextResponse} - The JSON response confirming the update or an error message.
 */
export async function PUT(
  request: NextRequest,
  context: ProductContext // Using the defined interface for correct typing
) {
  try {
    const { productId } = context.params;
    const body = await request.json();
    const { name, description, price } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Sanitize input data to prevent XSS attacks
    const sanitizedName = purify.sanitize(name);
    const sanitizedDescription = purify.sanitize(description);

    // Reference to the product document in Firestore
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      name: sanitizedName,
      description: sanitizedDescription,
      price,
    });

    // Return success message
    return NextResponse.json({ message: 'Produk berhasil diperbarui' }, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a specific product by its ID.
 * Deletes product data from Firestore.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {ProductContext} context - The context object containing dynamic route parameters.
 * @returns {NextResponse} - The JSON response confirming the deletion or an error message.
 */
export async function DELETE(
  request: NextRequest,
  context: ProductContext // Using the defined interface for correct typing
) {
  try {
    const { productId } = context.params;

    // Reference to the product document in Firestore
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);

    // Return success message
    return NextResponse.json({ message: 'Produk berhasil dihapus' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
