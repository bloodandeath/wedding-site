# Background Effects Strategy & Implementation Guide

This document outlines the strategy for the new **Sage Green Watercolor Background** and provides the necessary implementation details for the styling.

## 1. Strategy & Performance

### Core Philosophy

- **"Paint, don't compute"**: CSS-driven ambient animations instead of JavaScript-calculated parallax (which triggers frequent repaints on the main thread).
- **Hardware Acceleration**: By using `transform` and `opacity` changes, we leverage the GPU for smooth 60fps animations.
- **Elegance over Density**: Instead of hundreds of tiny particles, we use fewer, softer elements to create a sophisticated atmosphere.

### The Stack

- **Structure (`WispsLayer.vue`)**: Already updated — contains `.watercolor-layer` with four `.blob` divs, a `.noise-overlay`, and the existing viewport-virtualized `.wisp` particles.
- **Styling (`wisps.scss`)**: Uses heavy CSS filters (`blur`), blend modes, and keyframe animations to create the organic, fluid feel. The wisp particle styles already exist; the watercolor blob styles need to be added.

### Performance Considerations

- `filter: blur(60px)` on large elements is GPU-intensive. Use `will-change: transform` on `.blob` elements to promote them to their own compositor layers.
- On mobile (≤860px), reduce blur radius from `60px` to `30px` to ease GPU load.
- Four blobs at `40–60vw` is the practical upper limit — avoid adding more without profiling.

---

## 2. Implementation Details

Since `WispsLayer.vue` already contains the `.watercolor-layer`, `.blob-1`–`.blob-4`, and `.noise-overlay` elements, the remaining work is adding styles to `src/assets/styles/wisps.scss`.

### A. The Watercolor Layer

The watercolor effect is achieved by layering multiple large, blurred colored circles (blobs) that blend with the existing page background (`--bg: #d5f4df`).

**SCSS to add to `wisps.scss`:**

```scss
.watercolor-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Sits behind the wisps */
  overflow: hidden;
  background-color: transparent; /* Let the page --bg show through */
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.7;
  mix-blend-mode: multiply;
  will-change: transform;
  animation: blob-drift 20s infinite alternate ease-in-out;
}

/* Individual Blob Configurations — using theme.css palette */
.blob-1 {
  top: -10%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: var(--light-sage-4); /* #9bb69a */
  animation-duration: 25s;
  animation-delay: 0s;
}

.blob-2 {
  bottom: 20%;
  right: -5%;
  width: 50vw;
  height: 50vw;
  background: var(--light-sage-1); /* #6a9167 */
  animation-duration: 30s;
  animation-delay: -5s;
}

.blob-3 {
  top: 40%;
  left: 20%;
  width: 40vw;
  height: 40vw;
  background: var(--light-sage-8); /* #dee7dd */
  opacity: 0.5;
  animation-duration: 22s;
  animation-delay: -2s;
}

.blob-4 {
  bottom: -10%;
  left: 10%;
  width: 45vw;
  height: 45vw;
  background: var(--light-sage-5); /* #acc2ab */
  animation-duration: 28s;
  animation-delay: -8s;
}

/* Mobile: reduce blur for GPU performance */
@media (max-width: 860px) {
  .blob {
    filter: blur(30px);
  }
}
```

### B. Noise Overlay

The `.noise-overlay` element adds a subtle paper-grain texture using a CSS SVG filter (no image asset needed).

```scss
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

### C. Wisp Styling — No Changes Needed

The existing wisp particle styles (point+bloom+glint system with `screen` blend mode) in `wisps.scss` already work well. They don't need modification for the watercolor layer — the `screen` blend mode on wisps naturally composites over the `multiply`-blended blobs.

### D. Blob Animation

A gentle drift animation for the watercolor blobs. Named `blob-drift` to avoid collision with the existing `wisp-drift` keyframes.

```scss
@keyframes blob-drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(40px, 20px) rotate(10deg);
  }
}
```
