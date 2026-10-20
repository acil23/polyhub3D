# 📐 Software Design Document (SDD)

**Nama Proyek:** PolyCode Hub (Open-Source Procedural 3D Asset Platform)

**Versi Dokumen:** 1.0.0 (Source of Truth)

**Status:** Draft Final untuk Pengembangan MVP

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini berfungsi sebagai **Source of Truth (Acuan Utama)** bagi pengembangan teknis platform PolyCode Hub. Dokumen ini mendefinisikan arsitektur sistem, desain basis data, kontrak API untuk skrip 3D pengguna, mekanisme keamanan eksekusi kode, serta alur kerja kolaborasi (*Fork & Pull Request*).

### 1.2 Ruang Lingkup Sistem

PolyCode Hub adalah aplikasi web tempat pengguna dapat:

1. Menjelajahi katalog aset 3D dan mengunduhnya dalam format `.OBJ` atau `.GLB`.

2. Mengubah parameter visual aset 3D secara *real-time* sebelum mengunduh.

3. Menulis, menguji, dan mempublikasikan kode pembentuk aset 3D baru menggunakan *in-browser IDE*.

4. Melakukan *Fork* (Remix) atau mengajukan *Pull Request* (PR) terhadap kode aset milik pengguna lain, lengkap dengan proses peninjauan (*review* & *approval*).

## 2. Arsitektur Sistem

### 2.1 Diagram Arsitektur Tingkat Tinggi (High-Level Architecture)

```
+-----------------------------------------------------------------------+
|                           CLIENT BROWSER                              |
|                                                                       |
|  +-------------------------+       +-------------------------------+  |
|  |   Main Application UI   |       |   Sandboxed 3D Runner Iframe  |  |
|  |  (Next.js + Tailwind)   |       |   (Isolated Origin / srcdoc)  |  |
|  |                         |       |                               |  |
|  | - Catalog & PR Diff UI  | <---> | - Three.js Scene & Lighting   |  |
|  | - Monaco Code Editor    | post  | - User Script Execution       |  |
|  | - Parametric Sliders UI | Msg   | - OBJ & GLTF Exporter Engine  |  |
|  +-------------------------+       +-------------------------------+  |
+---------------+-------------------------------------------------------+
                | HTTPS / REST / Realtime
                v
+-----------------------------------------------------------------------+
|                       BACKEND AS A SERVICE (Supabase)                 |
|                                                                       |
|  +----------------+   +--------------------+   +-------------------+  |
|  | Supabase Auth  |   | PostgreSQL DB      |   | Supabase Storage  |  |
|  | (OAuth GitHub/ |   | (Assets, Versions, |   | (Auto-captured    |  |
|  |  Google)       |   |  Pull Requests)    |   |  .webp Thumbnails)|  |
|  +----------------+   +--------------------+   +-------------------+  |
+-----------------------------------------------------------------------+

```

### 2.2 Prinsip Desain Utama

1. **Zero Binary 3D Storage on Server:** Server **tidak pernah** menyimpan atau memproses file `.obj` atau `.glb`. Semua konversi geometri menjadi file unduhan dilakukan 100% di memori *browser* klien.

2. **Untrusted Code Isolation:** Kode JavaScript yang ditulis oleh pengguna dianggap tidak aman (*untrusted*). Eksekusi kode wajib berjalan di dalam `<iframe>` terisolasi dengan atribut `sandbox="allow-scripts"` tanpa akses ke `localStorage`, *cookies*, atau DOM halaman utama.

3. **Single Active WebGL Context on Catalog:** Halaman katalog hanya boleh menampilkan gambar statis `.webp`. Konteks WebGL aktif pada katalog dibatasi maksimal 1 instance (hanya pada kartu yang sedang di-*hover* selama $> 300\text{ ms}$) untuk mencegah *browser crash*.

## 3. Spesifikasi Standar Skrip 3D (Creator Sandbox API)

Agar sistem seragam dan bebas *boilerplate*, sistem menerapkan kontrak kode yang ketat antara **Main App** dan **Sandbox Iframe**.

### 3.1 Struktur Kode yang Diizinkan

Pengguna hanya menulis badan fungsi atau modul yang mengekspor dua entitas:

1. `params` (Objek JSON berisi konfigurasi parameter dinamis).

2. `createAsset(THREE, currentParams)` (Fungsi murni yang mengembalikan `THREE.Object3D`).

### 3.2 Protokol Komunikasi `postMessage` (Host $\leftrightarrow$ Sandbox)

* **Host** $\rightarrow$ **Sandbox (`EXECUTE_CODE`):** Mengirimkan string kode dari Monaco Editor beserta nilai `currentParams` untuk dirender.

* **Sandbox** $\rightarrow$ **Host (`RENDER_SUCCESS`):** Mengirimkan skema `params` untuk dibuatkan UI Slider di Host, beserta metadata geometri (jumlah *vertices* dan *triangles*).

* **Sandbox** $\rightarrow$ **Host (`RENDER_ERROR`):** Mengirimkan pesan *error* dan nomor baris jika kode pengguna mengalami *syntax/runtime error*.

* **Host** $\rightarrow$ **Sandbox (`REQUEST_EXPORT`):** Meminta *sandbox* men-generate *array buffer* `.GLB` atau string `.OBJ` lalu mengirimkannya kembali ke Host untuk diunduh.

* **Host** $\rightarrow$ **Sandbox (`CAPTURE_THUMBNAIL`):** Meminta *sandbox* merender 1 frame resolusi $600 \times 450$ dan mengembalikan Data URL `image/webp` saat kreator menekan tombol *Publish*.

## 4. Desain Basis Data (ERD & Skema PostgreSQL)

Berikut adalah skema tabel inti yang memastikan fitur *versioning* dan *Pull Request* berjalan rapi tanpa duplikasi data berlebih:

### 4.1 Tabel `profiles`

Menyimpan data kreator (terhubung dengan `auth.users` Supabase).

* `id` (UUID, PK)

* `username` (VARCHAR, Unique, Not Null)

* `avatar_url` (TEXT)

* `role` (ENUM: `'user'`, `'moderator'`, `'admin'`)

* `created_at` (TIMESTAMPTZ)

### 4.2 Tabel `assets`

Menyimpan entitas utama dari sebuah objek 3D yang tampil di katalog.

* `id` (UUID, PK)

* `slug` (VARCHAR, Unique) — *contoh: `low-poly-pine-tree-a8f2`*

* `title` (VARCHAR, Not Null)

* `description` (TEXT)

* `author_id` (UUID, FK $\rightarrow$ `profiles.id`)

* `forked_from_id` (UUID, FK $\rightarrow$ `assets.id`, Nullable) — *Menunjuk ke aset asli jika ini hasil Remix/Fork.*

* `current_version_id` (UUID, FK $\rightarrow$ `asset_versions.id`) — *Pointer ke kode aktif saat ini.*

* `thumbnail_url` (TEXT) — *URL gambar `.webp` di storage.*

* `tags` (TEXT\[\]) — *Array tag pencarian, misal `['nature', 'lowpoly', 'tree']`.*

* `downloads_count` (INTEGER, Default: 0)

* `likes_count` (INTEGER, Default: 0)

* `is_published` (BOOLEAN, Default: true)

* `created_at` (TIMESTAMPTZ)

* `updated_at` (TIMESTAMPTZ)

### 4.3 Tabel `asset_versions`

Menyimpan riwayat kode (seperti *commit* di Git). Setiap kali ada perubahan atau PR yang di-*merge*, baris baru dibuat di sini.

* `id` (UUID, PK)

* `asset_id` (UUID, FK $\rightarrow$ `assets.id` ON DELETE CASCADE)

* `version_number` (INTEGER, Not Null) — *Inkremental: 1, 2, 3...*

* `code` (TEXT, Not Null) — *String kode JavaScript Three.js (Maksimal 50 KB).*

* `default_params` (JSONB) — *Snapshot parameter default.*

* `poly_count` (INTEGER) — *Jumlah segitiga (triangles) untuk informasi performa di katalog.*

* `commit_message` (VARCHAR) — *Catatan perubahan.*

* `created_by` (UUID, FK $\rightarrow$ `profiles.id`)

* `created_at` (TIMESTAMPTZ)

### 4.4 Tabel `pull_requests`

Menyimpan pengajuan perubahan kode dari kontributor publik ke sebuah aset.

* `id` (UUID, PK)

* `target_asset_id` (UUID, FK $\rightarrow$ `assets.id`) — *Aset yang ingin diperbaiki.*

* `base_version_id` (UUID, FK $\rightarrow$ `asset_versions.id`) — *Versi kode saat kontributor mulai mengedit.*

* `contributor_id` (UUID, FK $\rightarrow$ `profiles.id`) — *Pengguna yang mengajukan PR.*

* `title` (VARCHAR, Not Null) — *Judul PR, misal: "Menambahkan parameter ketebalan daun".*

* `description` (TEXT) — *Penjelasan perubahan.*

* `proposed_code` (TEXT, Not Null) — *Kode baru yang diajukan.*

* `proposed_params` (JSONB)

* `proposed_thumbnail_url` (TEXT)

* `status` (ENUM: `'open'`, `'merged'`, `'rejected'`)

* `reviewed_by` (UUID, FK $\rightarrow$ `profiles.id`, Nullable)

* `review_comment` (TEXT, Nullable)

* `created_at` (TIMESTAMPTZ)

* `resolved_at` (TIMESTAMPTZ, Nullable)

## 5. Alur Kerja Utama (Core Workflows)

### 5.1 Alur Kolaborasi: Fork vs Pull Request

Saat pengguna A membuka aset milik pengguna B dan mengedit kodenya di *Studio Editor*, sistem menyediakan dua tombol penyimpanan:

1. **Save as Remix (Fork):**

   * Tidak butuh persetujuan pengguna B.

   * Sistem langsung membuat baris baru di tabel `assets` dengan `author_id = A` dan `forked_from_id = ID_Aset_B`.

   * Langsung tampil di profil pengguna A.

2. **Propose Update (Submit Pull Request):**

   * Ditujukan untuk memperbarui aset utama milik pengguna B.

   * Sistem menyimpan kode modifikasi ke tabel `pull_requests` dengan status `'open'`.

   * Pengguna B (dan Admin/Moderator) menerima notifikasi di *Dashboard Review*.

### 5.2 Alur Peninjauan & Merge (PR Review Workflow)

1. Pemilik aset atau Moderator membuka halaman **PR Detail**.

2. Layar menampilkan:

   * **Tab 1: Monaco Diff Editor** (Membandingkan `base_version.code` di sebelah kiri dan `proposed_code` di sebelah kanan dengan *highlight* baris merah/hijau).

   * **Tab 2: Dual 3D Viewport** (Menampilkan render 3D versi lama dan versi baru secara berdampingan dengan kamera yang tersinkronisasi).

3. Jika Reviewer menekan tombol **"Approve & Merge"**:

   * Database menjalankan transaksi atomik (*PostgreSQL Function / RPC*):

     1. Membuat baris baru di `asset_versions` dengan `version_number = current + 1` berisi `proposed_code`.

     2. Mengubah `assets.current_version_id` menunjuk ke versi baru tersebut dan memperbarui `thumbnail_url`.

     3. Mengubah `pull_requests.status` menjadi `'merged'`.

## 6. Mekanisme Keamanan & Batasan Sistem (Guardrails)

Karena sistem menerima input berupa kode program dari publik, aturan keamanan berikut bersifat **wajib (mandatory)**:

1. **Iframe Sandboxing:**

   * Komponen perender 3D wajib menggunakan `<iframe sandbox="allow-scripts" srcdoc="...">`.

   * Dilarang menambahkan `allow-same-origin` pada atribut `sandbox` agar kode pengguna tidak bisa membaca `document.cookie` atau memanggil API Supabase atas nama pengguna yang sedang login.

2. **Proteksi Infinite Loop (`while(true)`):**

   * Sebelum kode dieksekusi di dalam *sandbox*, sistem melakukan *timeout watchdog* atau menjalankan *loop* pembuatan geometri di dalam `Web Worker` dengan batas waktu eksekusi maksimal **3.000 ms (3 detik)**. Jika lewat dari 3 detik belum selesai, *worker* dihentikan paksa (*terminated*) dan menampilkan pesan *"Execution Timeout: Model terlalu berat atau terdapat infinite loop"*.

3. **Batas Geometri & Ukuran File:**

   * Ukuran teks kode (`code`) dibatasi maksimal **50 KB** di level database (`CHECK (octet_length(code) <= 51200)`).

   * Peringatan UI muncul jika total segitiga (*triangles*) melebihi $100.000$ *faces* agar tidak membebani perangkat *mobile*.

4. **Content Security Policy (CSP) di dalam Sandbox:**

   * Di dalam `srcdoc` *iframe*, terapkan meta tag CSP `connect-src 'none'` setelah *library* Three.js dimuat, sehingga skrip pengguna tidak bisa melakukan `fetch()` atau `XMLHttpRequest` ke server eksternal (mencegah pencurian data atau panggilan API tersembunyi).

## 7. Rencana Pengembangan Bertahap (Roadmap MVP)

* **Fase 1 — Core Studio & Local Exporter (Minggu 1):**

  * Pembuatan UI Studio (Monaco Editor + Sandboxed Three.js Viewport).

  * Sistem *auto-slider* dari objek `params`.

  * Fitur ekspor `.OBJ` dan `.GLB` yang bersih.

* **Fase 2 — Catalog & Database Integration (Minggu 2):**

  * Integrasi Supabase Auth & tabel `assets` + `asset_versions`.

  * Fitur *Auto-Thumbnail Capture* (`.webp`) saat *Publish*.

  * Halaman utama katalog dengan fitur pencarian dan filter *tag*.

* **Fase 3 — Open-Source Collaboration / PR System (Minggu 3):**

  * Fitur *Remix (Fork)*.

  * Alur pengajuan *Pull Request*, halaman *Monaco Diff Viewer*, dan tombol *Approve/Merge*.