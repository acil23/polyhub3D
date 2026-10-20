# 🧊 PolyCode Hub — Open-Source Procedural 3D Asset Platform

> **"CodePen meets Sketchfab."** Platform berbagi aset 3D berbasis kode (*procedural geometry*) yang ringan, gratis, dapat dikustomisasi secara langsung (*parametric*), dan langsung bisa diekspor ke `.OBJ` atau `.GLB` di sisi klien (*client-side*).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-MVP_Phase-emerald.svg)
![Engine](https://img.shields.io/badge/3D_Engine-Three.js-black.svg)

---

## 💡 Latar Belakang & Masalah yang Diselesaikan

Platform penyedia aset 3D tradisional membutuhkan kapasitas penyimpanan (*cloud storage*) dan *bandwidth* yang sangat besar karena menyimpan file biner mentah (`.fbx`, `.blend`, `.obj`) berukuran puluhan hingga ratusan Megabyte per aset.

**PolyCode Hub** membalikkan paradigma tersebut:
1. **Ultra-Lightweight Storage:** Database hanya menyimpan **kode pembentuk geometri (JavaScript/Three.js)** yang berukuran rata-rata **2 KB – 15 KB** per aset (hemat hingga 99% ruang penyimpanan).
2. **Client-Side Generation & Export:** Browser pengguna yang melakukan *rendering* sekaligus men-generate file `.OBJ` dan `.GLB` secara lokal saat tombol unduh ditekan.
3. **Parametric & Customizable:** Karena berbasis kode, pengguna awam sekalipun dapat menggeser *slider* parameter (misal: tinggi meja, jumlah dahan pohon, warna material) sebelum mengunduh file 3D-nya.
4. **Git-Style Collaboration:** Setiap aset bersifat *open-source*. Pengguna lain dapat melakukan **Remix (Fork)** atau mengajukan **Pull Request (PR)** untuk menyempurnakan model milik kreator lain.

---

## ✨ Fitur Utama

* **📚 Katalog Aset Cerdas (Smart Thumbnail Grid):** Menampilkan daftar aset dengan *thumbnail* ringan (`.webp` hasil tangkapan otomatis saat *publish*), dan berubah menjadi pratinjau 3D interaktif saat di-*hover* atau dibuka.
* **⚡ Boilerplate-Free Studio:** Kreator tidak perlu menulis ulang kode kamera, pencahayaan, atau *exporter*. Pada prototipe saat ini, tulis objek `params` (opsional) dan fungsi `createAsset(THREE, params)`, lalu kembalikan objek `THREE.Object3D` seperti `THREE.Group` atau `THREE.Mesh`.
* **🎛️ Auto-Generated UI Controls (Parametric Sliders):** Mendefinisikan objek `params` di dalam kode secara otomatis akan memunculkan kontrol *slider*, *color picker*, atau *checkbox* bagi pengunjung yang ingin memodifikasi bentuk 3D tanpa menyentuh kode.
* **🔀 Open-Source Workflow (Fork & Pull Request):**
  * **Remix (Fork):** Duplikasi karya orang lain ke akun sendiri dan modifikasi sesuka hati dengan atribusi otomatis.
  * **Propose Change (Pull Request):** Ajukan perbaikan atau penambahan fitur ke model asli. Pemilik aset atau moderator dapat meninjau lewat **Visual 3D Diff & Code Diff** sebelum melakukan *Approve/Merge*.
* **📦 Instant Client-Side Exporter:** Ekspor langsung ke format standar industri (`.OBJ` dan `.GLB` / `glTF 2.0`) dalam posisi transformasi standar ($0, 0, 0$) yang siap dimasukkan ke Blender, Unity, Unreal Engine, atau Godot.

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) + TypeScript | UI modern, SSR untuk SEO katalog, dan *routing*. |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Desain *dark-mode* responsif ala aplikasi 3D profesional. |
| **3D Rendering & Export** | Three.js (`OBJExporter`, `GLTFExporter`) | Mesin WebGL utama dan generator file 3D di *browser*. |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | Pengalaman mengetik kode setara VS Code lengkap dengan *syntax highlighting* & *diff viewer*. |
| **Security Sandbox** | Web Workers / Sandboxed `<iframe>` | Isolasi eksekusi kode pengguna agar aman dari serangan XSS dan *infinite loop*. |
| **Backend & Database** | Supabase (PostgreSQL + Auth + Storage) | Autentikasi pengguna, penyimpanan kode teks, manajemen PR, dan *storage* untuk *thumbnail* `.webp`. |

---

## 🚀 Panduan Memulai (Local Development)

### Prasyarat
* Node.js (v18.17 atau lebih baru)
* npm / pnpm / yarn
* Akun Supabase (untuk database lokal atau *cloud*)

### Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/acil23/polyhub3D.git
   cd polyhub3D
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin file `.env.example` menjadi `.env.local` dan masukkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://project-id-anda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
   ```

4. **Jalankan server development:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

---

## 📝 Contoh Standar Kode Aset (Creator API)

Di PolyCode Hub, kreator hanya perlu menulis kode sesederhana ini di dalam editor:

```javascript
// 1. Definisikan parameter kustomisasi (Opsional, otomatis jadi kontrol UI)
const params = {
  width: { type: "number", default: 2, min: 0.5, max: 10, step: 0.5, label: "Lebar Kubus" },
  height: { type: "number", default: 2, min: 0.5, max: 10, step: 0.5, label: "Tinggi Kubus" },
  color: { type: "color", default: "#3b82f6", label: "Warna Material" }
};

// 2. Fungsi utama pembentuk objek 3D
function createAsset(THREE, currentParams) {
  const group = new THREE.Group();
  group.name = "Parametric_Cube";

  const geometry = new THREE.BoxGeometry(
    currentParams.width,
    currentParams.height,
    currentParams.width
  );
  const material = new THREE.MeshStandardMaterial({
    color: currentParams.color,
    roughness: 0.3,
    metalness: 0.2
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  return group;
}
```

---

## 🤝 Cara Berkontribusi

Kami sangat terbuka terhadap kontribusi! Silakan baca dokumen **[Software Design Document](./software_design_document_sdd.md)** terlebih dahulu untuk memahami arsitektur inti, skema database, dan standar keamanan eksekusi kode sebelum mengirimkan Pull Request ke repositori ini.

---

## 📄 Lisensi

Kode sumber platform ini dilisensikan di bawah **MIT License**. Seluruh aset 3D yang diunggah oleh komunitas ke dalam platform secara *default* berlisensi **CC0 1.0 Universal (Public Domain)** atau **CC-BY 4.0** (sesuai pilihan kreator saat mengunggah).