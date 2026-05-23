# DeskCrafter

DeskCrafter is a Linux launcher suite for creating, validating, repairing, and managing application launchers across desktop environments.

The project is now organized around a native desktop app, a product site, and shared Rust launcher logic:

- `apps/desktop`: Tauri + Vite + React desktop application.
- `apps/site`: DeskCrafter product website.
- `crates/core`: Rust launcher domain logic and Linux tool registry.
- `docs`: product, architecture, backend, packaging, and testing notes.

## Tool Suite

- Desktop Entry Studio for `.desktop` launchers.
- AppImage Integrator for portable Linux apps.
- Script Launcher Builder for shell, Python, and executable scripts.
- URL Launcher Builder for web tools.
- Icon & Category Manager for launcher metadata.
- Launcher Doctor for broken launcher detection and repair.
- Practical Linux tools for autostart, services, PATH inspection, cache inspection, permissions, and system profile checks.

## Development

Install dependencies:

```bash
npm install
```

Run the product site:

```bash
npm run dev:site:preview
```

Run the desktop UI in browser preview:

```bash
npm run dev:desktop:preview
```

Run the real Tauri desktop app:

```bash
npm run dev:desktop
```

Run checks:

```bash
npm run check
```

Build outputs:

```bash
npm run build:site
npm run build:desktop:ui
npm run build:desktop
```

`npm run build:desktop` and `npm run dev:desktop` require Tauri's native Linux development libraries. On Fedora-like systems, install WebKitGTK, JavaScriptCoreGTK, libsoup 3, GTK, and appindicator development packages if the build reports missing `.pc` files.

## Documentation

Start with:

- [Product Scope](docs/product-scope.md)
- [Architecture](docs/architecture.md)
- [Backend Contracts](docs/backend-contracts.md)
- [Development](docs/development.md)
- [Packaging](docs/packaging.md)

## License

MIT License. See [LICENSE](LICENSE) for details.
