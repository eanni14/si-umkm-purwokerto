// src/app/api/graphql/route.ts

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextRequest } from 'next/server';

const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String
    description: String
    price: Float
    storeName: String
    imageUrl: String
  }

  type Query {
    searchProducts(term: String!): [Product]
  }
`;

const resolvers = {
  Query: {
    searchProducts: async (_: unknown, { term }: { term: string }) => {
      try {
        if (!term) return [];
        
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('name', '>=', term),
          where('name', '<=', term + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const products: object[] = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
        
        return products;
      } catch (error) {
        console.error("Error searching products:", error);
        throw new Error("Gagal melakukan pencarian produk.");
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Buat handler sekali
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req: NextRequest) => ({ req }),
});

// PERBAIKAN: Ekspor fungsi GET dan POST secara eksplisit
// Ini memastikan tipe data yang diekspor sesuai dengan yang diharapkan oleh Next.js
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
