# Frontend Guidelines

Dokumen ini menjelaskan arsitektur, konvensi penamaan, pattern kode, dan aturan QA untuk aplikasi Frontend (`apps/frontend`).

---

## 1. Architecture

*   **Feature-Driven / Co-Located**: Organisasikan kode berdasarkan modul fitur, bukan berdasarkan jenis teknis file. Simpan semua file yang berhubungan langsung dengan fitur tersebut di dalam folder fitur yang sama.
*   **Shared Infrastructure**: Tambahkan folder `shared` untuk infrastruktur global seperti:
    *   Global types & interfaces
    *   Global Zustand stores
    *   TanStack Query clients & configurations
    *   Global constants, helpers, and utilities

### Contoh Struktur Folder: `apps/frontend/`
```
src/features/[feature-name]/
├── pages/                                    # WAJIB jika fitur > 1 halaman
│   ├── [feature-name]-list.page.tsx          # Halaman index/table
│   └── [feature-name]-detail.page.tsx        # Halaman rincian (gunakan 'detail', BUKAN 'details')
├── components/                               # Komponen UI Presenter (dumb components)
│   ├── [nama]-table.tsx
│   └── [nama]-card.tsx
├── hooks/                                    # Custom hooks TanStack Query facade
│   ├── use-create-[resource].ts
│   └── use-get-[resources].ts
├── services/                                 # Fungsi API client
│   └── [feature-name].api.ts
├── types/                                    # TypeScript types & interfaces
│   └── [feature-name].types.ts
├── [feature-name].schema.ts                  # Zod validation schema
└── [feature-name].keys.ts                    # TanStack Query keys
```

---

## 2. File & Folder Naming

Semua file dan folder **HARUS** menggunakan format `kebab-case` untuk menghindari isu case-sensitivity pada sistem operasi Linux/Docker.

| Jenis | Format | Contoh |
| :--- | :--- | :--- |
| Folder | `kebab-case` | `order-management/` |
| File halaman | `kebab-case` | `order-management-list.page.tsx` |
| File komponen UI | `kebab-case` | `order-table.tsx` |
| File hooks | `kebab-case` | `use-get-orders.ts` |
| File service | `kebab-case` | `order-management.api.ts` |
| File types | `kebab-case` | `order-management.types.ts` |
| File schema | `kebab-case` | `order-management.schema.ts` |
| File query keys | `kebab-case` | `order-management.keys.ts` |

---

## 3. Suffix Wajib

| Jenis File | Suffix Wajib | Ekstensi |
| :--- | :--- | :--- |
| Halaman (Page) | `.page.tsx` | `.tsx` |
| Komponen UI | (tanpa suffix) | `.tsx` |
| Hook | `use-` prefix | `.ts` |
| Service/API | `.api.ts` | `.ts` |
| Types | `.types.ts` | `.ts` |
| Schema | `.schema.ts` | `.ts` |
| Query Keys | `.keys.ts` | `.ts` |

---

## 4. Code-Level Casing

| Casing | Kapan Digunakan | Contoh |
| :--- | :--- | :--- |
| `camelCase` | Fungsi API, hooks, properti objek, variabel, state Zustand | `useGetOrders()`, `orderList`, `handleDelete` |
| `PascalCase` | Komponen React, Tipe/Interface, Skema Zod | `OrderTable`, `OrderPayload`, `CreateOrderSchema` |
| `snake_case` | HANYA jika payload JSON dari backend menggunakan snake_case | Transformasi via Zod `.camelCase()` sebelum dipakai di frontend |
| `kebab-case` | Rute URL React Router | `/order-management`, `/order-management/:id` |

---

## 5. Design Patterns

1.  **Container-Presenter**: Pisahkan logika data fetching/state management (Container/Page) dari komponen visual yang murni merender UI berdasarkan props (Presenter).
2.  **Custom Hook Patterns**: Bungkus query/mutation TanStack Query ke dalam custom hook facade agar komponen halaman tetap bersih dari detail pemanggilan HTTP request.
3.  **Schema-Driven Forms**: Gunakan Zod schema untuk mendefinisikan validasi form, lalu integrasikan dengan React Hook Form untuk manajemen form state secara aman.

### Alur Data (Satu Arah — JANGAN PERNAH DIBALIK)
```
User Action
  → Form Validation (Zod)
    → Page Container
      → Custom Hook Facade (TanStack Query)
        → Service API
          → Server
            → Update Cache / Zustand Store
              → Re-render Presenter via Props
```

---

## 6. Path Alias

Gunakan path alias `@/` yang merujuk ke folder `apps/frontend/src/` untuk mempermudah impor file tanpa menggunakan relative path yang panjang.

*Contoh:*
```typescript
import { Button } from '@/shared/components/button';
import { useGetOrders } from '@/features/order-management/hooks/use-get-orders';
```

---

## 7. Testing — Frontend

| Tool | Fungsi | Kapan Digunakan |
| :--- | :--- | :--- |
| **Vitest** | Test runner cepat | Unit & integration tests |
| **React Testing Library** | Interaksi pengguna ke DOM | Component testing |
| **MSW (Mock Service Worker)** | Network-level mocking | Mocking API responses tanpa menyentuh server asli |
| **Playwright** | E2E testing | Pengujian skenario alur pengguna secara menyeluruh |

---

## 8. Aturan QA

*   **ESLint TypeScript Strict Mode**: Wajib diaktifkan untuk memastikan keamanan tipe data (type-safety) yang ketat.
*   **Prettier**: Digunakan untuk pemformatan kode otomatis agar konsisten di seluruh tim.
*   **Husky + lint-staged**: Diterapkan untuk memvalidasi kode sebelum dilakukannya commit git (pre-commit hooks).
*   **PENTING**: Kode yang **TIDAK** lolos lint atau build otomatis **TIDAK BOLEH** di-commit ke dalam repositori.
