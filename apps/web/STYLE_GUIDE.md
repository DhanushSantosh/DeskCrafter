# DeskCrafter Design System v6.0 — Aurora

> A vibrant, modern design language inspired by Arc Browser, Figma, and Framer.
> Warm, approachable, and delightfully playful while remaining production-ready.

---

## Design Philosophy

| Principle | Description |
|:----------|:------------|
| **Warm & Inviting** | Soft, creamy backgrounds that feel like quality paper |
| **Playfully Professional** | Rounded corners and gradients that spark joy without sacrificing usability |
| **Color as Language** | Categories and states communicated through a vibrant, consistent palette |
| **Motion with Purpose** | Spring animations that feel alive, not distracting |
| **Density Done Right** | Comfortable spacing that breathes, keyboard-navigable |

---

## Color System

### Core Palette

```css
:root {
  /* === BACKGROUNDS === */
  --bg-base: #fffbf5;           /* Warm off-white canvas */
  --bg-surface: #ffffff;         /* Card surfaces */
  --bg-elevated: #ffffff;        /* Modals, popovers */
  --bg-sunken: #fef5eb;          /* Inset areas, code blocks */
  --bg-wash: #fdf2e6;            /* Subtle highlights */

  /* === TEXT === */
  --text-primary: #1c1917;       /* Headings, important */
  --text-secondary: #44403c;     /* Body text */
  --text-tertiary: #78716c;      /* Muted, captions */
  --text-quaternary: #a8a29e;    /* Placeholders, disabled */

  /* === ACCENT GRADIENT === */
  --accent-start: #f97316;       /* Vibrant orange */
  --accent-end: #ec4899;         /* Vibrant pink */
  --accent-solid: #f97316;       /* Fallback solid */
  --accent-subtle: #fff7ed;      /* Accent background tint */

  /* === SEMANTIC === */
  --success: #22c55e;
  --success-subtle: #f0fdf4;
  --warning: #eab308;
  --warning-subtle: #fefce8;
  --danger: #ef4444;
  --danger-subtle: #fef2f2;
  --info: #3b82f6;
  --info-subtle: #eff6ff;

  /* === BORDERS === */
  --border-subtle: #f5f0ea;
  --border-default: #e7e0d8;
  --border-strong: #d6cdc2;
  --border-accent: var(--accent-solid);

  /* === CATEGORY COLORS === */
  --cat-development: #8b5cf6;    /* Purple */
  --cat-utility: #06b6d4;        /* Cyan */
  --cat-game: #22c55e;           /* Green */
  --cat-multimedia: #f43f5e;     /* Rose */
  --cat-office: #3b82f6;         /* Blue */
  --cat-graphics: #f97316;       /* Orange */
  --cat-network: #14b8a6;        /* Teal */
  --cat-system: #64748b;         /* Slate */
  --cat-other: #a855f7;          /* Violet */
}
```

### Dark Mode (Future)

```css
[data-theme="dark"] {
  --bg-base: #0c0a09;
  --bg-surface: #1c1917;
  --bg-elevated: #292524;
  --bg-sunken: #0c0a09;
  --bg-wash: #1c1917;

  --text-primary: #fafaf9;
  --text-secondary: #d6d3d1;
  --text-tertiary: #a8a29e;
  --text-quaternary: #78716c;

  --border-subtle: #292524;
  --border-default: #44403c;
  --border-strong: #57534e;
}
```

---

## Typography

### Font Stack

```css
:root {
  --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|:------|:-----|:-------|:------------|:------|
| `--text-xs` | 11px | 500 | 1.4 | Badges, timestamps |
| `--text-sm` | 13px | 400 | 1.5 | Captions, metadata |
| `--text-base` | 15px | 400 | 1.6 | Body text |
| `--text-lg` | 17px | 500 | 1.5 | Card titles |
| `--text-xl` | 20px | 600 | 1.4 | Section headers |
| `--text-2xl` | 26px | 700 | 1.3 | Page titles |
| `--text-3xl` | 32px | 700 | 1.2 | Hero text |

### Letter Spacing

```css
--tracking-tight: -0.02em;   /* Headings */
--tracking-normal: 0;        /* Body */
--tracking-wide: 0.02em;     /* All caps labels */
```

---

## Spacing System

Based on a 4px grid with comfortable density:

```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--space-9: 48px;
--space-10: 64px;
--space-11: 80px;
--space-12: 96px;
```

---

## Border Radius

Generously rounded for warmth:

```css
--radius-sm: 8px;      /* Chips, badges */
--radius-md: 12px;     /* Buttons, inputs */
--radius-lg: 16px;     /* Cards */
--radius-xl: 20px;     /* Panels */
--radius-2xl: 24px;    /* Modals */
--radius-full: 9999px; /* Pills */
```

---

## Shadows & Elevation

Warm-tinted shadows for depth:

```css
--shadow-xs: 0 1px 2px rgba(28, 25, 23, 0.04);
--shadow-sm: 0 2px 4px rgba(28, 25, 23, 0.06);
--shadow-md: 0 4px 12px rgba(28, 25, 23, 0.08);
--shadow-lg: 0 8px 24px rgba(28, 25, 23, 0.10);
--shadow-xl: 0 16px 48px rgba(28, 25, 23, 0.12);

/* Colored glows for interactive elements */
--glow-accent: 0 0 0 3px rgba(249, 115, 22, 0.15);
--glow-danger: 0 0 0 3px rgba(239, 68, 68, 0.15);
--glow-success: 0 0 0 3px rgba(34, 197, 94, 0.15);
```

---

## Motion & Animation

### Timing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Smooth deceleration */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy spring */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* Symmetric */
```

### Duration Scale

```css
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Animation Patterns

| Pattern | Duration | Easing | Usage |
|:--------|:---------|:-------|:------|
| **Fade** | 150ms | ease-out | Tooltips, modals |
| **Scale** | 200ms | spring | Buttons, cards on hover |
| **Slide** | 250ms | ease-out | Panels, drawers |
| **Stagger** | 50ms delay | ease-out | List items |
| **Spring** | 300ms | spring | Selection, focus |

### Keyframe Examples

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes staggerIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Component Specifications

### Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
  transition: transform 200ms var(--ease-spring),
              box-shadow 200ms var(--ease-out),
              border-color 150ms var(--ease-out);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-default);
}

.card--selected {
  border-color: var(--accent-solid);
  box-shadow: var(--shadow-md), var(--glow-accent);
}
```

### Buttons

```css
/* Primary - Gradient */
.btn-primary {
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  color: white;
  font-weight: 600;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform 150ms var(--ease-spring),
              box-shadow 150ms var(--ease-out);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary */
.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
}

.btn-secondary:hover {
  border-color: var(--border-strong);
  background: var(--bg-wash);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.btn-ghost:hover {
  background: var(--bg-wash);
  color: var(--text-primary);
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: border-color 150ms, box-shadow 150ms;
}

.input:focus {
  border-color: var(--accent-solid);
  box-shadow: var(--glow-accent);
  outline: none;
}

.input::placeholder {
  color: var(--text-quaternary);
}
```

### Category Chips

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  background: var(--bg-wash);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  transition: all 150ms var(--ease-out);
}

.chip--development {
  background: #f5f3ff;
  color: var(--cat-development);
  border-color: #e9e5ff;
}

.chip--utility {
  background: #ecfeff;
  color: var(--cat-utility);
  border-color: #cffafe;
}

/* ... other categories ... */
```

### Entry Card (Main Component)

```css
.entry-card {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 200ms var(--ease-spring);
}

.entry-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}

.entry-card--active {
  border-color: var(--accent-solid);
  background: var(--accent-subtle);
}

.entry-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  display: grid;
  place-items: center;
  color: white;
  font-weight: 700;
  font-size: var(--text-lg);
}

.entry-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.entry-exec {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}
```

### Modal

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 25, 23, 0.4);
  backdrop-filter: blur(4px);
  animation: fadeIn 200ms var(--ease-out);
}

.modal-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(560px, 90vw);
  max-height: 85vh;
  background: var(--bg-elevated);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: scaleIn 250ms var(--ease-spring);
}

.modal-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

---

## Layout Structure

### Page Layout

```
+--------------------------------------------------+
|  Topbar: Logo | Status | Actions                 |
+--------------------------------------------------+
|          |                      |                |
| Sidebar  |    Main Content      |   Inspector    |
| 280px    |    (flex)            |   380px        |
|          |                      |                |
| - Stats  |  - Search bar        | - Entry form   |
| - Cats   |  - Entry grid/list   | - Preview      |
| - Quick  |  - Empty state       | - Actions      |
|          |                      |                |
+--------------------------------------------------+
```

### Grid Specifications

```css
.app-shell {
  display: grid;
  grid-template-rows: 64px 1fr;
  grid-template-columns: 280px 1fr 380px;
  height: 100vh;
  gap: 0;
}

.sidebar { grid-area: 2 / 1 / 3 / 2; }
.main    { grid-area: 2 / 2 / 3 / 3; }
.inspector { grid-area: 2 / 3 / 3 / 4; }
```

---

## Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10);
  text-align: center;
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-5);
  opacity: 0.4;
}

.empty-state__title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state__description {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  max-width: 320px;
  margin-bottom: var(--space-6);
}
```

---

## Keyboard Navigation

| Shortcut | Action |
|:---------|:-------|
| `Cmd/Ctrl + N` | New entry |
| `Cmd/Ctrl + S` | Save entry |
| `Cmd/Ctrl + F` | Focus search |
| `Arrow Up/Down` | Navigate entries |
| `Enter` | Select/Edit entry |
| `Escape` | Close modal / Deselect |
| `Cmd/Ctrl + Backspace` | Delete entry |

---

## Responsive Breakpoints

```css
--bp-sm: 640px;   /* Mobile landscape */
--bp-md: 768px;   /* Tablet */
--bp-lg: 1024px;  /* Small desktop */
--bp-xl: 1280px;  /* Desktop */
--bp-2xl: 1536px; /* Large desktop */
```

### Responsive Behavior

| Breakpoint | Layout |
|:-----------|:-------|
| `< 768px` | Single column, bottom sheet inspector |
| `768px - 1024px` | Two columns (sidebar hidden), slide-out inspector |
| `> 1024px` | Full three-column layout |

---

## Accessibility

- Minimum touch target: 44x44px
- Focus visible on all interactive elements
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Reduced motion: Respect `prefers-reduced-motion`
- Screen reader: Proper ARIA labels and roles

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Checklist

- [ ] Update `globals.css` with new CSS custom properties
- [ ] Migrate `page.module.css` to new design tokens
- [ ] Implement gradient buttons and accent styling
- [ ] Add category color system to chips and icons
- [ ] Implement new shadow and border system
- [ ] Add spring animations for interactions
- [ ] Create staggered list animations
- [ ] Update modal with new styling
- [ ] Add keyboard navigation handlers
- [ ] Test responsive breakpoints
- [ ] Verify accessibility compliance

---

*Last updated: December 2024*
*Design System Version: 6.0 Aurora*
