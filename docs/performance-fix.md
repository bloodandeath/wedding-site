# Performance Optimization Plan: Zero-Lag Animations

## 1. Executive Summary

The goal is to eliminate the stutter (frame drop) occurring during expand/collapse interactions (FAQ, RSVP, Nav). The confirmed root cause is the **synchronous destruction and regeneration of ~700 DOM nodes** by `WispsLayer.vue` whenever the document height changes.

We will move from a "reactive rebuild" model to an "additive infinite-scroll" model for the background particles, and optimize CSS transitions to run purely on the compositor thread.

## 2. WispsLayer Optimization ("Infinite Scroll" Logic)

### Problem

Currently, `ResizeObserver` triggers `rebuildWisps()`, which:

1.  Calculates `pageHeight`.
2.  **Clears** the entire `allParticles` array.
3.  **Regenerates** ~700 new particles from scratch.
4.  Vue re-renders the DOM.
    This happens _during_ the expansion animation, blocking the main thread.

### Solution: Additive Generation

We will separate **horizontal resizes** (which require a full rebuild) from **vertical resizes** (which only need more particles).

#### Algorithm

1.  **Tracking**: Keep track of `generatedHeight` (the height covered by current particles).
2.  **Resize Handler**:
    - If `width` changes: **Full Rebuild**.
    - If `width` is stable but `height` increases (e.g., Accordion expands): **Append Only**.
3.  **Append Logic**:
    - Calculate `newHeight`.
    - Identify the "newly revealed" vertical zone: `[generatedHeight, newHeight]`.
    - Calculate required particle density for this zone.
    - Generate new particles _only_ for this zone.
    - Push to `allParticles`. **Do not touch existing particles.**
4.  **Culling**: `cullToViewport` continues to work as is, slicing the array for display.

#### Technical Implementation

```javascript
// WispsLayer.vue script setup

// State
let generatedHeight = 0;
let lastWidth = 0;

function rebuildWisps() {
  const pageH = getPageHeight();
  generatedHeight = pageH;
  // ... existing full rebuild logic ...
}

function handleResize() {
  const newW = window.innerWidth;
  const newH = getPageHeight(); // Use full page height, not viewport

  // Case 1: Width change (Orientation flop or Window resize)
  // MUST rebuild because horizontal distribution is percentage-based (vw)
  if (newW !== lastWidth) {
    lastWidth = newW;
    scheduleRebuild();
    return;
  }

  // Case 2: Vertical expansion (Accordion opened)
  if (newH > generatedHeight) {
    appendWisps(generatedHeight, newH);
    generatedHeight = newH;
  }

  // Case 3: Vertical shrinkage
  // Do nothing. Extra particles below the fold are harmless and will be culled by virtualization.
}

function appendWisps(startY, endY) {
  const heightDelta = endY - startY;
  // Calculate exact number of particles needed for this strip
  // densityPerScreen is based on viewport height, so scale accordingly
  const vh = getViewportHeight();
  const ratio = heightDelta / vh;
  const countToAdd = Math.ceil(props.densityPerScreen * ratio);

  const newParticles = Array.from({ length: countToAdd }, (_, i) => {
    // Generate particle constrained to the new bottom strip
    return makeParticleInZone(allParticles.value.length + i, startY, endY);
  });

  // Non-destructive update
  allParticles.value.push(...newParticles);

  // Trigger visibility check immediately
  cullToViewport();
}

function makeParticleInZone(id, minY, maxY) {
  // same as makeParticle but y is constrained
  const y = rand(minY, maxY);
  // ... rest of generation logic
}
```

## 3. CSS Compositor Optimization

### FAQ & Accordions (`faq.css`, `sections.css`)

The `box-shadow` transition is expensive because it triggers repaints on every frame of the height animation.

**Changes:**

1.  **Remove Transition on Box-Shadow**:
    - Keep `box-shadow` static or transition it _after_ the expansion.
    - Better: Use a pseudo-element for the "active" state glow and transition its `opacity`. Opacity is a compositor-only property.

```css
/* Optimized FAQ */
.faq {
  position: relative;
  /* Remove box-shadow from transition property */
  transition: border-color 320ms ease;
  z-index: 1;
}

/* The glow is now a separate layer that fades in */
.faq::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 22px;
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.09);
  opacity: 0;
  transition: opacity 320ms ease;
  z-index: -1;
  pointer-events: none;
}

.faq--open::after {
  opacity: 1;
}
```

2.  **Will-Change**:
    - Add `will-change: grid-template-rows` to the container _only when interacting_.
    - _Strategy_: We apply a class `.is-interacting` via JS on `mousedown`, remove it on `transitionend`.
    - _Why_: Keeping `will-change` permanently costs memory.

### Mobile Nav (`nav.css`)

1.  **Hardware Acceleration**:
    - Ensure `.nav-links--expanded` uses `translate3d` (already present, but double check usage).
2.  **Backdrop Filter**:
    - `backdrop-filter` is very GPU intensive.
    - **Optimization**: Reduce the blur radius or disable it during the animation relying on `opacity` instead, then snap the blur in.
    - _Alternative_: Keep it if the WispsLayer fix solves the main frame drop. (WispsLayer is 90% of the problem).

## 4. Verification Plan

1.  **Stress Test**:
    - Open Developer Tools > Performance.
    - Set CPU Throttling to **4x slowdown**.
    - Click FAQ item.
    - **Pass Criteria**: No "Layout" or "Scripting" bars longer than 16ms during the animation.
2.  **Visual Confirmation**:
    - Scroll to bottom of page.
    - Expand "RSVP" to increase page height.
    - Confirm new wisps appear in the newly created space.
    - Confirm no white/empty void at the bottom.
