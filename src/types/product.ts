    // src/types/product.ts
    
    import { Timestamp } from "firebase/firestore";
    
    export type Product = {
        id: string;
        name: string;
        description: string;
        price: number;
        storeName: string;
        ownerId: string;
        imageUrl?: string;
        reviewCount?: number; // Tambahkan ini
        averageRating?: number; // Tambahkan ini
        createdAt?: Timestamp;
    };
    