# DeskCrafter Design Concepts - Quick Reference

## At a Glance

| Property | Nordic Minimal | Developer Dark | Soft Modern |
|----------|---------------|----------------|-------------|
| **Primary BG** | `#FAFAFA` | `#0A0A0B` | `#FDFBF9` |
| **Surface** | `#FFFFFF` | `#111113` | `#FFFFFF` |
| **Text Primary** | `#1A1A1A` | `#FAFAFA` | `#1C1917` |
| **Text Secondary** | `#4A4A4A` | `#A1A1AA` | `#57534E` |
| **Accent** | `#4A9B8C` (Teal) | `#8B5CF6` (Violet) | `#E11D48` (Rose) |
| **Border Radius** | 4-8px (subtle) | 3-6px (sharp) | 8-24px (rounded) |
| **Shadows** | Soft, diffused | Dark, with glows | Layered, colorful |
| **Font Sans** | Inter | Geist | Inter |
| **Font Display** | Inter | Geist | Fraunces (serif) |
| **Body Font Size** | 14px | 13px | 15px |
| **Button Height** | 40px | 34px | 44px |
| **Animation Speed** | 150-200ms | 100-150ms | 200-350ms |

---

## Color Palettes Side by Side

### Backgrounds
```
Nordic Minimal         Developer Dark         Soft Modern
#FAFAFA (canvas)       #0A0A0B (canvas)       #FDFBF9 (canvas)
#FFFFFF (surface)      #111113 (surface)      #FFFFFF (surface)
#F5F5F5 (recessed)     #18181B (elevated)     #F7F5F2 (muted)
#F0F0F0 (hover)        #1E1E21 (subtle)       #F2EFEB (hover)
#E8E8E8 (active)       #27272A (muted)        #EBE7E2 (active)
```

### Accents
```
Nordic Minimal         Developer Dark         Soft Modern
#4A9B8C (primary)      #8B5CF6 (primary)      #E11D48 (primary)
#3D8275 (hover)        #A78BFA (hover)        #BE123C (hover)
#326B61 (active)       #7C3AED (muted)        Gradient (brand)
#E8F4F1 (soft)         rgba(139,92,246,0.15)  #FFF1F2 (soft)
```

### Semantic Colors
```
                       Nordic     Developer   Soft
Success               #4A8C6A    #22C55E     #16A34A
Warning               #C4944A    #F59E0B     #D97706
Error                 #B84A4A    #EF4444     #DC2626
Info                  #4A7A9B    #3B82F6     #2563EB
```

---

## Typography Quick Setup

### Nordic Minimal
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

body {
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #4A4A4A;
}

h1 { font-size: 30px; font-weight: 600; color: #1A1A1A; }
h2 { font-size: 24px; font-weight: 600; color: #1A1A1A; }
h3 { font-size: 20px; font-weight: 500; color: #1A1A1A; }
```

### Developer Dark
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

body {
  font-family: "Geist", sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #A1A1AA;
}

h1 { font-size: 28px; font-weight: 700; color: #FAFAFA; letter-spacing: -0.03em; }
h2 { font-size: 22px; font-weight: 600; color: #FAFAFA; letter-spacing: -0.01em; }
h3 { font-size: 18px; font-weight: 600; color: #FAFAFA; }
```

### Soft Modern
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

body {
  font-family: "Inter", sans-serif;
  font-size: 15px;
  line-height: 1.65;
  color: #57534E;
}

h1 { font-family: "Fraunces", serif; font-size: 42px; font-weight: 700; color: #1C1917; }
h2 { font-family: "Fraunces", serif; font-size: 32px; font-weight: 600; color: #1C1917; }
h3 { font-size: 24px; font-weight: 600; color: #1C1917; }
```

---

## Key Component Recipes

### Primary Button

**Nordic Minimal**
```css
.btn-primary {
  background: #4A9B8C;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  height: 40px;
  transition: background 150ms ease;
}
.btn-primary:hover { background: #3D8275; }
```

**Developer Dark**
```css
.btn-primary {
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 14px;
  font-weight: 500;
  height: 34px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3);
  transition: all 150ms ease;
}
.btn-primary:hover {
  background: #A78BFA;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px rgba(139,92,246,0.3);
}
```

**Soft Modern**
```css
.btn-primary {
  background: linear-gradient(135deg, #E11D48 0%, #9333EA 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  height: 44px;
  box-shadow: 0 4px 12px rgba(225,29,72,0.15), inset 0 1px 0 rgba(255,255,255,0.5);
  transition: all 200ms ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(225,29,72,0.2), 0 12px 32px rgba(225,29,72,0.15);
}
```

### Card Component

**Nordic Minimal**
```css
.card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: box-shadow 200ms ease, border-color 200ms ease;
}
.card:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  border-color: #DCDCDC;
}
```

**Developer Dark**
```css
.card {
  background: #111113;
  border: 1px solid #27272A;
  border-radius: 6px;
  padding: 16px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  transition: all 150ms ease;
}
.card:hover {
  border-color: #3F3F46;
  background: #1E1E21;
}
.card--interactive:hover {
  border-color: #8B5CF6;
  box-shadow: 0 0 20px rgba(139,92,246,0.3);
}
```

**Soft Modern**
```css
.card {
  background: #FFFFFF;
  border: 1px solid #F5F0EB;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(28,25,23,0.04), 0 4px 8px rgba(28,25,23,0.06);
  transition: all 250ms ease;
}
.card:hover {
  box-shadow: 0 4px 8px rgba(28,25,23,0.04), 0 8px 16px rgba(28,25,23,0.06), 0 16px 32px rgba(28,25,23,0.04);
  border-color: #E7E0D9;
  transform: translateY(-2px);
}
```

### Input Field

**Nordic Minimal**
```css
.input {
  background: #FFFFFF;
  border: 1px solid #DCDCDC;
  border-radius: 4px;
  padding: 10px 12px;
  height: 40px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input:focus {
  border-color: #4A9B8C;
  box-shadow: 0 0 0 3px rgba(74,155,140,0.15);
}
```

**Developer Dark**
```css
.input {
  background: #0A0A0B;
  border: 1px solid #3F3F46;
  border-radius: 4px;
  padding: 8px 12px;
  height: 34px;
  color: #FAFAFA;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
  transition: all 150ms ease;
}
.input:focus {
  border-color: #8B5CF6;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 3px rgba(139,92,246,0.15);
}
```

**Soft Modern**
```css
.input {
  background: #FFFFFF;
  border: 2px solid #E7E0D9;
  border-radius: 12px;
  padding: 12px 16px;
  height: 48px;
  transition: all 200ms ease;
}
.input:focus {
  border-color: #E11D48;
  box-shadow: 0 0 0 4px rgba(225,29,72,0.15);
}
```

---

## Animation Curves

| Theme | Micro (hover) | Standard | Enter | Spring |
|-------|--------------|----------|-------|--------|
| Nordic | 150ms ease | 200ms ease | 200ms ease-out | N/A |
| Developer | 100ms ease | 150ms ease | 200ms `cubic-bezier(0.16, 1, 0.3, 1)` | N/A |
| Soft | 200ms ease | 250ms ease | 300ms `cubic-bezier(0.34, 1.56, 0.64, 1)` | bounce |

---

## When to Use Each Theme

### Nordic Minimal
Best for:
- Users who prefer clean, distraction-free interfaces
- Applications where content should be the focus
- Professional/enterprise environments
- Long reading sessions

### Developer Dark
Best for:
- Power users and developers
- Applications used in low-light environments
- Data-dense interfaces
- Users who appreciate keyboard shortcuts

### Soft Modern
Best for:
- Consumer-facing applications
- Users new to the application
- Products that want to feel approachable
- Brands that emphasize warmth and personality

---

## File Locations

```
/apps/web/src/design-concepts/
  DESIGN_CONCEPTS.md      # Full documentation
  QUICK_REFERENCE.md      # This file
  nordic-minimal.css      # Complete CSS implementation
  developer-dark.css      # Complete CSS implementation
  soft-modern.css         # Complete CSS implementation
```
