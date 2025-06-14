# Dockerfile

# --- Tahap 1: Base ---
# Gunakan image resmi Node.js versi Long-Term Support (LTS) yang ramping
FROM node:18-alpine AS base

# --- Tahap 2: Dependensi ---
# Hanya install dependensi yang dibutuhkan
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# --- Tahap 3: Builder ---
# Copy semua file dan build aplikasi
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pastikan variabel lingkungan untuk build ada (jika diperlukan)
# ENV NEXT_PUBLIC_API_URL=http://example.com

# Jalankan build Next.js
RUN npm run build

# --- Tahap 4: Runner (Produksi) ---
# Siapkan image final yang ramping untuk produksi
FROM base AS runner
WORKDIR /app

# Set environment ke produksi
ENV NODE_ENV=production

# Copy file build dari tahap 'builder'
COPY --from=builder /app/public ./public

# Konfigurasi untuk Next.js Standalone Output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port yang digunakan oleh Next.js
EXPOSE 3000

# Variabel lingkungan untuk port
ENV PORT 3000

# Perintah untuk menjalankan aplikasi saat kontainer dimulai
# Menggunakan server.js dari output standalone
CMD ["node", "server.js"]
