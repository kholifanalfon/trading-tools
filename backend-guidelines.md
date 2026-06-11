# Backend Guidelines

Dokumen ini menjelaskan standardisasi arsitektur, konvensi penamaan, pattern kode, batasan antar layer, serta strategi pengujian untuk aplikasi Backend (`apps/backend`).

---

## 1. Architecture

*   **Modular / Feature-Driven**: Kelompokkan berkas backend berdasarkan domain fitur untuk mempermudah skalabilitas dan pemeliharaan kode.
*   **Global Infrastructure**: Simpan infrastruktur atau modul global di dalam folder `src/core/`, yang meliputi:
    *   `config.ts` — Konfigurasi aplikasi (environment variables parser & validator)
    *   `logger.ts` — Setup logger terstruktur menggunakan Pino
    *   `error-handler.ts` — Global error handler middleware
    *   `middlewares/` — Middleware umum seperti Auth (Jose JWT verify) dan validation middleware

### Contoh Struktur Folder: `apps/backend/`
```
src/modules/[feature-name]/
├── [feature-name].controller.ts   # Layer HTTP — Express Router & Handler
├── [feature-name].service.ts      # Layer Bisnis — Business logic & rules
├── [feature-name].repository.ts   # Layer Data — Drizzle ORM queries
├── [feature-name].schema.ts       # Layer Validasi — Zod schemas
└── [feature-name].routes.ts       # Route registration
```

---

## 2. File Naming

Semua file fisik wajib menggunakan format `kebab-case`. Suffix pada nama file mengidentifikasi layer dari file tersebut.

| Jenis File | Suffix Wajib | Contoh File | Contoh Class/Fungsi |
| :--- | :--- | :--- | :--- |
| Controller | `.controller.ts` | `order-management.controller.ts` | `OrderController` |
| Service | `.service.ts` | `order-management.service.ts` | `OrderService` |
| Repository | `.repository.ts` | `order-management.repository.ts` | `OrderRepository` |
| Schema | `.schema.ts` | `order-management.schema.ts` | `CreateOrderSchema` |
| Routes | `.routes.ts` | `order-management.routes.ts` | — |

---

## 3. Code-Level Casing

| Casing | Kapan Digunakan | Contoh |
| :--- | :--- | :--- |
| `camelCase` | Variabel, properti objek, fungsi/metode, dan instance class | `const currentOrder = await orderRepository.getById(orderId)` |
| `snake_case` | Kolom database Drizzle ORM, payload API (jika standar perusahaan) | `created_at: timestamp('created_at')` |
| `PascalCase` | Class, Interface, Type, dan Skema Zod | `class OrderController`, `type UserPayload` |
| `kebab-case` | File, nama folder, dan endpoint URL | `/api/v1/order-management` |

---

## 4. Design Pattern

1.  **Repository Pattern**: Memisahkan logika kueri database (Drizzle ORM) dari logika bisnis utama. Logika bisnis hanya memanggil method repositori tanpa perlu tahu struktur kueri SQL di bawahnya.
2.  **Middleware Chain & Schema-Driven Validation**: Menggunakan Express middleware chain secara berurutan untuk penanganan autentikasi (menggunakan Jose JWT) dan validasi input (menggunakan skema Zod) sebelum request diproses oleh controller.

### Alur Request (Request Lifecycle)
```
Route
  → Auth Middleware (Jose)
    → Validation Middleware (Zod)
      → Controller (Kirim HTTP Response)
        → Service (Business Logic / Transaction)
          → Repository (Query Drizzle)
            → Database
```

---

## 5. Layer Boundaries & Rules

Untuk menjaga pemisahan tanggung jawab (separation of concerns), patuhi aturan batas layer berikut:

| Layer | Boleh | DILARANG |
| :--- | :--- | :--- |
| **Controller** | Parse incoming request data, kirim HTTP responses (status code, body), panggil service layer. | Melakukan kueri database secara langsung, menampung logika bisnis (rules/calculations). |
| **Service** | Logika bisnis utama, validasi aturan bisnis, orkestrasi transaksi antar repositori. | Melakukan kueri database langsung (tanpa melalui repositori), mengirim HTTP response secara langsung. |
| **Repository** | Melakukan query database menggunakan Drizzle ORM (insert, select, update, delete). | Menampung logika bisnis, mengirim HTTP response. |

---

## 6. Testing — Backend

Pengujian aplikasi backend dikelola dengan strategi berikut:

| Tool/Strategi | Fungsi |
| :--- | :--- |
| **`bun test`** | Built-in test runner dari Bun yang sangat cepat untuk mengeksekusi test suite. |
| **Database Instan** | Menggunakan SQLite in-memory untuk pengujian cepat atau container PostgreSQL terisolasi (via Docker) untuk integration testing. |
| **Full-flow testing** | Menguji fungsionalitas dari hulu ke hilir: `Controller` $\rightarrow$ `Service` $\rightarrow$ `Repository`. |
| **Mocking** | Melakukan mocking untuk dependensi eksternal (misal: third-party API payment gateway, email sender). |
