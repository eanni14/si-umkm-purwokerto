import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextRequest } from 'next/server';

// 1. Definisikan Skema (Schema) GraphQL Anda
//    Ini seperti "kontrak" yang mendefinisikan data apa yang bisa diminta klien.
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

// 2. Definisikan Resolver
//    Ini adalah kumpulan fungsi yang memberi tahu server BAGAIMANA cara
//    mengambil data untuk setiap field dalam skema.
const resolvers = {
  Query: {
    searchProducts: async (_: any, { term }: { term: string }) => {
      try {
        if (!term) {
          return [];
        }
        
        // Membuat query ke Firestore
        const productsRef = collection(db, 'products');
        // Kita akan melakukan pencarian sederhana berdasarkan nama produk
        // Catatan: Firestore tidak mendukung pencarian teks parsial secara native.
        // Untuk pencarian yang lebih canggih, diperlukan layanan pihak ketiga seperti Algolia/Elasticsearch.
        // Di sini kita men-query nama yang "lebih besar atau sama dengan" istilah pencarian.
        const q = query(
          productsRef,
          where('name', '>=', term),
          where('name', '<=', term + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const products: any[] = [];
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

// 3. Buat instance Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 4. Buat handler Next.js
//    Ini menghubungkan Apollo Server dengan sistem API Route Next.js.
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async req => ({ req }),
});

// Ekspor handler untuk metode GET dan POST
export { handler as GET, handler as POST };
