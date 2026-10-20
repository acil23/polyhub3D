# 🧊 PolyCode Hub (v0.4.0)
> **Infinite Procedural 3D Assets. Zero Binary Storage.**  
> An open-source procedural 3D asset repository powered by **Three.js**, featuring real-time **Parametric Sliders**, instant client-side **`.GLB` / `.OBJ` export**, and Git-style **Visual 3D Pull Requests**.

![Version](https://img.shields.io/badge/version-0.4.0--fullstack-10b981?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14.2_(App_Router)-000000?style=flat-square&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-r165_WebGL-049EF4?style=flat-square&logo=threedotjs)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Cloud-3ECF8E?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square)

---

## 💡 Why PolyCode Hub?

Traditional 3D asset marketplaces (such as Sketchfab or TurboSquid) require massive cloud storage buckets and high bandwidth costs because they host static binary files (`.fbx`, `.blend`, `.glb`) ranging from **15 MB to 100+ MB per model**.

**PolyCode Hub** flips this paradigm by storing **procedural generation code instead of binary files**:
1. **99.9% Storage Reduction:** The server only stores lightweight **Three.js procedural scripts (~1.2 KB – 1.5 KB per asset)** as plain text rows in PostgreSQL. Within Supabase's **500 MB Free Tier**, PolyCode Hub can host **100,000 to 200,000+ 3D assets** without needing any Storage Bucket.
2. **Real-Time Parametric Customization:** Before downloading an asset, users can tweak dynamic sliders and color pickers (e.g., tree height, foliage tiers, blade width, building floors) in real time directly in the browser.
3. **100% Client-Side `.GLB` & `.OBJ` Generation:** Geometry compilation and binary `.GLB` (glTF 2.0) / `.OBJ` file packaging are executed entirely on the client's GPU/CPU.
4. **Git-Style Open-Source Collaboration:** Anyone can **Fork/Remix** an existing 3D script into a new asset or submit a **Pull Request (PR)** to improve an existing model, complete with **Side-by-Side 3D Viewport Comparison** and a **VS Code Monaco DiffEditor**.

| Storage Architecture | Average Size per 3D Asset | Capacity on Supabase Free Tier |
| :--- | :--- | :--- |
| **Traditional 3D Platform (Binary `.FBX` / `.GLB` Bucket)** | ~15 MB – 25 MB | **40 – 65 Assets** (1 GB Storage Limit) |
| **PolyCode Hub (Procedural Script in PostgreSQL)** | **~1.5 KB – 5 KB** | **100,000 – 200,000+ Assets** (500 MB DB Limit) |

---

## ✨ Key Features (v0.4.0 Full-Stack Edition)

### 1. 🚀 Smart Catalog with WebGL Context Limiter (`CatalogCard3D.tsx` & `thumbnail.ts`)
Modern browsers enforce a strict limit of 8–16 active WebGL contexts per tab. To prevent context-loss crashes when browsing hundreds of 3D models:
* Uses a **Singleton Offscreen WebGLRenderer** to automatically capture a high-resolution `.webp` studio snapshot for every procedural script.
* By default, catalog cards render cached `.webp` snapshots (**0 active WebGL contexts**).
* An interactive `<Viewport3D />` with `OrbitControls` is dynamically mounted **only when the user hovers over a card**, and cleanly disposes its WebGL context (`forceContextLoss()`) on mouse leave.

### 2. 🛡️ Dual-Layer Security Sandbox & Loop Guard (`validator.ts` & `compiler.ts`)
Executing community-contributed JavaScript is protected on both the **Client Compiler** and **Next.js Server API**:
* **Static Forbidden API Blocker:** Rejects scripts attempting to access sensitive globals (`window`, `document`, `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `indexedDB`, `eval`, `Function`, `WebSocket`, `navigator`, `location`, `cookie`, `process`).
* **Automatic Loop Timeout & Iteration Guard:** Injects a runtime `__guard()` check into `for`, `while`, and `do...while` loops. Any script exceeding **100,000 iterations** or **350ms execution time** (or generating **>250,000 vertices**) is safely aborted before freezing the browser tab.

### 3. 🎛️ 3D Studio Workspace & Auto-Parametric UI (`ParametricControls.tsx`)
* Automatically parses the exported `params` schema from any script and generates interactive **Range Sliders** and **Color Pickers**.
* Includes **4-Point Studio Lighting Presets** (*Cyber Neon*, *Warm Gold*, *Emerald Lab*), *Wireframe Toggle*, *Turntable Auto-Rotate*, polar stage grid, and live mesh telemetry (*Vertices*, *Triangles*, *Script Size KB*, *Compile Time ms*).

### 4. 🔀 Visual 3D Pull Requests & Monaco Diff Inspector (`PullRequestModal.tsx`)
* **Dual 3D Viewport Diff:** Renders the *Base Model* and the *Proposed PR Update* side by side, displaying exact vertex and triangle deltas.
* **VS Code Monaco `<DiffEditor />`:** Highlights line-by-line code additions (green) and deletions (red).
* **Atomic Merge & SemVer:** Approving a PR automatically increments the asset's semantic version (`v1.2.0` $\rightarrow$ `v1.3.0`), updates the main catalog, and archives the revision in the `asset_versions` table.

---

## 🛠️ Tech Stack & Directory Structure

* **Framework:** Next.js 14.2 (App Router & Full-Stack Route Handlers)
* **Language:** TypeScript 5.5
* **3D Engine & Exporters:** Three.js (`r165`), `OrbitControls`, `OBJExporter`, `GLTFExporter`
* **Code & Diff Editor:** `@monaco-editor/react` (VS Code Monaco Editor)
* **Database:** Supabase Cloud (PostgreSQL + Row Level Security) with *Automatic LocalStorage Hybrid Fallback*
* **Styling:** Tailwind CSS 3.4 (*Luxury Dark Glassmorphism UI*)

```text
polycode-hub/
├── .env.example                        # Supabase environment variable template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # PostgreSQL schema (assets, asset_versions, pull_requests)
└── src/
    ├── types/
    │   └── polycode.ts                 # TypeScript interfaces (Asset3D, PullRequest3D, ParamSchema)
    ├── lib/
    │   ├── supabase.ts                 # Supabase client (supports Publishable Key & Anon Key)
    │   ├── validator.ts                # Server & client security linter for 3D scripts
    │   ├── compiler.ts                 # Three.js execution engine + Anti-Infinite Loop Guard
    │   ├── thumbnail.ts                # Singleton Offscreen WebGL .webp snapshot generator
    │   ├── exporter.ts                 # Client-side .OBJ & .GLB binary exporters
    │   ├── repository.ts               # Data access layer (REST API + LocalStorage fallback)
    │   └── seedData.ts                 # 6 initial procedural 3D assets & sample PR
    ├── components/
    │   ├── Viewport3D.tsx              # WebGL canvas with 4-point studio lighting & ResizeObserver
    │   ├── CatalogCard3D.tsx           # Smart catalog card with Hover WebGL Limiter & Quick Export
    │   ├── ParametricControls.tsx      # Auto-generated sliders & color pickers
    │   ├── MonacoCodeEditor.tsx        # VS Code Monaco editor integration
    │   ├── ActionModals.tsx            # Glassmorphic modals for Fork/Publish & Submit PR
    │   └── PullRequestModal.tsx        # Dual 3D viewport & Monaco DiffEditor review modal
    └── app/
        ├── api/
        │   ├── health/route.ts         # Supabase Cloud connection & schema health check
        │   ├── assets/route.ts         # GET (with Auto-Seed) & POST new 3D assets
        │   └── pull-requests/
        │       ├── route.ts            # GET & POST open-source Pull Requests
        │       └── [id]/route.ts       # PATCH atomic Approve/Merge & Reject PR
        ├── globals.css
        ├── layout.tsx
        └── page.tsx                    # Main application (Explore, 3D Studio, Pull Requests)
```

---

## 📐 Creator Sandbox API Specification

Creators do not need to write boilerplate code for cameras, lights, or WebGL renderers. Simply define an optional `params` object and a `createAsset(THREE, p)` function that returns a `THREE.Group` or `THREE.Mesh`:

```javascript
// 1. Define Parametric Controls (Automatically rendered as UI Sliders & Color Pickers)
const params = {
  height: { type: 'number', label: 'Object Height', default: 2.5, min: 1.0, max: 5.0, step: 0.1 },
  radius: { type: 'number', label: 'Base Radius',   default: 1.0, min: 0.5, max: 2.5, step: 0.1 },
  color:  { type: 'color',  label: 'Primary Color', default: '#3b82f6' }
};

// 2. Define Procedural Geometry Generator
function createAsset(THREE, p) {
  const group = new THREE.Group();

  const geometry = new THREE.ConeGeometry(p.radius, p.height, 8);
  const material = new THREE.MeshStandardMaterial({
    color: p.color,
    flatShading: true,
    roughness: 0.4,
    metalness: 0.2
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  return group;
}
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone [https://github.com/your-username/polycode-hub.git](https://github.com/your-username/polycode-hub.git)
cd polycode-hub
npm install
```

### 2. Configure Environment Variables (`.env.local`)
Copy `.env.example` to `.env.local` and add your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```
*(Note: If `.env.local` is left empty, the app automatically runs in **Local Hybrid Mode** using `localStorage` persistence).*

### 3. Initialize Supabase Database Schema
1. Open your **Supabase Dashboard** $\rightarrow$ navigate to **SQL Editor** $\rightarrow$ click **New Query**.
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
3. On first launch, `GET /api/assets` will automatically **seed the database** with 6 procedural 3D assets and 1 sample Pull Request.

### 4. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. Verify that the status badge in the top-right navigation bar displays **🟢 Supabase Cloud Connected**.

---

## 🔌 Internal REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Checks connectivity to Supabase Cloud and verifies table schema readiness. |
| `GET` | `/api/assets` | Fetches all 3D assets (automatically seeds initial assets if the table is empty). |
| `POST` | `/api/assets` | Validates script safety on the server and publishes a new/forked 3D asset. |
| `GET` | `/api/pull-requests` | Lists all community Pull Requests (`open`, `merged`, `rejected`). |
| `POST` | `/api/pull-requests` | Submits a new Pull Request after passing server-side security validation. |
| `PATCH` | `/api/pull-requests/[id]` | Executes **Approve & Merge** (updates main asset code, bumps SemVer, logs history in `asset_versions`) or **Reject PR**. |

---

## 📄 License
Distributed under the **MIT License**. All procedural 3D scripts shared on the platform are open-source and free for personal and commercial use.# 🧊 PolyCode Hub (v0.4.0)
> **Infinite Procedural 3D Assets. Zero Binary Storage.**  
> An open-source procedural 3D asset repository powered by **Three.js**, featuring real-time **Parametric Sliders**, instant client-side **`.GLB` / `.OBJ` export**, and Git-style **Visual 3D Pull Requests**.

![Version](https://img.shields.io/badge/version-0.4.0--fullstack-10b981?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14.2_(App_Router)-000000?style=flat-square&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-r165_WebGL-049EF4?style=flat-square&logo=threedotjs)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Cloud-3ECF8E?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-3b82f6?style=flat-square)

---

## 💡 Why PolyCode Hub?

Traditional 3D asset marketplaces (such as Sketchfab or TurboSquid) require massive cloud storage buckets and high bandwidth costs because they host static binary files (`.fbx`, `.blend`, `.glb`) ranging from **15 MB to 100+ MB per model**.

**PolyCode Hub** flips this paradigm by storing **procedural generation code instead of binary files**:
1. **99.9% Storage Reduction:** The server only stores lightweight **Three.js procedural scripts (~1.2 KB – 1.5 KB per asset)** as plain text rows in PostgreSQL. Within Supabase's **500 MB Free Tier**, PolyCode Hub can host **100,000 to 200,000+ 3D assets** without needing any Storage Bucket.
2. **Real-Time Parametric Customization:** Before downloading an asset, users can tweak dynamic sliders and color pickers (e.g., tree height, foliage tiers, blade width, building floors) in real time directly in the browser.
3. **100% Client-Side `.GLB` & `.OBJ` Generation:** Geometry compilation and binary `.GLB` (glTF 2.0) / `.OBJ` file packaging are executed entirely on the client's GPU/CPU.
4. **Git-Style Open-Source Collaboration:** Anyone can **Fork/Remix** an existing 3D script into a new asset or submit a **Pull Request (PR)** to improve an existing model, complete with **Side-by-Side 3D Viewport Comparison** and a **VS Code Monaco DiffEditor**.

| Storage Architecture | Average Size per 3D Asset | Capacity on Supabase Free Tier |
| :--- | :--- | :--- |
| **Traditional 3D Platform (Binary `.FBX` / `.GLB` Bucket)** | ~15 MB – 25 MB | **40 – 65 Assets** (1 GB Storage Limit) |
| **PolyCode Hub (Procedural Script in PostgreSQL)** | **~1.5 KB – 5 KB** | **100,000 – 200,000+ Assets** (500 MB DB Limit) |

---

## ✨ Key Features (v0.4.0 Full-Stack Edition)

### 1. 🚀 Smart Catalog with WebGL Context Limiter (`CatalogCard3D.tsx` & `thumbnail.ts`)
Modern browsers enforce a strict limit of 8–16 active WebGL contexts per tab. To prevent context-loss crashes when browsing hundreds of 3D models:
* Uses a **Singleton Offscreen WebGLRenderer** to automatically capture a high-resolution `.webp` studio snapshot for every procedural script.
* By default, catalog cards render cached `.webp` snapshots (**0 active WebGL contexts**).
* An interactive `<Viewport3D />` with `OrbitControls` is dynamically mounted **only when the user hovers over a card**, and cleanly disposes its WebGL context (`forceContextLoss()`) on mouse leave.

### 2. 🛡️ Dual-Layer Security Sandbox & Loop Guard (`validator.ts` & `compiler.ts`)
Executing community-contributed JavaScript is protected on both the **Client Compiler** and **Next.js Server API**:
* **Static Forbidden API Blocker:** Rejects scripts attempting to access sensitive globals (`window`, `document`, `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, `indexedDB`, `eval`, `Function`, `WebSocket`, `navigator`, `location`, `cookie`, `process`).
* **Automatic Loop Timeout & Iteration Guard:** Injects a runtime `__guard()` check into `for`, `while`, and `do...while` loops. Any script exceeding **100,000 iterations** or **350ms execution time** (or generating **>250,000 vertices**) is safely aborted before freezing the browser tab.

### 3. 🎛️ 3D Studio Workspace & Auto-Parametric UI (`ParametricControls.tsx`)
* Automatically parses the exported `params` schema from any script and generates interactive **Range Sliders** and **Color Pickers**.
* Includes **4-Point Studio Lighting Presets** (*Cyber Neon*, *Warm Gold*, *Emerald Lab*), *Wireframe Toggle*, *Turntable Auto-Rotate*, polar stage grid, and live mesh telemetry (*Vertices*, *Triangles*, *Script Size KB*, *Compile Time ms*).

### 4. 🔀 Visual 3D Pull Requests & Monaco Diff Inspector (`PullRequestModal.tsx`)
* **Dual 3D Viewport Diff:** Renders the *Base Model* and the *Proposed PR Update* side by side, displaying exact vertex and triangle deltas.
* **VS Code Monaco `<DiffEditor />`:** Highlights line-by-line code additions (green) and deletions (red).
* **Atomic Merge & SemVer:** Approving a PR automatically increments the asset's semantic version (`v1.2.0` $\rightarrow$ `v1.3.0`), updates the main catalog, and archives the revision in the `asset_versions` table.

---

## 🛠️ Tech Stack & Directory Structure

* **Framework:** Next.js 14.2 (App Router & Full-Stack Route Handlers)
* **Language:** TypeScript 5.5
* **3D Engine & Exporters:** Three.js (`r165`), `OrbitControls`, `OBJExporter`, `GLTFExporter`
* **Code & Diff Editor:** `@monaco-editor/react` (VS Code Monaco Editor)
* **Database:** Supabase Cloud (PostgreSQL + Row Level Security) with *Automatic LocalStorage Hybrid Fallback*
* **Styling:** Tailwind CSS 3.4 (*Luxury Dark Glassmorphism UI*)

```text
polycode-hub/
├── .env.example                        # Supabase environment variable template
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # PostgreSQL schema (assets, asset_versions, pull_requests)
└── src/
    ├── types/
    │   └── polycode.ts                 # TypeScript interfaces (Asset3D, PullRequest3D, ParamSchema)
    ├── lib/
    │   ├── supabase.ts                 # Supabase client (supports Publishable Key & Anon Key)
    │   ├── validator.ts                # Server & client security linter for 3D scripts
    │   ├── compiler.ts                 # Three.js execution engine + Anti-Infinite Loop Guard
    │   ├── thumbnail.ts                # Singleton Offscreen WebGL .webp snapshot generator
    │   ├── exporter.ts                 # Client-side .OBJ & .GLB binary exporters
    │   ├── repository.ts               # Data access layer (REST API + LocalStorage fallback)
    │   └── seedData.ts                 # 6 initial procedural 3D assets & sample PR
    ├── components/
    │   ├── Viewport3D.tsx              # WebGL canvas with 4-point studio lighting & ResizeObserver
    │   ├── CatalogCard3D.tsx           # Smart catalog card with Hover WebGL Limiter & Quick Export
    │   ├── ParametricControls.tsx      # Auto-generated sliders & color pickers
    │   ├── MonacoCodeEditor.tsx        # VS Code Monaco editor integration
    │   ├── ActionModals.tsx            # Glassmorphic modals for Fork/Publish & Submit PR
    │   └── PullRequestModal.tsx        # Dual 3D viewport & Monaco DiffEditor review modal
    └── app/
        ├── api/
        │   ├── health/route.ts         # Supabase Cloud connection & schema health check
        │   ├── assets/route.ts         # GET (with Auto-Seed) & POST new 3D assets
        │   └── pull-requests/
        │       ├── route.ts            # GET & POST open-source Pull Requests
        │       └── [id]/route.ts       # PATCH atomic Approve/Merge & Reject PR
        ├── globals.css
        ├── layout.tsx
        └── page.tsx                    # Main application (Explore, 3D Studio, Pull Requests)
```

---

## 📐 Creator Sandbox API Specification

Creators do not need to write boilerplate code for cameras, lights, or WebGL renderers. Simply define an optional `params` object and a `createAsset(THREE, p)` function that returns a `THREE.Group` or `THREE.Mesh`:

```javascript
// 1. Define Parametric Controls (Automatically rendered as UI Sliders & Color Pickers)
const params = {
  height: { type: 'number', label: 'Object Height', default: 2.5, min: 1.0, max: 5.0, step: 0.1 },
  radius: { type: 'number', label: 'Base Radius',   default: 1.0, min: 0.5, max: 2.5, step: 0.1 },
  color:  { type: 'color',  label: 'Primary Color', default: '#3b82f6' }
};

// 2. Define Procedural Geometry Generator
function createAsset(THREE, p) {
  const group = new THREE.Group();

  const geometry = new THREE.ConeGeometry(p.radius, p.height, 8);
  const material = new THREE.MeshStandardMaterial({
    color: p.color,
    flatShading: true,
    roughness: 0.4,
    metalness: 0.2
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  return group;
}
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone [https://github.com/acil23/polycode-hub.git]
cd polycode-hub
npm install
```

### 2. Configure Environment Variables (`.env.local`)
Copy `.env.example` to `.env.local` and add your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```
*(Note: If `.env.local` is left empty, the app automatically runs in **Local Hybrid Mode** using `localStorage` persistence).*

### 3. Initialize Supabase Database Schema
1. Open your **Supabase Dashboard** $\rightarrow$ navigate to **SQL Editor** $\rightarrow$ click **New Query**.
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
3. On first launch, `GET /api/assets` will automatically **seed the database** with 6 procedural 3D assets and 1 sample Pull Request.

### 4. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser. Verify that the status badge in the top-right navigation bar displays **🟢 Supabase Cloud Connected**.

---

## 🔌 Internal REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Checks connectivity to Supabase Cloud and verifies table schema readiness. |
| `GET` | `/api/assets` | Fetches all 3D assets (automatically seeds initial assets if the table is empty). |
| `POST` | `/api/assets` | Validates script safety on the server and publishes a new/forked 3D asset. |
| `GET` | `/api/pull-requests` | Lists all community Pull Requests (`open`, `merged`, `rejected`). |
| `POST` | `/api/pull-requests` | Submits a new Pull Request after passing server-side security validation. |
| `PATCH` | `/api/pull-requests/[id]` | Executes **Approve & Merge** (updates main asset code, bumps SemVer, logs history in `asset_versions`) or **Reject PR**. |

---

## 📄 License
Distributed under the **MIT License**. All procedural 3D scripts shared on the platform are open-source and free for personal and commercial use.