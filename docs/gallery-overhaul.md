# Gallery Overhaul Plan: Modern Bento Grid

## 1. Design Specification

### The "Bento" Grid

Moving away from a horizontal slider to a curated, asymmetric grid that feels like a collection of memories.

- **Structure**: 3-column grid.
- **Rhythm**:
  - Standard items: 1x1.
  - Feature items: 2x2 or 2x1 spans to break monotony.
- **Mobile**:
  - 1-column vertical feed.
  - Feature items preserve aspect ratio but span full width.

### Interaction Model

1.  **Hover**:
    - Subtle scale up (`scale(1.02)`).
    - Overlay gradient hint appears.
    - Cursor becomes a "View" magnifying glass.
2.  **Click (Open)**:
    - **View Transition**: The image physically morphs from its grid slot to fill the screen.
    - Backdrop fades in.
3.  **Lightbox**:
    - Clean, immersive. No UI clutter.
    - Swipe to dismiss (vertical) or Navigate (horizontal).

## 2. Technical Architecture

### Component Hierarchy

```text
src/components/
├── GallerySection.vue      # Main container, grid layout
├── GalleryGridItem.vue     # Individual photo tile (handles loading state)
└── GalleryLightbox.vue     # Modal overlay (teleported to body)
```

### 1. `GallerySection.vue` (Grid Logic)

**Template Structure:**

```html
<section class="gallery-section">
  <div class="bento-grid">
    <!-- 
      We map over slides. 
      Algorithm: Pre-defined patterns or random auto-fitting?
      Decision: Pre-defined pattern relative to index (modulo 6)
    -->
    <GalleryGridItem
      v-for="(slide, i) in slides"
      :key="i"
      :src="slide.src"
      :class="getGridClass(i)"
      @click="openLightbox(i)"
    />
  </div>

  <GalleryLightbox
    :isOpen="lightboxOpen"
    :initialIndex="selectedIndex"
    :slides="slides"
    @close="lightboxOpen = false"
  />
</section>
```

**Grid CSS (The Bento):**

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Mobile default */
  gap: 16px;
  padding: 16px;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 280px; /* Fixed row height for consistency */
  }

  /* Pattern: 6-item loop */
  /* Item 0: Big square (2x2) */
  .cell-0 {
    grid-column: span 2;
    grid-row: span 2;
  }
  /* Item 1&2: Stacked on right */
  .cell-1 {
    grid-column: span 1;
    grid-row: span 1;
  }
  .cell-2 {
    grid-column: span 1;
    grid-row: span 1;
  }
  /* Item 3,4,5: Row of three */
  .cell-3 {
    grid-column: span 1;
    grid-row: span 1;
  }
  .cell-4 {
    grid-column: span 1;
    grid-row: span 1;
  }
  .cell-5 {
    grid-column: span 1;
    grid-row: span 1;
  }
}
```

### 2. View Transitions (The "Magic")

We will use the native **View Transitions API** (progressive enhancement) to animate the image opening.

**Logic:**
When an image is clicked:

1.  Assign a unique `view-transition-name` to the clicked Image element.
2.  Assign the _same_ `view-transition-name` to the target Image element in the Lightbox (which is currently hidden).
3.  Call `document.startViewTransition(() => { lightboxOpen.value = true })`.
4.  The browser automatically morphs the two images.

**Fallback (for non-supporting browsers):**

- Standard CSS fade/scale transition.

**Code Snippet:**

```javascript
async function openLightbox(index) {
  selectedIndex.value = index;

  // 1. Tag layout for transition
  const activeImg = document.querySelector(`[data-index="${index}"] img`);
  if (activeImg) activeImg.style.viewTransitionName = "lightbox-img";

  // 2. Start transition
  if (document.startViewTransition) {
    await document.startViewTransition(async () => {
      lightboxOpen.value = true;
      // Wait for Vue to render the lightbox DOM
      await nextTick();
    }).finished;

    // 3. Cleanup tag
    if (activeImg) activeImg.style.viewTransitionName = "";
  } else {
    // Fallback
    lightboxOpen.value = true;
  }
}
```

### 3. GalleryLightbox.vue

- **Teleport**: Use `<Teleport to="body">` to ensure it sits above everything (z-index 9999).
- **Gestures**: Use `@useuse/gesture` or simple touch event handlers for swipe-to-close.
- **Structure**:
  ```html
  <div class="lightbox-backdrop">
    <div class="lightbox-content">
      <img :src="currentSlide.src" style="view-transition-name: lightbox-img" />
    </div>
    <button class="close-btn">×</button>
  </div>
  ```

## 3. Implementation Steps

1.  **Scaffold**: Create the 3 new Vue components.
2.  **Grid CSS**: Implement the grid layout with responsive span classes.
3.  **Data Update**: Ensure `siteContent.js` images are high-res enough for the 2x2 "Hero" slots. Refactor `siteContent.js` if necessary to include "span" hints if we want manual control over which images are big.
4.  **Lightbox Logic**: Implement the basic opening/closing state.
5.  **View Transition**: Wire up the API.
6.  **Polish**: Add the "View" cursor and hover states.

## 4. Verification

1.  **Mobile Flow**:
    - Open on mobile.
    - Scroll feed.
    - Tap image -> It expands seamlessly.
    - Swipe down -> It closes back to grid position.
2.  **Desktop Grid**:
    - Verify the 3-column layout looks balanced.
    - Resize window: Grid should reflow gracefully.
3.  **Performance**:
    - Lightbox opening should not stutter.
    - Blur backdrop should use `backdrop-filter: blur(10px)` with `will-change`.
