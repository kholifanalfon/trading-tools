---
description: Code Generation & Verification Workflow Guidelines
---

# Code Generation & Verification Workflow Guidelines

Dokumen ini menjelaskan alur kerja (workflow) pembuatan kode untuk Frontend, Backend, Database Migrations, Seeding, pengisian Environment Variables, serta Quality Gates yang wajib dijalankan sebelum menyelesaikan pekerjaan.

> [!IMPORTANT]
> Seluruh alur pembuatan kode pada workflow ini **WAJIB** merujuk dan menerapkan standardisasi yang didefinisikan dalam dokumen aturan berikut:
> 1. [General Guidelines & Tech Stack](file:///Users/kholifanalfon/Sites/trading/.agents/rules/general-guidelines.md)
> 2. [Backend Guidelines](file:///Users/kholifanalfon/Sites/trading/.agents/rules/backend-guidelines.md)
> 3. [Frontend Guidelines](file:///Users/kholifanalfon/Sites/trading/.agents/rules/frontend-guidelines.md)

---

## 1. Code Generation Workflow

### ATURAN: Saat Antigravity diminta membuat fitur baru, ikuti workflow berikut secara berurutan.

### 1.1 Membuat Fitur Frontend Baru

```
LANGKAH 1 → Buat folder fitur: src/features/[feature-name]/
LANGKAH 2 → Buat file types:    types/[feature-name].types.ts
LANGKAH 3 → Buat file schema:   [feature-name].schema.ts
LANGKAH 4 → Buat file keys:     [feature-name].keys.ts
LANGKAH 5 → Buat file service:  services/[feature-name].api.ts
LANGKAH 6 → Buat custom hooks:  hooks/use-get-[resource].ts, hooks/use-create-[resource].ts
LANGKAH 7 → Buat components:    components/[nama]-table.tsx, dll
LANGKAH 8 → Buat pages:         pages/[feature-name]-list.page.tsx, dll
LANGKAH 9 → Daftarkan route di React Router
```

### 1.2 Membuat Modul Backend Baru

```
LANGKAH 1 → Buat folder modul:  src/modules/[feature-name]/
LANGKAH 2 → Buat file schema:   [feature-name].schema.ts      (Zod input validation)
LANGKAH 3 → Buat file repository: [feature-name].repository.ts (Drizzle queries)
LANGKAH 4 → Buat file service:  [feature-name].service.ts      (Business logic)
LANGKAH 5 → Buat file controller: [feature-name].controller.ts (HTTP handlers)
LANGKAH 6 → Buat file routes:   [feature-name].routes.ts       (Express router)
LANGKAH 7 → Daftarkan routes di app entry point
```

### 1.3 Membuat Migration Database

```
LANGKAH 1 → Jalankan: bun run make:migration -- <nama-migration>
            Contoh:   bun run make:migration -- create-users-table
LANGKAH 2 → Edit file yang dihasilkan di apps/backend/src/db/generators/YYYY-MM-DD_<nama>.ts
LANGKAH 3 → Implementasikan fungsi up() dan down()
LANGKAH 4 → Jalankan: bun run db:migrate
```

> **ATURAN:** Nama migration HARUS `kebab-case`. File otomatis diberi prefix tanggal `YYYY-MM-DD`.

### 1.5 Membuat & Menjalankan Seeder

**Membuat seeder baru:**

```
LANGKAH 1 → Jalankan: bun run make:seeder -- <nama-seeder>
            Contoh:   bun run make:seeder -- users
LANGKAH 2 → Edit file yang dihasilkan di apps/backend/src/db/seeders/[NNN]-<nama>.seeder.ts
LANGKAH 3 → Implementasikan logika seeding di dalam fungsi default export
```

**Menjalankan semua seeder:**

```
LANGKAH 1 → Pastikan database sudah aktif dan migration sudah di-apply
LANGKAH 2 → Jalankan: bun run db:seed
LANGKAH 3 → Verifikasi data yang telah di-seed di database
```

> **ATURAN:** Seeder dieksekusi berurutan berdasarkan prefix angka (`001-`, `002-`, dst.). Setiap seeder HARUS meng-export `default async function`.

### 1.6 Menambah Environment Variable

```
LANGKAH 1 → Tambahkan variable ke .env di root dengan prefix yang sesuai (FE_, BE_, DOCS_)
LANGKAH 2 → Tambahkan template ke .env.example (tanpa nilai sensitif)
LANGKAH 3 → Update config parser di apps/backend/src/core/config.ts (jika BE_)
LANGKAH 4 → Update vite.config.ts atau env.d.ts (jika FE_)
```

---

## 2. Verification & Quality Gates

### ATURAN: Sebelum menyelesaikan pekerjaan, SELALU verifikasi kode dengan langkah berikut.

### 2.1 Checklist Sebelum Selesai

- [ ] **File placement** — Semua file baru berada di lokasi yang benar sesuai monorepo structure.
- [ ] **Naming convention** — Semua file, folder, class, variable mengikuti aturan casing.
- [ ] **Suffix convention** — Semua file memiliki suffix yang benar (`.page.tsx`, `.service.ts`, dll).
- [ ] **Pattern compliance** — Container-Presenter (FE) dan Repository Pattern (BE) diterapkan.
- [ ] **No direct query** — Service TIDAK mengandung query database langsung.
- [ ] **No direct useQuery** — Komponen/Page TIDAK memanggil useQuery/useMutation langsung.
- [ ] **Schema-driven** — Semua form menggunakan Zod + React Hook Form.
- [ ] **Type safety** — Tidak ada `any` type tanpa justifikasi.
- [ ] **Import paths** — Semua import path benar dan tidak ada circular dependency.

### 2.2 Perintah Verifikasi

```bash
# Frontend
cd apps/frontend && bun run lint          # ESLint check
cd apps/frontend && bun run type-check    # TypeScript type check
cd apps/frontend && bun run test          # Vitest

# Backend
cd apps/backend && bun run lint           # ESLint check
cd apps/backend && bun run type-check     # TypeScript type check
cd apps/backend && bun test               # Bun test runner
```

### 2.3 Error Log Review

**ATURAN:** Setelah menjalankan perintah verifikasi di atas, Antigravity WAJIB membaca dan menganalisis output terminal secara menyeluruh. Pekerjaan TIDAK BOLEH dianggap selesai jika masih ada error atau warning yang belum ditangani.

> **KRITIS:** Antigravity **DILARANG** langsung memperbaiki error secara otomatis. SELALU buat laporan error terlebih dahulu dalam artifact `implementation_plan.md`, lalu tunggu persetujuan user sebelum melakukan perbaikan.

#### Alur Penanganan Error

```
LANGKAH 1 → Jalankan semua perintah verifikasi (lint, type-check, test) untuk frontend DAN backend
LANGKAH 2 → Baca SELURUH output terminal — cari keyword: error, Error, ERR, failed, FAIL, warning
LANGKAH 3 → Jika TIDAK ada error → laporkan ke user bahwa semua verifikasi bersih ✅
LANGKAH 4 → Jika DITEMUKAN error:
             a. Kumpulkan SEMUA error dari seluruh output
             b. Buat/update artifact implementation_plan.md berisi laporan error lengkap
             c. Tunggu persetujuan user sebelum melakukan perbaikan apapun
             d. Setelah user approve → perbaiki error sesuai rencana
             e. Jalankan ulang perintah verifikasi
             f. Ulangi dari LANGKAH 2 sampai output bersih
```

#### Format Laporan Error di `implementation_plan.md`

Saat ditemukan error, Antigravity HARUS membuat artifact dengan format berikut:

```markdown
# Error Log Review — [Frontend/Backend/Keduanya]

## Ringkasan

- Total error: [N]
- Total warning: [N]
- Sumber: [lint / type-check / test / runtime]

## Daftar Error

### [Sumber 1] — [N] error(s)

| #   | File              | Baris | Error                 | Penyebab                 | Rencana Perbaikan               |
| --- | ----------------- | ----- | --------------------- | ------------------------ | ------------------------------- |
| 1   | `path/to/file.ts` | 42    | `TS2339: Property...` | Tipe belum didefinisikan | Tambahkan property ke interface |
| 2   | ...               | ...   | ...                   | ...                      | ...                             |

### [Sumber 2] — [N] error(s)

| #   | File | Baris | Error | Penyebab | Rencana Perbaikan |
| --- | ---- | ----- | ----- | -------- | ----------------- |
| 1   | ...  | ...   | ...   | ...      | ...               |

## Proposed Changes

### [File 1]

- Perubahan yang akan dilakukan dan alasannya

### [File 2]

- Perubahan yang akan dilakukan dan alasannya

## User Review Required

> [!IMPORTANT]
> Apakah rencana perbaikan di atas sudah sesuai? Silakan approve atau berikan revisi.
```

#### Referensi Kategori Error

**Frontend:**

| Sumber     | Contoh Error                                               | Kemungkinan Perbaikan               |
| :--------- | :--------------------------------------------------------- | :---------------------------------- |
| ESLint     | `error  '@typescript-eslint/no-unused-vars'`               | Hapus variabel yang tidak dipakai   |
| TypeScript | `TS2339: Property 'x' does not exist on type 'Y'`          | Perbaiki tipe/interface             |
| Vitest     | `FAIL src/features/order/hooks/use-get-orders.test.ts`     | Debug dan perbaiki test case        |
| Import     | `Cannot find module './order-management.types'`            | Perbaiki path import atau buat file |
| React      | `Warning: Each child in a list should have a unique "key"` | Tambahkan prop `key` pada iterasi   |

**Backend:**

| Sumber         | Contoh Error                                            | Kemungkinan Perbaikan                       |
| :------------- | :------------------------------------------------------ | :------------------------------------------ |
| ESLint         | `error  '@typescript-eslint/no-explicit-any'`           | Ganti `any` dengan tipe yang tepat          |
| TypeScript     | `TS2345: Argument of type 'X' is not assignable to 'Y'` | Perbaiki tipe parameter/return              |
| Bun Test       | `FAIL src/modules/order/order.service.test.ts`          | Debug dan perbaiki test case                |
| Drizzle        | `PostgresError: relation "orders" does not exist`       | Jalankan `bun run db:migrate` terlebih dulu |
| Pino (Runtime) | `[ERROR] Error caught in OrderService: ...`             | Trace error ke layer yang sesuai            |
| Import         | `Cannot find module './order-management.repository'`    | Perbaiki path import atau buat file         |

> **KRITIS:** Antigravity DILARANG menutup/menyelesaikan task jika output verifikasi masih mengandung error. Perbaikan HANYA boleh dilakukan setelah user mereview dan menyetujui rencana perbaikan di `implementation_plan.md`.

### 2.4 Aturan Tambahan untuk Antigravity

1.  **JANGAN** menambahkan library baru tanpa persetujuan user.
2.  **JANGAN** mengubah struktur folder yang sudah ada tanpa persetujuan user.
3.  **JANGAN** menulis kode dengan `any` type kecuali benar-benar diperlukan dan diberi komentar alasan.
4.  **SELALU** gunakan named exports, BUKAN default exports.
5.  **SELALU** buat tipe/interface untuk props komponen.
6.  **SELALU** handle error states (loading, error, empty) di setiap page container.
7.  **SELALU** validasi input dengan Zod sebelum operasi mutasi.
8.  **SELALU** gunakan `kebab-case` untuk endpoint URL backend (`/api/v1/order-management`).
9.  **SELALU** sertakan JSDoc/komentar untuk fungsi service dan repository yang kompleks.
10. **SELALU** ikuti alur data satu arah — jangan pernah membalik dependency layer.
