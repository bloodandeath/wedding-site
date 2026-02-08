# Background Effects Strategy & Implementation Guide

This document describes the **Sage Green Watercolor Background** effect — soft, airy paint-cloud shapes that span the full page behind wisp particles.

## 1. Strategy & Performance

### Core Philosophy

- **"Paint, don't compute"**: CSS-driven ambient animations instead of JavaScript-calculated parallax on the main thread.
- **Hardware Acceleration**: `transform`, `opacity`, and `will-change` leverage the GPU for smooth 60fps.
- **Elegance over Density**: Eight large, heavily blurred shapes with `soft-light` blending create a sophisticated watercolor wash without darkening the page.

### The Stack

- **Structure (`WispsLayer.vue`)**: `.watercolor-layer` contains eight `.blob` divs (irregular `clip-path` shapes) + `.noise-overlay`, all behind the viewport-virtualized `.wisp` particles.
- **Styling (`wisps.scss`)**: `filter: blur(90px)`, `mix-blend-mode: soft-light`, and three `blob-drift` animation variants create the organic, fluid feel.
- **Parallax (`WispsLayer.vue` script)**: Scroll-driven `--wcPar` CSS variable on `.watercolor-layer` shifts the watercolor layer at 5% of scroll speed. Wisps are unaffected.

### Performance Considerations

- `filter: blur(90px)` on 8 elements is GPU-intensive. `will-change: transform` promotes each blob to its own compositor layer.
- Mobile (≤860px): blur reduced to `50px`, opacity to `0.30`.
- Eight blobs at `45–65vw` is the practical limit — don't add more without profiling.

---

## 2. Implementation (complete)

All styles live in `src/assets/styles/wisps.scss`. Template and parallax logic in `src/components/WispsLayer.vue`.

### A. Watercolor Layer

```scss
.watercolor-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background-color: transparent;
  translate: 0 var(--wcPar, 0px);   /* parallax offset set by JS */
  will-change: translate;
}

.blob {
  position: absolute;
  filter: blur(90px);
  opacity: 0.35;
  mix-blend-mode: soft-light;
  will-change: transform;
  animation: blob-drift 20s infinite alternate ease-in-out;
}
```

Each blob uses a unique `clip-path: polygon(...)` (~20 points) for irregular watercolor edges, and one of three drift animation variants (`blob-drift`, `blob-drift-2`, `blob-drift-3`) for organic, non-uniform motion.

### B. Blob Distribution

Eight blobs span the full page height, alternating left/right with ~12% vertical overlap:

| Blob | Position | Color Variable | Animation |
|------|----------|---------------|-----------|
| 1 | top: -5%, left | `--light-sage-7` | `blob-drift`, 35s |
| 2 | top: 8%, right | `--light-sage-8` | `blob-drift-2`, 40s |
| 3 | top: 22%, left | `--light-sage-9` | `blob-drift-3`, 30s |
| 4 | top: 35%, right | `--light-sage-6` | `blob-drift`, 38s |
| 5 | top: 50%, left | `--light-sage-8` | `blob-drift-2`, 33s |
| 6 | top: 62%, right | `--light-sage-7` | `blob-drift-3`, 36s |
| 7 | top: 76%, left | `--light-sage-9` | `blob-drift`, 28s |
| 8 | top: 88%, right | `--light-sage-8` | `blob-drift-2`, 32s |

### C. Noise Overlay

Inline SVG `feTurbulence` at 6% opacity for paper-grain texture. No image asset needed.

### D. Animations

Three drift variants with subtle `scale` for organic "breathing":

- `blob-drift`: translate(30px, 15px) rotate(8deg) scale(1.03)
- `blob-drift-2`: translate(-25px, 20px) rotate(-6deg) scale(0.97)
- `blob-drift-3`: translate(20px, -18px) rotate(5deg) scale(1.02)

### E. Parallax

`WispsLayer.vue` extends its existing `onScroll` rAF handler to set `--wcPar` on the `.watercolor-layer` element:

```js
if (props.watercolorParallax && watercolorRef.value) {
  const offset = (window.scrollY || 0) * props.watercolorParallaxFactor;
  watercolorRef.value.style.setProperty('--wcPar', `${offset.toFixed(1)}px`);
}
```

Props: `watercolorParallax` (Boolean, default `true`), `watercolorParallaxFactor` (Number, default `0.05`).

### F. Wisp Styling — No Changes

The existing wisp particle styles (point+bloom+glint, `screen` blend) are untouched. `screen` blend on wisps naturally composites over the `soft-light` watercolor blobs.
