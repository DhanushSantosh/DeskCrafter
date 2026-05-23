# Frontend Theme & Design System

DeskCrafter uses a modified, high-end developer styling system inspired by workstation utility aesthetics (gunmetal surfaces, cherry accents, pitch-black backings).

## Visual Thesis

A dark Linux workstation utility style that balances technical density with modern marketing layouts. High-contrast typography, restrained radial highlights, sharp structural containers, and glassmorphism.

## Reused & Redesigned Ideas

- **Pitch-Black Background:** Pure pitch-black (`#000000`) base page colors instead of almost-black greys to maximize contrast and border crispness.
- **Gunmetal Surfaces:** Translucent elevated elements (`rgba(14, 15, 17, 0.6)`) with high-blur glassmorphic backing.
- **Cherry Red Accents:** Cherry red (`#ff0f39`) used exclusively for active navigation states, interactive success highlights, and focused border glows.
- **Floating Pill Navigation:** Center-floating navigation pill positioned at `top: 36px` that transitions background contrast and shadow depth on scroll without layout scale shifting.
- **Two-Column Hero:** Balance product copy (left) and interactive layout studio mockups (right) in a unified grid structure.
- **Interactive Demos:** Focus on client-side React interactive simulators (XDG code compilation studio and Diagnostics console scanner) rather than heavy static image screenshots.

## Avoided Ideas

- **Placeholder Graphics:** Avoid decorative panels, mock UI screenshots, or abstract graphics that do not support the real utility workflow.
- **Low Contrast Greys:** No low-contrast backgrounds that make elements look bland or muddy.
- **Abrupt Nav Shrinking:** Freezing navbar dimensions on scroll to prevent tiny fonts or logo distortion.
