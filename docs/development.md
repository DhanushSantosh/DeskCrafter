# Development

## Setup

Install Node.js 20+, npm 10+, Rust, Cargo, and Tauri Linux prerequisites for your distro.

```bash
npm install
cargo test
```

On Fedora-like systems, the Tauri packaging build also needs WebKitGTK, JavaScriptCoreGTK, libsoup 3, GTK, and appindicator development packages. If `npm run build:desktop` fails with missing `.pc` files such as `javascriptcoregtk-4.1.pc` or `libsoup-3.0.pc`, install the matching distro `-devel` packages before rebuilding.

## Scripts

```bash
npm run dev:desktop
npm run dev:desktop:preview
npm run build:desktop
npm run build:desktop:ui
npm run dev:site
npm run build:site
npm run check
npm run lint
npm run typecheck
npm run test
```

## Notes

The legacy `apps/web` and `cli` directories remain as migration references. New product work should happen in `apps/desktop`, `apps/site`, and `crates/core`.

New Linux tool modules should be added through `crates/core::tools::ToolRegistry` first, then exposed through the generic suite commands. Keep direct launcher commands only as compatibility helpers while the UI migrates.

Admin actions should be modeled as guided commands unless the action is explicitly user-owned and reversible.
