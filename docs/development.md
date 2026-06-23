# Development

## Setup

Install Node.js 20+, npm 10+, Rust, Cargo, and Tauri Linux prerequisites for your distro.

```bash
npm install
npm run cargo:test
```

On Fedora-like systems, the Tauri packaging build also needs WebKitGTK, JavaScriptCoreGTK, libsoup 3, GTK, and appindicator development packages. If `npm run build:desktop` fails with missing `.pc` files such as `javascriptcoregtk-4.1.pc` or `libsoup-3.0.pc`, install the matching distro `-devel` packages before rebuilding.

On Windows, use the npm entrypoints rather than raw `cargo` from a standard terminal. `scripts/run-cargo.js` will use the installed Rust toolchain and Visual Studio C++ build tools automatically when available.

## Scripts

```bash
npm run dev:desktop
npm run dev:desktop:preview
npm run dev:side-by-side
npm run build:desktop
npm run build:desktop:ui
npm run dev:site
npm run build:site
npm run check
npm run lint
npm run typecheck
npm run test
npm run cargo:test
npm run fix:generated
```

## Notes

The legacy `apps/web` and `cli` directories remain as migration references. New product work should happen in `apps/desktop`, `apps/site`, and `crates/core`.

New Linux tool modules should be added through `crates/core::tools::ToolRegistry` first, then exposed through the generic suite commands. Keep direct launcher commands only as compatibility helpers while the UI migrates.

Admin actions should be modeled as guided commands unless the action is explicitly user-owned and reversible.

`apps/site/next-env.d.ts` is a generated Next.js file that can drift between `dev` and `build` modes. Use `npm run fix:generated` if it becomes noisy after local builds.
