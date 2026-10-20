# PolyCode Hub

PolyCode Hub is a browser-based workspace for creating, previewing, customizing, and exporting procedural 3D assets. Instead of storing finished binary models as the primary asset, the project uses JavaScript/Three.js model-generating code and generates OBJ or GLB downloads in the browser.

> **Project status:** MVP/prototype. The current application includes a local sample catalog, a procedural-code editor, parameter controls, Three.js previews, client-side export, and an in-memory pull-request review demo. Supabase configuration and an initial schema are present, but the UI currently uses local seed data. User-supplied code execution is not yet isolated in the sandbox required for a public production deployment.

## Features in the current prototype

- Browse and search seeded 3D assets, with category filters.
- Edit procedural JavaScript in Monaco and preview the resulting model.
- Customize numeric and color parameters where supported by the asset.
- Export models locally as `.obj` or `.glb`.
- Demonstrate remixing and pull-request review with local application state.
- Preview current and proposed PR geometry side by side.

## Technology

- Next.js 14 App Router, React 18, and TypeScript
- Tailwind CSS
- Three.js, including its OBJ and glTF exporters
- Monaco Editor (`@monaco-editor/react`)
- Supabase JS client and PostgreSQL migration (integration is not yet wired into the current UI)

## Requirements

- Node.js 18.17 or newer
- npm
- Optional: a Supabase project for future/backend integration

## Local development

```bash
git clone https://github.com/acil23/polyhub3D.git
cd polyhub3D
npm install
cp .env.example .env.local
```

If using Supabase, replace the placeholder values in `.env.local` with the project URL and anon key. Do not commit `.env.local` or any real credentials. Supabase is optional for the current seeded prototype.

Start the development server:

```bash
npm run dev
```

Open <http://localhost:3000>.

Create and run a production build with:

```bash
npm run build
npm start
```

## Procedural asset authoring contract

The current compiler expects a top-level `params` object (optional) and a `createAsset(THREE, params)` function. Parameter entries use `type`, `default`, and optional UI metadata such as `label`, `min`, `max`, and `step`:

```js
const params = {
  width: { type: 'number', default: 2, min: 0.5, max: 10, step: 0.5, label: 'Width' },
  color: { type: 'color', default: '#3b82f6', label: 'Material color' }
};

function createAsset(THREE, currentParams) {
  const geometry = new THREE.BoxGeometry(
    currentParams.width,
    currentParams.width,
    currentParams.width
  );
  const material = new THREE.MeshStandardMaterial({ color: currentParams.color });
  return new THREE.Mesh(geometry, material);
}
```

The returned value must be a Three.js `Object3D` (for example, a `Group` or `Mesh`). The current prototype evaluates this code in the application context. **Do not expose it to untrusted public input or deploy it as a public code-execution service until the sandbox and execution limits described in the SDD have been implemented and reviewed.**

## Project documents

- [Product overview and project notes](./project_readme.md)
- [Software Design Document](./software_design_document_sdd.md)
- [Supabase schema migration](./supabase/migrations/001_initial_schema.sql)

The SDD describes the target architecture and guardrails; some documented systems (notably isolated execution, database-backed application workflows, and versioned PR merging) are not yet implemented in the current prototype.

## Contributing

Please read the [Software Design Document](./software_design_document_sdd.md) before proposing architectural changes. Keep credentials out of commits and run `npm run build` before submitting a change.

## License

The application source code is licensed under the MIT License; see [LICENSE](./LICENSE). Licenses for community-created 3D assets are a separate matter and must be explicitly selected and represented as those asset workflows are implemented.