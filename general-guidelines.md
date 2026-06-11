# General Guidelines & Tech Stack

Dokumen ini menjelaskan standardisasi teknologi, struktur monorepo, konfigurasi environment, database management, dan alur kolaborasi/deployment (Git & CI/CD) untuk project ini.

---

## 1. Tech Stack

### Frontend (React + TypeScript via Vite)
*   **Tailwind CSS**: Utility-first CSS untuk styling yang cepat dan responsif.
*   **Shadcn UI**: Koleksi komponen UI yang modular dan dapat dikustomisasi sepenuhnya.
*   **React Router**: Library routing client-side yang responsif.
*   **React Hook Form**: Library ringan untuk manajemen form state secara performant.
*   **Zod**: Validasi skema runtime dan type inference yang aman.
*   **Zustand**: Global state management yang ringkas, cepat, dan minim boilerplate.
*   **TanStack Query**: Manajemen server state, caching, data fetching, dan sinkronisasi data.

### Backend (Express + Bun)
*   **Bun**: Runtime JavaScript/TypeScript yang cepat untuk eksekusi server.
*   **Express**: Framework web minimalis untuk REST API.
*   **Drizzle ORM**: ORM SQL yang type-safe, cepat, dan SQL-like.
*   **Zod**: Validasi skema input request (body, query params, path params).
*   **Jose**: Library JWT (sign, verify, encrypt) yang ringan dan aman.
*   **Pino**: Structured logger berkinerja tinggi untuk debugging dan monitoring.
*   **Dotenv**: Pemuatan variable environment dari file `.env`.

### Database & Pooling
*   **PostgreSQL**: Database utama relasional.
*   **PgBouncer / Supavisor**: Connection pooling layer.
    *   **PENTING**: Aplikasi backend **HARUS** terhubung melalui PgBouncer atau Supavisor, **BUKAN** langsung ke PostgreSQL instans dasar.
    *   **Mode Pooling**: **Transaction Mode** (untuk efisiensi koneksi tinggi).

### Documentation
*   **Docusaurus**: Menampung dokumentasi arsitektur sistem, SOP tim, dan panduan development.
*   **Scalar (`@scalar/express-api-reference`)**: API reference interaktif yang dibuat secara otomatis dari spesifikasi OpenAPI/Swagger di Express.

---

## 2. Monorepo Structure

Project ini diorganisasikan menggunakan workspace monorepo dengan struktur direktori sebagai berikut:

```
ROOT /
├── .github/workflows/                      # CI/CD Pipelines — GitHub Actions
├── commands/                               # Custom CLI commands (dipanggil via root package.json)
├── docker/
│   ├── backend/                            # Dockerfile, entrypoint.sh
│   ├── frontend/                           # Dockerfile, nginx.conf
│   └── docs/                               # Dockerfile
├── apps/
│   ├── backend/                            # Aplikasi Backend (Express + Bun)
│   ├── frontend/                           # Aplikasi Frontend (React + Vite)
│   └── docs/                               # Dokumentasi Teknis & SOP (Docusaurus)
├── .env                                    # SINGLE env file (FE_, BE_, DOCS_ prefixes)
├── .env.example                            # Template file environment
├── docker-compose.yml                      # Orkestrasi container lokal
└── package.json                            # Root workspace & script CLI utama
```

---

## 3. Environment Configuration

Untuk mempermudah manajemen konfigurasi, digunakan **satu (1) file `.env` di level ROOT** yang dibagikan ke seluruh sub-aplikasi di folder `apps/`. Untuk membedakan kebutuhan environment masing-masing aplikasi, wajib menggunakan prefix:

*   `FE_` : Digunakan khusus oleh aplikasi Frontend (`apps/frontend`).
*   `BE_` : Digunakan khusus oleh aplikasi Backend (`apps/backend`).
*   `DOCS_` : Digunakan khusus oleh aplikasi Dokumentasi (`apps/docs`).

### Contoh `.env` File
```env
# Database Configuration (Lewat PgBouncer/Supavisor)
BE_DATABASE_URL=postgresql://user:password@pgbouncer-host:6543/dbname?sslmode=require

# Backend Config
BE_PORT=3000
BE_JWT_SECRET=super_secret_jwt_key
BE_LOG_LEVEL=info

# Frontend Config
FE_VITE_API_URL=https://api.dev.trader.com
FE_APP_TITLE=Trader Platform

# Docs Config
DOCS_PORT=4000
```

---

## 4. Database CLI Commands

Seluruh perintah pengelolaan database dijalankan menggunakan command custom CLI dari root workspace. CLI command ini didefinisikan di dalam folder `commands/` dan dipetakan di `package.json` root.

Berikut daftar CLI commands yang wajib dibuat dan digunakan:

*   `npm run db-generate` : Membuat file migrasi baru berdasarkan perubahan skema Drizzle.
*   `npm run db-migrate` : Menjalankan file migrasi yang belum teraplikasikan ke database.
*   `npm run db-introspect` : Melakukan *reverse-engineer* skema database yang sudah ada menjadi skema Drizzle.
*   `npm run db-seed` : Menjalankan file seeders untuk mengisi data awal database.
*   `npm run make-migration` : Membuat berkas migrasi kustom/kosong di direktori `apps/backend/src/db/generators`.
*   `npm run make-seeder` : Membuat berkas seeder baru di direktori `apps/backend/src/db/seeders`.

---

## 5. Branching & Git Workflow

### Branch Utama
Proses development dikelola melalui **3 branch utama**:
1.  `main`: Representasi lingkungan Production.
2.  `test`: Lingkungan Testing / Staging untuk QA & User Acceptance Testing (UAT).
3.  `development`: Lingkungan Development tempat fitur baru diintegrasikan terlebih dahulu.

### Alur Pengembangan Fitur (Git Flow)
1.  Developer dilarang melakukan push langsung ke branch `main`, `test`, maupun `development`.
2.  Setiap fitur, perbaikan bug, atau tugas baru harus dibuat di branch sementara yang dicabangkan dari `development`:
    *   Format penamaan branch: `feature/nama-fitur`, `bugfix/nama-bug`, atau `hotfix/nama-hotfix`.
3.  Setelah selesai dikerjakan, buat **Pull Request (PR)** menuju branch `development`.
4.  PR harus ditinjau (code review) dan lolos tes build/lint sebelum digabungkan (merged).
5.  Promosi kode dilakukan berurutan:
    `feature branch` $\rightarrow$ `development` $\rightarrow$ `test` $\rightarrow$ `main`.

---

## 6. CI/CD (GitHub Actions)

Alur CI/CD dikonfigurasi menggunakan GitHub Actions di bawah folder `.github/workflows/`.

Setiap kali terjadi push atau merge pada salah satu branch utama (`main`, `development`, `test`), pipeline otomatis akan dipicu:

### Pipeline Build
*   Mendeteksi perubahan file pada aplikasi terkait (`apps/backend`, `apps/frontend`, atau `apps/docs`).
*   Menjalankan proses build Docker image menggunakan Dockerfile yang sesuai di folder `docker/`:
    *   Backend: Menggunakan `docker/backend/Dockerfile`
    *   Frontend: Menggunakan `docker/frontend/Dockerfile` dengan Nginx sebagai web server static file.
    *   Docs: Menggunakan `docker/docs/Dockerfile`
*   Melakukan push image yang berhasil di-build ke registry container (misal: GitHub Container Registry / Docker Hub / AWS ECR).

### Pipeline Deployment
*   **Branch `development`**: Mendeploy aplikasi yang diperbarui ke server lingkungan **Development**.
*   **Branch `test`**: Mendeploy aplikasi yang diperbarui ke server lingkungan **Testing / Staging**.
*   **Branch `main`**: Mendeploy aplikasi yang diperbarui ke server lingkungan **Production**.
