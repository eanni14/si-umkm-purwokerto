import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/context/AuthContext";
import ApolloProviderWrapper from "@/lib/ApolloProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Si-UMKM Purwokerto", // PERUBAHAN
  description: "Platform Digital UMKM Purwokerto", // PERUBAHAN
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>
          <ApolloProviderWrapper>
            {children}
          </ApolloProviderWrapper>
        </AuthContextProvider>
      </body>
    </html>
  );
}
