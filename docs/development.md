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
npm run build:desktop
npm run dev:site
npm run build:site
npm run lint
npm run typecheck
npm run test
```

## Notes

The legacy `apps/web` and `cli` directories remain as migration references. New product work should happen in `apps/desktop`, `apps/site`, and `crates/core`.
