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
    // PERBAIKAN: Memberikan tipe yang sesuai untuk parameter yang tidak digunakan
    searchProducts: async (_: unknown, { term }: { term: string }) => {
      try {
        if (!term) {
          return [];
        }
        
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('name', '>=', term),
          where('name', '<=', term + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const products: object[] = []; // Memberikan tipe object[] yang lebih spesifik
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

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    // PERBAIKAN: Memberikan tipe NextRequest pada parameter 'req'
    context: async (req: NextRequest) => ({ req }),
});

export { handler as GET, handler as POST };
