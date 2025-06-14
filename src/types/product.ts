import { Timestamp } from "firebase/firestore";

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    storeName: string;
    ownerId: string;
    imageUrl?: string;
    reviewCount?: number;
    averageRating?: number;
    // PERBAIKAN: Mengganti 'any' dengan tipe Timestamp yang lebih spesifik
    createdAt?: Timestamp;
};
