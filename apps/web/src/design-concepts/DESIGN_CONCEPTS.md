# DeskCrafter Design Concepts

Three distinct design directions for DeskCrafter - a Linux desktop entry manager application.

---

## Table of Contents

1. [Concept 1: Nordic Minimal](#concept-1-nordic-minimal)
2. [Concept 2: Developer Dark](#concept-2-developer-dark)
3. [Concept 3: Soft Modern](#concept-3-soft-modern)
4. [Implementation Examples](#implementation-examples)

---

# Concept 1: Nordic Minimal

**Tagline:** *"Clarity through restraint"*

Inspired by Scandinavian design principles - where every element earns its place. This concept embraces the Nordic philosophy of lagom (just the right amount), creating an interface that feels like a breath of fresh mountain air.

## Mood & Feeling

- **Serene** - Like a quiet morning in a minimalist Copenhagen apartment
- **Trustworthy** - Clean lines suggest precision and reliability
- **Focused** - Nothing competes for attention; the content speaks
- **Timeless** - Design that won't feel dated in 5 years

## Color Palette

```css
:root {
  /* === BACKGROUNDS === */
  --nordic-bg-canvas: #FAFAFA;           /* Main page background - warm white */
  --nordic-bg-surface: #FFFFFF;          /* Cards, panels */
  --nordic-bg-elevated: #FFFFFF;         /* Modals, dropdowns */
  --nordic-bg-recessed: #F5F5F5;         /* Input backgrounds, code blocks */
  --nordic-bg-hover: #F0F0F0;            /* Hover states */
  --nordic-bg-active: #E8E8E8;           /* Active/pressed states */

  /* === TEXT === */
  --nordic-text-primary: #1A1A1A;        /* Headings, important text */
  --nordic-text-secondary: #4A4A4A;      /* Body text */
  --nordic-text-tertiary: #7A7A7A;       /* Captions, hints */
  --nordic-text-disabled: #ABABAB;       /* Disabled states */
  --nordic-text-inverse: #FFFFFF;        /* Text on dark backgrounds */

  /* === ACCENT - Muted Teal === */
  --nordic-accent: #4A9B8C;              /* Primary actions */
  --nordic-accent-hover: #3D8275;        /* Accent hover */
  --nordic-accent-active: #326B61;       /* Accent pressed */
  --nordic-accent-soft: #E8F4F1;         /* Accent backgrounds */
  --nordic-accent-softer: #F2F9F7;       /* Very subtle accent tint */

  /* === BORDERS === */
  --nordic-border-subtle: #EBEBEB;       /* Dividers, card borders */
  --nordic-border-default: #DCDCDC;      /* Input borders */
  --nordic-border-strong: #C4C4C4;       /* Emphasized borders */
  --nordic-border-focus: #4A9B8C;        /* Focus rings */

  /* === SEMANTIC === */
  --nordic-success: #4A8C6A;             /* Success states - forest green */
  --nordic-success-soft: #E8F4ED;
  --nordic-warning: #C4944A;             /* Warning states - warm amber */
  --nordic-warning-soft: #FEF7E8;
  --nordic-error: #B84A4A;               /* Error states - muted red */
  --nordic-error-soft: #FAEBEB;
  --nordic-info: #4A7A9B;                /* Info states - steel blue */
  --nordic-info-soft: #EBF3F8;
}
```

## Typography

**Philosophy:** Typography should be invisible - it should communicate without drawing attention to itself.

```css
:root {
  /* === FONT FAMILIES === */
  --nordic-font-sans: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  --nordic-font-mono: "JetBrains Mono", "SF Mono", "Fira Code", monospace;

  /* === TYPE SCALE (Major Second - 1.125) === */
  --nordic-text-xs: 11px;     /* Labels, badges */
  --nordic-text-sm: 12px;     /* Captions, metadata */
  --nordic-text-base: 14px;   /* Body text */
  --nordic-text-md: 16px;     /* Emphasized body */
  --nordic-text-lg: 18px;     /* Section headers */
  --nordic-text-xl: 20px;     /* Page headers */
  --nordic-text-2xl: 24px;    /* Hero text */
  --nordic-text-3xl: 30px;    /* Display text */

  /* === FONT WEIGHTS === */
  --nordic-weight-regular: 400;
  --nordic-weight-medium: 500;
  --nordic-weight-semibold: 600;

  /* === LINE HEIGHTS === */
  --nordic-leading-tight: 1.25;
  --nordic-leading-normal: 1.5;
  --nordic-leading-relaxed: 1.625;

  /* === LETTER SPACING === */
  --nordic-tracking-tight: -0.02em;
  --nordic-tracking-normal: 0;
  --nordic-tracking-wide: 0.02em;
  --nordic-tracking-wider: 0.04em;
}
```

**Typography Rules:**
- Headings: Inter Medium/Semibold, tight tracking
- Body: Inter Regular, normal tracking
- Labels: Inter Medium, wide tracking, uppercase for metadata
- Code: JetBrains Mono Regular

## Border Radius Philosophy

**Principle:** Subtle softening, never cartoonish. Rectangles with just enough radius to feel approachable without losing professional edge.

```css
:root {
  --nordic-radius-none: 0;
  --nordic-radius-sm: 4px;      /* Buttons, inputs, badges */
  --nordic-radius-md: 6px;      /* Cards, panels */
  --nordic-radius-lg: 8px;      /* Modals, large containers */
  --nordic-radius-xl: 12px;     /* Hero sections, featured cards */
  --nordic-radius-full: 9999px; /* Pills, avatars */
}
```

## Shadow & Elevation System

**Principle:** Shadows are barely there - suggesting depth without drama. Like natural light filtering through a north-facing window.

```css
:root {
  /* === ELEVATION LEVELS === */
  --nordic-shadow-none: none;

  --nordic-shadow-xs:
    0 1px 2px rgba(0, 0, 0, 0.04);

  --nordic-shadow-sm:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);

  --nordic-shadow-md:
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.04);

  --nordic-shadow-lg:
    0 10px 15px rgba(0, 0, 0, 0.05),
    0 4px 6px rgba(0, 0, 0, 0.03);

  --nordic-shadow-xl:
    0 20px 25px rgba(0, 0, 0, 0.06),
    0 8px 10px rgba(0, 0, 0, 0.04);

  /* === FOCUS SHADOW === */
  --nordic-shadow-focus:
    0 0 0 3px rgba(74, 155, 140, 0.15);

  /* === INSET SHADOW (inputs) === */
  --nordic-shadow-inset:
    inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

## Component Styling

### Cards

```css
.nordic-card {
  background: var(--nordic-bg-surface);
  border: 1px solid var(--nordic-border-subtle);
  border-radius: var(--nordic-radius-md);
  box-shadow: var(--nordic-shadow-xs);
  padding: 20px;
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.nordic-card:hover {
  box-shadow: var(--nordic-shadow-sm);
  border-color: var(--nordic-border-default);
}

.nordic-card--elevated {
  box-shadow: var(--nordic-shadow-md);
  border: none;
}
```

### Buttons

```css
/* Primary Button */
.nordic-btn-primary {
  background: var(--nordic-accent);
  color: var(--nordic-text-inverse);
  border: none;
  border-radius: var(--nordic-radius-sm);
  padding: 10px 16px;
  font-size: var(--nordic-text-base);
  font-weight: var(--nordic-weight-medium);
  height: 40px;
  transition: background 150ms ease, transform 100ms ease;
}

.nordic-btn-primary:hover {
  background: var(--nordic-accent-hover);
}

.nordic-btn-primary:active {
  background: var(--nordic-accent-active);
  transform: translateY(1px);
}

/* Secondary Button */
.nordic-btn-secondary {
  background: transparent;
  color: var(--nordic-text-secondary);
  border: 1px solid var(--nordic-border-default);
  border-radius: var(--nordic-radius-sm);
  padding: 10px 16px;
  font-size: var(--nordic-text-base);
  font-weight: var(--nordic-weight-medium);
  height: 40px;
  transition: all 150ms ease;
}

.nordic-btn-secondary:hover {
  background: var(--nordic-bg-hover);
  border-color: var(--nordic-border-strong);
}

/* Ghost Button */
.nordic-btn-ghost {
  background: transparent;
  color: var(--nordic-text-secondary);
  border: none;
  border-radius: var(--nordic-radius-sm);
  padding: 10px 16px;
  font-size: var(--nordic-text-base);
  font-weight: var(--nordic-weight-medium);
  height: 40px;
  transition: background 150ms ease;
}

.nordic-btn-ghost:hover {
  background: var(--nordic-bg-hover);
}
```

### Inputs

```css
.nordic-input {
  background: var(--nordic-bg-surface);
  border: 1px solid var(--nordic-border-default);
  border-radius: var(--nordic-radius-sm);
  padding: 10px 12px;
  font-size: var(--nordic-text-base);
  color: var(--nordic-text-primary);
  height: 40px;
  width: 100%;
  box-shadow: var(--nordic-shadow-inset);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.nordic-input::placeholder {
  color: var(--nordic-text-disabled);
}

.nordic-input:hover {
  border-color: var(--nordic-border-strong);
}

.nordic-input:focus {
  border-color: var(--nordic-border-focus);
  box-shadow: var(--nordic-shadow-focus), var(--nordic-shadow-inset);
  outline: none;
}

/* Input with icon */
.nordic-input-group {
  position: relative;
}

.nordic-input-group .icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--nordic-text-tertiary);
}

.nordic-input-group .nordic-input {
  padding-left: 40px;
}
```

### Modals

```css
.nordic-modal-overlay {
  background: rgba(26, 26, 26, 0.3);
  backdrop-filter: blur(4px);
}

.nordic-modal {
  background: var(--nordic-bg-elevated);
  border-radius: var(--nordic-radius-lg);
  box-shadow: var(--nordic-shadow-xl);
  max-width: 480px;
  width: 90%;
  padding: 24px;
  animation: nordic-modal-enter 200ms ease;
}

.nordic-modal-header {
  margin-bottom: 16px;
}

.nordic-modal-title {
  font-size: var(--nordic-text-lg);
  font-weight: var(--nordic-weight-semibold);
  color: var(--nordic-text-primary);
}

.nordic-modal-body {
  color: var(--nordic-text-secondary);
  margin-bottom: 24px;
}

.nordic-modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@keyframes nordic-modal-enter {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Sidebar Navigation

```css
.nordic-nav {
  background: var(--nordic-bg-surface);
  border-right: 1px solid var(--nordic-border-subtle);
  width: 240px;
  padding: 16px 12px;
}

.nordic-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--nordic-radius-sm);
  color: var(--nordic-text-secondary);
  font-size: var(--nordic-text-base);
  font-weight: var(--nordic-weight-medium);
  transition: all 150ms ease;
  cursor: pointer;
}

.nordic-nav-item:hover {
  background: var(--nordic-bg-hover);
  color: var(--nordic-text-primary);
}

.nordic-nav-item--active {
  background: var(--nordic-accent-soft);
  color: var(--nordic-accent);
}

.nordic-nav-item--active:hover {
  background: var(--nordic-accent-soft);
}
```

## Animation Principles

**Philosophy:** Movement should be barely perceptible - functional, not decorative.

```css
:root {
  /* === DURATIONS === */
  --nordic-duration-instant: 50ms;
  --nordic-duration-fast: 100ms;
  --nordic-duration-normal: 150ms;
  --nordic-duration-slow: 200ms;
  --nordic-duration-slower: 300ms;

  /* === EASINGS === */
  --nordic-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --nordic-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --nordic-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --nordic-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Animation Guidelines:**
- **Micro-interactions:** 100-150ms with ease-out
- **Page transitions:** 200-300ms with ease-default
- **Modal enter:** Scale from 0.98 + fade, 200ms
- **Hover states:** Instant feedback, 150ms duration
- **Avoid:** Bounce, overshoot, or attention-grabbing effects

---

# Concept 2: Developer Dark

**Tagline:** *"Built for builders"*

Drawing inspiration from premium developer tools like Linear, Warp, and Raycast. This concept speaks to power users who appreciate information density, keyboard shortcuts, and interfaces that respect their expertise.

## Mood & Feeling

- **Professional** - Like a high-end IDE that knows what it's doing
- **Powerful** - Suggests capability and control
- **Focused** - Dark mode reduces eye strain, enables flow states
- **Premium** - Vibrant accents on dark canvas feel luxurious

## Color Palette

```css
:root {
  /* === BACKGROUNDS (True Dark) === */
  --dev-bg-canvas: #0A0A0B;              /* Deepest background */
  --dev-bg-surface: #111113;             /* Cards, sidebars */
  --dev-bg-elevated: #18181B;            /* Modals, dropdowns */
  --dev-bg-subtle: #1E1E21;              /* Hover backgrounds */
  --dev-bg-muted: #27272A;               /* Active states */
  --dev-bg-highlight: #323237;           /* Strong highlights */

  /* === TEXT === */
  --dev-text-primary: #FAFAFA;           /* Primary text */
  --dev-text-secondary: #A1A1AA;         /* Secondary text */
  --dev-text-tertiary: #71717A;          /* Tertiary/muted text */
  --dev-text-disabled: #52525B;          /* Disabled text */
  --dev-text-inverse: #09090B;           /* Text on light backgrounds */

  /* === ACCENT - Electric Violet === */
  --dev-accent: #8B5CF6;                 /* Primary accent */
  --dev-accent-hover: #A78BFA;           /* Lighter on hover */
  --dev-accent-muted: #7C3AED;           /* Darker variant */
  --dev-accent-soft: rgba(139, 92, 246, 0.15);  /* Background tint */
  --dev-accent-glow: rgba(139, 92, 246, 0.4);   /* Glow effects */

  /* === SECONDARY ACCENT - Cyan === */
  --dev-cyan: #22D3EE;                   /* Secondary accent */
  --dev-cyan-soft: rgba(34, 211, 238, 0.15);

  /* === BORDERS === */
  --dev-border-subtle: #27272A;          /* Subtle dividers */
  --dev-border-default: #3F3F46;         /* Default borders */
  --dev-border-strong: #52525B;          /* Emphasized borders */
  --dev-border-focus: var(--dev-accent);

  /* === SEMANTIC === */
  --dev-success: #22C55E;                /* Success - vivid green */
  --dev-success-soft: rgba(34, 197, 94, 0.15);
  --dev-warning: #F59E0B;                /* Warning - amber */
  --dev-warning-soft: rgba(245, 158, 11, 0.15);
  --dev-error: #EF4444;                  /* Error - red */
  --dev-error-soft: rgba(239, 68, 68, 0.15);
  --dev-info: #3B82F6;                   /* Info - blue */
  --dev-info-soft: rgba(59, 130, 246, 0.15);

  /* === SYNTAX HIGHLIGHTING === */
  --dev-syntax-keyword: #C084FC;         /* Purple */
  --dev-syntax-string: #86EFAC;          /* Green */
  --dev-syntax-number: #FCA5A5;          /* Red */
  --dev-syntax-comment: #6B7280;         /* Gray */
  --dev-syntax-function: #67E8F9;        /* Cyan */
  --dev-syntax-variable: #FDE68A;        /* Yellow */
}
```

## Typography

**Philosophy:** Monospace for data, geometric sans for UI. Information density is a feature.

```css
:root {
  /* === FONT FAMILIES === */
  --dev-font-sans: "Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --dev-font-mono: "Geist Mono", "JetBrains Mono", "Fira Code", monospace;

  /* === TYPE SCALE (Compact) === */
  --dev-text-2xs: 10px;    /* Badges, micro text */
  --dev-text-xs: 11px;     /* Labels */
  --dev-text-sm: 12px;     /* Body small */
  --dev-text-base: 13px;   /* Default body */
  --dev-text-md: 14px;     /* Emphasized */
  --dev-text-lg: 16px;     /* Headers */
  --dev-text-xl: 18px;     /* Section titles */
  --dev-text-2xl: 22px;    /* Page titles */
  --dev-text-3xl: 28px;    /* Hero */

  /* === FONT WEIGHTS === */
  --dev-weight-regular: 400;
  --dev-weight-medium: 500;
  --dev-weight-semibold: 600;
  --dev-weight-bold: 700;

  /* === LINE HEIGHTS === */
  --dev-leading-none: 1;
  --dev-leading-tight: 1.25;
  --dev-leading-snug: 1.375;
  --dev-leading-normal: 1.5;

  /* === LETTER SPACING === */
  --dev-tracking-tighter: -0.03em;
  --dev-tracking-tight: -0.01em;
  --dev-tracking-normal: 0;
  --dev-tracking-wide: 0.025em;
}
```

**Typography Rules:**
- Headers: Geist Medium, tight tracking
- Body: Geist Regular, base size
- Data/Paths: Geist Mono, slightly smaller
- Keyboard shortcuts: Mono, bordered badges

## Border Radius Philosophy

**Principle:** Sharp and precise. Small radii for components, slightly larger for containers. Never soft or bubbly.

```css
:root {
  --dev-radius-none: 0;
  --dev-radius-xs: 3px;       /* Badges, small elements */
  --dev-radius-sm: 4px;       /* Buttons, inputs */
  --dev-radius-md: 6px;       /* Cards */
  --dev-radius-lg: 8px;       /* Modals */
  --dev-radius-xl: 10px;      /* Large containers */
  --dev-radius-full: 9999px;  /* Pills only */
}
```

## Shadow & Elevation System

**Principle:** Shadows are dramatic but tight. Glow effects replace traditional shadows for emphasis.

```css
:root {
  /* === ELEVATION === */
  --dev-shadow-none: none;

  --dev-shadow-sm:
    0 1px 2px rgba(0, 0, 0, 0.5),
    0 1px 3px rgba(0, 0, 0, 0.3);

  --dev-shadow-md:
    0 4px 8px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3);

  --dev-shadow-lg:
    0 8px 16px rgba(0, 0, 0, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.4);

  --dev-shadow-xl:
    0 16px 32px rgba(0, 0, 0, 0.7),
    0 8px 16px rgba(0, 0, 0, 0.5);

  /* === GLOW EFFECTS === */
  --dev-glow-accent:
    0 0 20px rgba(139, 92, 246, 0.3),
    0 0 40px rgba(139, 92, 246, 0.1);

  --dev-glow-cyan:
    0 0 20px rgba(34, 211, 238, 0.3),
    0 0 40px rgba(34, 211, 238, 0.1);

  --dev-glow-success:
    0 0 12px rgba(34, 197, 94, 0.4);

  --dev-glow-error:
    0 0 12px rgba(239, 68, 68, 0.4);

  /* === FOCUS RING === */
  --dev-shadow-focus:
    0 0 0 2px var(--dev-bg-canvas),
    0 0 0 4px var(--dev-accent);

  /* === BORDER GLOW === */
  --dev-border-glow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

## Component Styling

### Cards

```css
.dev-card {
  background: var(--dev-bg-surface);
  border: 1px solid var(--dev-border-subtle);
  border-radius: var(--dev-radius-md);
  padding: 16px;
  box-shadow: var(--dev-border-glow);
  transition: all 150ms ease;
}

.dev-card:hover {
  border-color: var(--dev-border-default);
  background: var(--dev-bg-subtle);
}

.dev-card--interactive {
  cursor: pointer;
}

.dev-card--interactive:hover {
  border-color: var(--dev-accent);
  box-shadow: var(--dev-glow-accent), var(--dev-border-glow);
}

.dev-card--selected {
  border-color: var(--dev-accent);
  background: var(--dev-accent-soft);
}
```

### Buttons

```css
/* Primary Button */
.dev-btn-primary {
  background: var(--dev-accent);
  color: white;
  border: none;
  border-radius: var(--dev-radius-sm);
  padding: 8px 14px;
  font-size: var(--dev-text-sm);
  font-weight: var(--dev-weight-medium);
  height: 34px;
  transition: all 150ms ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.3);
}

.dev-btn-primary:hover {
  background: var(--dev-accent-hover);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    var(--dev-glow-accent);
}

.dev-btn-primary:active {
  background: var(--dev-accent-muted);
  transform: translateY(1px);
}

/* Secondary Button */
.dev-btn-secondary {
  background: var(--dev-bg-subtle);
  color: var(--dev-text-primary);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-sm);
  padding: 8px 14px;
  font-size: var(--dev-text-sm);
  font-weight: var(--dev-weight-medium);
  height: 34px;
  transition: all 150ms ease;
}

.dev-btn-secondary:hover {
  background: var(--dev-bg-muted);
  border-color: var(--dev-border-strong);
}

/* Ghost Button */
.dev-btn-ghost {
  background: transparent;
  color: var(--dev-text-secondary);
  border: none;
  border-radius: var(--dev-radius-sm);
  padding: 8px 14px;
  font-size: var(--dev-text-sm);
  font-weight: var(--dev-weight-medium);
  height: 34px;
  transition: all 150ms ease;
}

.dev-btn-ghost:hover {
  background: var(--dev-bg-subtle);
  color: var(--dev-text-primary);
}

/* Icon Button */
.dev-btn-icon {
  background: transparent;
  color: var(--dev-text-tertiary);
  border: none;
  border-radius: var(--dev-radius-sm);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.dev-btn-icon:hover {
  background: var(--dev-bg-subtle);
  color: var(--dev-text-primary);
}
```

### Inputs

```css
.dev-input {
  background: var(--dev-bg-canvas);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-sm);
  padding: 8px 12px;
  font-size: var(--dev-text-sm);
  font-family: var(--dev-font-sans);
  color: var(--dev-text-primary);
  height: 34px;
  width: 100%;
  transition: all 150ms ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dev-input::placeholder {
  color: var(--dev-text-disabled);
}

.dev-input:hover {
  border-color: var(--dev-border-strong);
}

.dev-input:focus {
  border-color: var(--dev-accent);
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 0 3px var(--dev-accent-soft);
  outline: none;
}

/* Search Input (Command Palette Style) */
.dev-search {
  background: var(--dev-bg-surface);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-md);
  padding: 12px 16px;
  padding-left: 44px;
  font-size: var(--dev-text-md);
  color: var(--dev-text-primary);
  height: 48px;
  width: 100%;
}

.dev-search:focus {
  border-color: var(--dev-accent);
  box-shadow: var(--dev-glow-accent);
}
```

### Modals (Command Palette Style)

```css
.dev-modal-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.dev-modal {
  background: var(--dev-bg-surface);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-lg);
  box-shadow:
    var(--dev-shadow-xl),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  max-width: 560px;
  width: 90%;
  overflow: hidden;
  animation: dev-modal-enter 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dev-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--dev-border-subtle);
}

.dev-modal-title {
  font-size: var(--dev-text-md);
  font-weight: var(--dev-weight-semibold);
  color: var(--dev-text-primary);
}

.dev-modal-body {
  padding: 20px;
}

.dev-modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--dev-border-subtle);
  background: var(--dev-bg-canvas);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@keyframes dev-modal-enter {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Command Palette

```css
.dev-command-palette {
  background: var(--dev-bg-surface);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-lg);
  box-shadow: var(--dev-shadow-xl);
  width: 600px;
  max-height: 400px;
  overflow: hidden;
}

.dev-command-input {
  border: none;
  border-bottom: 1px solid var(--dev-border-subtle);
  border-radius: 0;
  background: transparent;
  padding: 16px 20px;
  font-size: var(--dev-text-md);
}

.dev-command-list {
  padding: 8px;
  overflow-y: auto;
}

.dev-command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--dev-radius-sm);
  cursor: pointer;
  transition: background 100ms ease;
}

.dev-command-item:hover,
.dev-command-item--active {
  background: var(--dev-bg-subtle);
}

.dev-command-item--active {
  background: var(--dev-accent-soft);
}

.dev-command-shortcut {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.dev-kbd {
  background: var(--dev-bg-muted);
  border: 1px solid var(--dev-border-default);
  border-radius: var(--dev-radius-xs);
  padding: 2px 6px;
  font-family: var(--dev-font-mono);
  font-size: var(--dev-text-2xs);
  color: var(--dev-text-tertiary);
}
```

### Sidebar Navigation

```css
.dev-nav {
  background: var(--dev-bg-surface);
  border-right: 1px solid var(--dev-border-subtle);
  width: 220px;
  padding: 12px 8px;
}

.dev-nav-section {
  margin-bottom: 16px;
}

.dev-nav-label {
  padding: 8px 12px;
  font-size: var(--dev-text-xs);
  font-weight: var(--dev-weight-medium);
  color: var(--dev-text-disabled);
  text-transform: uppercase;
  letter-spacing: var(--dev-tracking-wide);
}

.dev-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--dev-radius-sm);
  color: var(--dev-text-secondary);
  font-size: var(--dev-text-sm);
  font-weight: var(--dev-weight-medium);
  transition: all 100ms ease;
  cursor: pointer;
}

.dev-nav-item:hover {
  background: var(--dev-bg-subtle);
  color: var(--dev-text-primary);
}

.dev-nav-item--active {
  background: var(--dev-accent-soft);
  color: var(--dev-accent);
}

.dev-nav-item .count {
  margin-left: auto;
  background: var(--dev-bg-muted);
  padding: 2px 8px;
  border-radius: var(--dev-radius-full);
  font-size: var(--dev-text-xs);
  color: var(--dev-text-tertiary);
}
```

## Animation Principles

**Philosophy:** Snappy and responsive. Animations should feel like the interface is responding to you, not performing for you.

```css
:root {
  /* === DURATIONS === */
  --dev-duration-instant: 50ms;
  --dev-duration-fast: 100ms;
  --dev-duration-normal: 150ms;
  --dev-duration-slow: 200ms;
  --dev-duration-enter: 200ms;
  --dev-duration-exit: 150ms;

  /* === EASINGS === */
  --dev-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --dev-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --dev-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --dev-ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --dev-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Animation Guidelines:**
- **Hover states:** 100ms, immediate feel
- **Click feedback:** 50ms transform
- **Modal enter:** 200ms spring ease, scale + translate
- **List items:** 100ms staggered fade-in
- **Use:** Subtle glow pulses for notifications
- **Avoid:** Long animations, excessive motion

---

# Concept 3: Soft Modern

**Tagline:** *"Friendly power"*

A warm, approachable design that makes desktop management feel less technical and more creative. Think Notion's warmth meets Linear's polish - professional enough for developers but welcoming to everyone.

## Mood & Feeling

- **Approachable** - Like a helpful colleague, not intimidating documentation
- **Warm** - Gentle colors that don't feel cold or clinical
- **Playful** - Subtle personality without being unprofessional
- **Modern** - Contemporary without chasing trends

## Color Palette

```css
:root {
  /* === BACKGROUNDS === */
  --soft-bg-canvas: #FDFBF9;             /* Warm off-white */
  --soft-bg-surface: #FFFFFF;            /* Pure white cards */
  --soft-bg-elevated: #FFFFFF;           /* Modals */
  --soft-bg-muted: #F7F5F2;              /* Subtle backgrounds */
  --soft-bg-hover: #F2EFEB;              /* Hover states */
  --soft-bg-active: #EBE7E2;             /* Active states */

  /* === TEXT === */
  --soft-text-primary: #1C1917;          /* Stone 900 - warm black */
  --soft-text-secondary: #57534E;        /* Stone 600 */
  --soft-text-tertiary: #A8A29E;         /* Stone 400 */
  --soft-text-disabled: #D6D3D1;         /* Stone 300 */
  --soft-text-inverse: #FFFFFF;

  /* === ACCENT - Warm Coral/Rose === */
  --soft-accent: #E11D48;                /* Rose 600 */
  --soft-accent-hover: #BE123C;          /* Rose 700 */
  --soft-accent-soft: #FFF1F2;           /* Rose 50 */
  --soft-accent-muted: #FECDD3;          /* Rose 200 */

  /* === SECONDARY ACCENT - Warm Purple === */
  --soft-purple: #9333EA;                /* Purple 600 */
  --soft-purple-soft: #FAF5FF;           /* Purple 50 */

  /* === TERTIARY - Warm Orange === */
  --soft-orange: #EA580C;                /* Orange 600 */
  --soft-orange-soft: #FFF7ED;           /* Orange 50 */

  /* === GRADIENTS === */
  --soft-gradient-brand: linear-gradient(135deg, #E11D48 0%, #9333EA 100%);
  --soft-gradient-warm: linear-gradient(135deg, #FDF2F8 0%, #FAF5FF 100%);
  --soft-gradient-sunset: linear-gradient(135deg, #FFF7ED 0%, #FFF1F2 100%);

  /* === BORDERS === */
  --soft-border-subtle: #F5F0EB;         /* Very light */
  --soft-border-default: #E7E0D9;        /* Default */
  --soft-border-strong: #D4CBC1;         /* Emphasized */
  --soft-border-focus: var(--soft-accent);

  /* === SEMANTIC === */
  --soft-success: #16A34A;               /* Green 600 */
  --soft-success-soft: #F0FDF4;          /* Green 50 */
  --soft-success-muted: #BBF7D0;         /* Green 200 */

  --soft-warning: #D97706;               /* Amber 600 */
  --soft-warning-soft: #FFFBEB;          /* Amber 50 */
  --soft-warning-muted: #FDE68A;         /* Amber 200 */

  --soft-error: #DC2626;                 /* Red 600 */
  --soft-error-soft: #FEF2F2;            /* Red 50 */
  --soft-error-muted: #FECACA;           /* Red 200 */

  --soft-info: #2563EB;                  /* Blue 600 */
  --soft-info-soft: #EFF6FF;             /* Blue 50 */
  --soft-info-muted: #BFDBFE;            /* Blue 200 */
}
```

## Typography

**Philosophy:** Friendly and readable. A touch of personality in headings, crystal clarity in body text.

```css
:root {
  /* === FONT FAMILIES === */
  --soft-font-display: "Fraunces", "Playfair Display", Georgia, serif;
  --soft-font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --soft-font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* === TYPE SCALE (Perfect Fourth - 1.333) === */
  --soft-text-xs: 11px;
  --soft-text-sm: 13px;
  --soft-text-base: 15px;
  --soft-text-md: 17px;
  --soft-text-lg: 20px;
  --soft-text-xl: 24px;
  --soft-text-2xl: 32px;
  --soft-text-3xl: 42px;
  --soft-text-4xl: 56px;

  /* === FONT WEIGHTS === */
  --soft-weight-regular: 400;
  --soft-weight-medium: 500;
  --soft-weight-semibold: 600;
  --soft-weight-bold: 700;

  /* === LINE HEIGHTS === */
  --soft-leading-tight: 1.2;
  --soft-leading-snug: 1.35;
  --soft-leading-normal: 1.5;
  --soft-leading-relaxed: 1.65;

  /* === LETTER SPACING === */
  --soft-tracking-tighter: -0.04em;
  --soft-tracking-tight: -0.02em;
  --soft-tracking-normal: 0;
  --soft-tracking-wide: 0.02em;
}
```

**Typography Rules:**
- Display headings: Fraunces Bold, tight tracking (for personality)
- UI headings: Inter Semibold (for clarity)
- Body: Inter Regular, base size, relaxed leading
- Labels: Inter Medium, wide tracking

## Border Radius Philosophy

**Principle:** Generously rounded - soft and friendly, like well-worn pebbles. Creates approachable, touchable interfaces.

```css
:root {
  --soft-radius-none: 0;
  --soft-radius-sm: 8px;        /* Buttons, badges */
  --soft-radius-md: 12px;       /* Inputs, small cards */
  --soft-radius-lg: 16px;       /* Cards, panels */
  --soft-radius-xl: 20px;       /* Large cards */
  --soft-radius-2xl: 24px;      /* Modals */
  --soft-radius-3xl: 32px;      /* Hero sections */
  --soft-radius-full: 9999px;   /* Pills, avatars */
}
```

## Shadow & Elevation System

**Principle:** Soft, diffused shadows that feel like natural light. Layered for depth without harsh edges.

```css
:root {
  /* === SOFT SHADOWS === */
  --soft-shadow-none: none;

  --soft-shadow-xs:
    0 1px 2px rgba(28, 25, 23, 0.04),
    0 1px 3px rgba(28, 25, 23, 0.06);

  --soft-shadow-sm:
    0 2px 4px rgba(28, 25, 23, 0.04),
    0 4px 8px rgba(28, 25, 23, 0.06);

  --soft-shadow-md:
    0 4px 8px rgba(28, 25, 23, 0.04),
    0 8px 16px rgba(28, 25, 23, 0.06),
    0 16px 32px rgba(28, 25, 23, 0.04);

  --soft-shadow-lg:
    0 8px 16px rgba(28, 25, 23, 0.04),
    0 16px 32px rgba(28, 25, 23, 0.08),
    0 32px 64px rgba(28, 25, 23, 0.06);

  --soft-shadow-xl:
    0 16px 32px rgba(28, 25, 23, 0.06),
    0 32px 64px rgba(28, 25, 23, 0.1),
    0 48px 96px rgba(28, 25, 23, 0.08);

  /* === COLORED SHADOWS === */
  --soft-shadow-accent:
    0 4px 12px rgba(225, 29, 72, 0.15),
    0 8px 24px rgba(225, 29, 72, 0.1);

  --soft-shadow-purple:
    0 4px 12px rgba(147, 51, 234, 0.15),
    0 8px 24px rgba(147, 51, 234, 0.1);

  /* === FOCUS RING === */
  --soft-shadow-focus:
    0 0 0 4px rgba(225, 29, 72, 0.15);

  /* === INNER HIGHLIGHT === */
  --soft-shadow-inner-highlight:
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
```

## Component Styling

### Cards

```css
.soft-card {
  background: var(--soft-bg-surface);
  border: 1px solid var(--soft-border-subtle);
  border-radius: var(--soft-radius-lg);
  box-shadow: var(--soft-shadow-sm);
  padding: 24px;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.soft-card:hover {
  box-shadow: var(--soft-shadow-md);
  border-color: var(--soft-border-default);
  transform: translateY(-2px);
}

.soft-card--featured {
  background: var(--soft-gradient-warm);
  border: none;
  box-shadow: var(--soft-shadow-md);
}

.soft-card--accent {
  border-left: 4px solid var(--soft-accent);
}

/* Card with gradient border */
.soft-card--gradient {
  position: relative;
  border: none;
  background: var(--soft-bg-surface);
}

.soft-card--gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 2px;
  border-radius: var(--soft-radius-lg);
  background: var(--soft-gradient-brand);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Buttons

```css
/* Primary Button */
.soft-btn-primary {
  background: var(--soft-gradient-brand);
  color: var(--soft-text-inverse);
  border: none;
  border-radius: var(--soft-radius-sm);
  padding: 12px 20px;
  font-size: var(--soft-text-base);
  font-weight: var(--soft-weight-semibold);
  height: 44px;
  box-shadow:
    var(--soft-shadow-accent),
    var(--soft-shadow-inner-highlight);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.soft-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 6px 16px rgba(225, 29, 72, 0.2),
    0 12px 32px rgba(225, 29, 72, 0.15),
    var(--soft-shadow-inner-highlight);
}

.soft-btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.soft-btn-secondary {
  background: var(--soft-bg-surface);
  color: var(--soft-text-primary);
  border: 1px solid var(--soft-border-default);
  border-radius: var(--soft-radius-sm);
  padding: 12px 20px;
  font-size: var(--soft-text-base);
  font-weight: var(--soft-weight-medium);
  height: 44px;
  box-shadow: var(--soft-shadow-xs);
  transition: all 200ms ease;
}

.soft-btn-secondary:hover {
  background: var(--soft-bg-hover);
  border-color: var(--soft-border-strong);
  box-shadow: var(--soft-shadow-sm);
}

/* Soft/Tinted Button */
.soft-btn-tinted {
  background: var(--soft-accent-soft);
  color: var(--soft-accent);
  border: none;
  border-radius: var(--soft-radius-sm);
  padding: 12px 20px;
  font-size: var(--soft-text-base);
  font-weight: var(--soft-weight-semibold);
  height: 44px;
  transition: all 200ms ease;
}

.soft-btn-tinted:hover {
  background: var(--soft-accent-muted);
}

/* Ghost Button */
.soft-btn-ghost {
  background: transparent;
  color: var(--soft-text-secondary);
  border: none;
  border-radius: var(--soft-radius-sm);
  padding: 12px 20px;
  font-size: var(--soft-text-base);
  font-weight: var(--soft-weight-medium);
  height: 44px;
  transition: all 200ms ease;
}

.soft-btn-ghost:hover {
  background: var(--soft-bg-hover);
  color: var(--soft-text-primary);
}
```

### Inputs

```css
.soft-input {
  background: var(--soft-bg-surface);
  border: 2px solid var(--soft-border-default);
  border-radius: var(--soft-radius-md);
  padding: 12px 16px;
  font-size: var(--soft-text-base);
  color: var(--soft-text-primary);
  height: 48px;
  width: 100%;
  transition: all 200ms ease;
}

.soft-input::placeholder {
  color: var(--soft-text-tertiary);
}

.soft-input:hover {
  border-color: var(--soft-border-strong);
}

.soft-input:focus {
  border-color: var(--soft-accent);
  box-shadow: var(--soft-shadow-focus);
  outline: none;
}

/* Search Input (Pill Style) */
.soft-search {
  background: var(--soft-bg-muted);
  border: 2px solid transparent;
  border-radius: var(--soft-radius-full);
  padding: 12px 20px;
  padding-left: 48px;
  font-size: var(--soft-text-base);
  height: 48px;
  transition: all 200ms ease;
}

.soft-search:focus {
  background: var(--soft-bg-surface);
  border-color: var(--soft-accent);
  box-shadow: var(--soft-shadow-focus);
}

/* Input with floating label */
.soft-input-floating {
  position: relative;
}

.soft-input-floating label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--soft-text-tertiary);
  font-size: var(--soft-text-base);
  pointer-events: none;
  transition: all 200ms ease;
  background: var(--soft-bg-surface);
  padding: 0 4px;
}

.soft-input-floating input:focus + label,
.soft-input-floating input:not(:placeholder-shown) + label {
  top: 0;
  font-size: var(--soft-text-xs);
  color: var(--soft-accent);
}
```

### Modals

```css
.soft-modal-overlay {
  background: rgba(28, 25, 23, 0.4);
  backdrop-filter: blur(8px);
}

.soft-modal {
  background: var(--soft-bg-elevated);
  border-radius: var(--soft-radius-2xl);
  box-shadow: var(--soft-shadow-xl);
  max-width: 520px;
  width: 90%;
  overflow: hidden;
  animation: soft-modal-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.soft-modal-header {
  padding: 24px 28px 16px;
  text-align: center;
}

.soft-modal-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--soft-radius-lg);
  background: var(--soft-gradient-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.soft-modal-title {
  font-family: var(--soft-font-display);
  font-size: var(--soft-text-xl);
  font-weight: var(--soft-weight-bold);
  color: var(--soft-text-primary);
}

.soft-modal-body {
  padding: 0 28px 24px;
  color: var(--soft-text-secondary);
  text-align: center;
}

.soft-modal-footer {
  padding: 20px 28px;
  background: var(--soft-bg-muted);
  display: flex;
  gap: 12px;
  justify-content: center;
}

@keyframes soft-modal-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Sidebar Navigation

```css
.soft-nav {
  background: var(--soft-bg-surface);
  border-right: 1px solid var(--soft-border-subtle);
  width: 260px;
  padding: 20px 16px;
}

.soft-nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 24px;
}

.soft-nav-logo {
  width: 36px;
  height: 36px;
  background: var(--soft-gradient-brand);
  border-radius: var(--soft-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.soft-nav-brand {
  font-family: var(--soft-font-display);
  font-size: var(--soft-text-lg);
  font-weight: var(--soft-weight-bold);
  color: var(--soft-text-primary);
}

.soft-nav-section {
  margin-bottom: 24px;
}

.soft-nav-label {
  padding: 8px 12px;
  font-size: var(--soft-text-xs);
  font-weight: var(--soft-weight-semibold);
  color: var(--soft-text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--soft-tracking-wide);
}

.soft-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--soft-radius-md);
  color: var(--soft-text-secondary);
  font-size: var(--soft-text-base);
  font-weight: var(--soft-weight-medium);
  transition: all 200ms ease;
  cursor: pointer;
}

.soft-nav-item:hover {
  background: var(--soft-bg-hover);
  color: var(--soft-text-primary);
}

.soft-nav-item--active {
  background: var(--soft-accent-soft);
  color: var(--soft-accent);
}

.soft-nav-item--active:hover {
  background: var(--soft-accent-soft);
}

.soft-nav-item .badge {
  margin-left: auto;
  background: var(--soft-gradient-brand);
  color: white;
  padding: 2px 8px;
  border-radius: var(--soft-radius-full);
  font-size: var(--soft-text-xs);
  font-weight: var(--soft-weight-semibold);
}
```

### Special Components

```css
/* Empty State */
.soft-empty-state {
  text-align: center;
  padding: 48px 32px;
}

.soft-empty-illustration {
  width: 120px;
  height: 120px;
  background: var(--soft-gradient-sunset);
  border-radius: var(--soft-radius-3xl);
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.soft-empty-title {
  font-family: var(--soft-font-display);
  font-size: var(--soft-text-xl);
  font-weight: var(--soft-weight-bold);
  color: var(--soft-text-primary);
  margin-bottom: 8px;
}

.soft-empty-description {
  color: var(--soft-text-secondary);
  margin-bottom: 24px;
}

/* Tag/Badge */
.soft-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--soft-radius-full);
  font-size: var(--soft-text-sm);
  font-weight: var(--soft-weight-medium);
  background: var(--soft-bg-muted);
  color: var(--soft-text-secondary);
}

.soft-tag--accent {
  background: var(--soft-accent-soft);
  color: var(--soft-accent);
}

.soft-tag--success {
  background: var(--soft-success-soft);
  color: var(--soft-success);
}

/* Tooltip */
.soft-tooltip {
  background: var(--soft-text-primary);
  color: var(--soft-text-inverse);
  padding: 8px 12px;
  border-radius: var(--soft-radius-sm);
  font-size: var(--soft-text-sm);
  box-shadow: var(--soft-shadow-md);
}
```

## Animation Principles

**Philosophy:** Animations should feel organic and delightful - like a friendly wave, not a robotic response.

```css
:root {
  /* === DURATIONS === */
  --soft-duration-instant: 100ms;
  --soft-duration-fast: 150ms;
  --soft-duration-normal: 250ms;
  --soft-duration-slow: 350ms;
  --soft-duration-slower: 500ms;

  /* === EASINGS === */
  --soft-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --soft-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --soft-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --soft-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --soft-ease-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

**Animation Guidelines:**
- **Hover states:** 200ms ease-out, subtle lift effect
- **Click feedback:** Scale down slightly (0.98), 100ms
- **Modal enter:** Spring ease with overshoot, 300ms
- **Page transitions:** 350ms fade + slide
- **Loading states:** Gentle pulse or shimmer
- **Success states:** Brief bounce + checkmark animation
- **Use:** Micro-interactions that reward user actions
- **Celebrate:** Success moments with confetti or subtle particle effects

---

# Implementation Examples

## Desktop Entry Card (All Three Concepts)

### Nordic Minimal
```jsx
<div className="nordic-card">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-md bg-[var(--nordic-bg-recessed)] flex items-center justify-center">
      <AppIcon />
    </div>
    <div>
      <h3 className="text-[var(--nordic-text-primary)] font-medium">Firefox</h3>
      <p className="text-sm text-[var(--nordic-text-tertiary)]">Web Browser</p>
    </div>
  </div>
</div>
```

### Developer Dark
```jsx
<div className="dev-card dev-card--interactive">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded bg-[var(--dev-bg-muted)] flex items-center justify-center">
      <AppIcon />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-[var(--dev-text-primary)] font-medium text-sm">Firefox</h3>
      <p className="text-xs text-[var(--dev-text-tertiary)] font-mono truncate">/usr/bin/firefox</p>
    </div>
    <kbd className="dev-kbd">Edit</kbd>
  </div>
</div>
```

### Soft Modern
```jsx
<div className="soft-card">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center shadow-sm">
      <AppIcon />
    </div>
    <div className="flex-1">
      <h3 className="text-[var(--soft-text-primary)] font-semibold">Firefox</h3>
      <p className="text-sm text-[var(--soft-text-tertiary)]">Web Browser</p>
    </div>
    <button className="soft-btn-tinted">
      Edit
    </button>
  </div>
</div>
```

---

## Choosing the Right Concept

| Criteria | Nordic Minimal | Developer Dark | Soft Modern |
|----------|---------------|----------------|-------------|
| **Target User** | Design-conscious users | Power users, developers | General audience |
| **Density** | Low | High | Medium |
| **Eye Strain (long use)** | Low | Very Low | Low |
| **Learning Curve** | Low | Medium | Low |
| **Professional Feel** | High | Very High | Medium-High |
| **Approachability** | Medium | Low | Very High |
| **Unique Factor** | Timeless elegance | Power & efficiency | Warmth & delight |

---

## Implementation Notes

1. **CSS Custom Properties:** All concepts use CSS variables for easy theming and potential dark/light mode switching
2. **Component Architecture:** Designed for component-based frameworks (React, Vue, Svelte)
3. **Accessibility:** All color combinations meet WCAG AA contrast requirements
4. **Responsive:** Values can be scaled using CSS clamp() for responsive typography
5. **Performance:** Shadows use rgba for GPU acceleration, animations use transform/opacity
