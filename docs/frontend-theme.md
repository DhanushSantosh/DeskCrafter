# Frontend Theme & Design System

DeskCrafter utilizes a highly interactive, cinematic, and premium developer aesthetic. It is inspired by Awwwards-winning scrollytelling sites (e.g., landonorris.com, Vercel, Apple) fused with raw Linux workstation terminal aesthetics.

## Visual Thesis

A dark, visceral Linux utility that balances extreme technical density with cutting-edge, high-end web design. We prioritize smooth fluid interactions, physics-based UI mechanics, true black contrasts, and narrative-driven scrollytelling over generic static landing page structures.

## Core Design Mechanics (MUST FOLLOW)

- **Pure Pitch-Black Base:** Use true black (`#000000`) for all primary backgrounds to maximize the impact of glowing borders and text contrast.
- **Cinematic Overlays & Noise:** 
  - Utilize a subtle, static `mix-blend-mode: overlay` noise filter to add a premium film-grain texture.
  - Implement Boot Sequence sequences to mask page loads and transition via iris/shutter animations.
- **Physics-Based UI (Magnetic Cursor):** 
  - The default browser cursor MUST be hidden (`cursor: none`).
  - Use a custom Framer Motion cursor (a leading dot and lagging spring-based ring).
  - Wrap interactive elements in `<Magnetic>` boundaries so that buttons and navigation links pull toward the mouse, inverting cursor colors via `mix-blend-mode: difference`.
- **Scrollytelling Layouts:** 
  - Use sticky-pinned "stages" for visuals (like the `StickyFeatureScroll` terminal window) while the descriptive text flows down the left side. The scrollbar acts as a timeline slider controlling the right-side stage.
- **Cherry Red OLED Accents:** 
  - Use vibrant cherry red (`#ff0d3e`) heavily, but strategically, for terminal outputs, animated active states, and glowing node connectors.
  - Pair with a bright Emerald Green (`#10b981`) only for "SAFE" or success states in telemetry dashboards.
- **Immersive Technical HUDs:**
  - Embellish empty corners with `hud-corner` bracket borders.
  - Rely on monospace fonts (`JetBrains Mono`) for any logs, diagnostics, metrics, or terminal inputs. 

## Reused & Redesigned Components

- **Floating Pill Navigation:** Center-floating navigation pill positioned at `top: 36px` that smoothly morphs its blur and shadow depth upon scroll.
- **Interactive Canvases:** The hero features an infinite cyber-grid perspective on a `<canvas>` that reacts to mouse coordinates and draws connection tethers.
- **Architecture Pipelines:** Replace static architecture diagrams with interactive XDG pipeline visualizers built with Framer Motion that sequentially reveal paths.
- **Bento Telemetry Dashboards:** Instead of static grids, use "Diagnostic Dashboards" where cards represent system checks that can be clicked to mock a "SCAN -> FIX -> SAFE" terminal lifecycle.

## Avoided Ideas (STRICTLY PROHIBITED)

- **Generic SaaS Structures:** No standard two-column "Text on Left, Image on Right" static hero sections. 
- **Standard Tooltips & Hover Effects:** Avoid boring color transitions on hover. Use the Magnetic UI or inverted custom cursor rings instead.
- **Tailwind CSS Utility Classes:** DeskCrafter strictly uses Custom CSS Variables in `globals.css` to govern layout and aesthetics. Do not introduce Tailwind classes. 
- **Low Contrast Greys:** No muddy grey backgrounds. Stick to OLED `#000000` or `#050505` for surfaces.
- **Placeholder Graphics:** Do not use abstract graphics. If an illustration is needed, build a mock telemetry or terminal UI.
