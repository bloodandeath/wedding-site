# Background Effects Strategy & Implementation Guide

This document outlines the strategy for the new **Sage Green Watercolor Background** and provides the necessary implementation details for the styling.

## 1. Strategy & Performance

### Core Philosophy

- **"Paint, don't compute"**: We are moving away from JavaScript-calculated parallax (which triggers frequent repaints and runs on the main thread) to CSS-driven ambient animations.
- **Hardware Acceleration**: By using `transform` and `opacity` changes, we leverage the GPU for smooth 60fps animations.
- **Elegance over Density**: Instead of hundreds of tiny particles, we use fewer, softer elements to create a sophisticated atmosphere.

### The Stack

- **Structure (`WispsLayer.vue`)**: A static container with large "blob" divs for the watercolor wash, separate from the wisp particles.
- **Styling (`wisps.scss`)**: Uses heavy CSS filters (`blur`), blend modes, and keyframe animations to create the organic, fluid feel.

---

## 2. Implementation Details

Since the `WispsLayer.vue` structure has already been updated to include `.watercolor-layer` and `.blob` elements, the remaining work is in `src/assets/styles/wisps.scss`.

### A. The Watercolor Layer

The watercolor effect is achieved by layering multiple large, blurred colored circles (blobs) over a warm, off-white base.

**Proposed SCSS Structure for `.watercolor-layer`:**

```scss
.watercolor-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%; /* Covers the full container */
  z-index: -1; /* Sits behind the wisps */
  overflow: hidden;
  background-color: #f8f9f7; /* Warm, paper-like off-white */

  // Optional: Add a subtle grain texture if available
  // background-image: url('/path/to/noise.png');
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px); /* The key to the "watercolor" bleed effect */
  opacity: 0.7;
  mix-blend-mode: multiply; /* Helps colors blend organically */

  // Default animation
  animation: drift 20s infinite alternate ease-in-out;
}

/* Individual Blob Configurations (Sage & Earth Tones) */
.blob-1 {
  top: -10%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: #a0ac99; /* Sage Green */
  animation-duration: 25s;
  animation-delay: 0s;
}

.blob-2 {
  bottom: 20%;
  right: -5%;
  width: 50vw;
  height: 50vw;
  background: #8f9c88; /* Darker Sage */
  animation-duration: 30s;
  animation-delay: -5s;
}

.blob-3 {
  top: 40%;
  left: 20%;
  width: 40vw;
  height: 40vw;
  background: #d8d4c9; /* Warm Beige/Sand */
  opacity: 0.5;
  animation-duration: 22s;
  animation-delay: -2s;
}

.blob-4 {
  bottom: -10%;
  left: 10%;
  width: 45vw;
  height: 45vw;
  background: #b5c1b0; /* Light Sage */
  animation-duration: 28s;
  animation-delay: -8s;
}
```

### B. Updated Wisp Styling

The wisps need to "sit" gently on this watercolor background. They should be softer and creamier.

**Changes for `.wisp`:**

```scss
.wisp {
  /* ... existing positioning ... */

  /* Update visuals for softness */
  box-shadow:
    0 0 0 0.5px rgba(255, 248, 240, 0.8),
    /* Warm white core */ 0 0 16px rgba(255, 255, 255, 0.3),
    /* Larger glow */ /* Remove the green tints if they clash, or adapt them: */
    0 0 30px rgba(160, 172, 153, 0.2); /* Subtle sage glow */

  background: radial-gradient(
    circle,
    rgba(255, 255, 240, 0.9),
    transparent 70%
  );
}
```

### C. Animations

We retain the existing drift animations but can slow them down further if the mood requires it.

```scss
@keyframes drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(40px, 20px) rotate(10deg);
  }
}
```
