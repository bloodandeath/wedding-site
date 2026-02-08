# Design Update Plan: Registry & Optimizations

This document outlines a design and optimization plan for the wedding website. The primary focus is resolving background visibility issues in the Registry section and improving overall site performance.

## 1. Registry Section Enhancements

**Problem:** The registry carousel lacks a defined container background, causing the cards to float directly over the animated wisp background. This can lead to readability issues and a disjointed visual flow on some screens.

**Proposed Solution:** Introduce a subtle "glassmorphism" container for the carousel to anchor the content while maintaining the airy, elegant theme.

### Implementation Details:

1.  **Add Container Background:**
    Modify the `.reg-carousel` class in `src/assets/styles/registry.css` to include a semi-transparent background and backdrop blur.

    ```css
    /* src/assets/styles/registry.css */
    .reg-carousel {
      /* ... existing styles ... */

      /* New Styles */
      background: rgba(255, 255, 255, 0.45); /* Slightly more opaque */
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 16px; /* Softer corners */
      padding: 1.25rem 1rem; /* More breathing room */
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); /* Subtle lift */
    }
    ```

2.  **Refine Scrollbar:**
    Update the scrollbar track to blend with the new container.

    ```css
    /* src/assets/styles/registry.css */
    .reg-carousel::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.3);
      margin: 4px;
      border-radius: 999px;
    }
    .reg-carousel::-webkit-scrollbar-thumb {
      background: rgba(123, 143, 122, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3); /* Padding effect */
      background-clip: padding-box;
    }
    ```

3.  **Adjust Card Opacity & Contrast:**
    Increase the opacity of individual `.reg-card` backgrounds to ensured maximum legibility against moving wisps.

    ```css
    .reg-card {
      background: rgba(255, 255, 255, 0.92); /* High contrast */
      border: 1px solid rgba(28, 31, 28, 0.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    ```

## 2. Performance Optimizations

**Problem:** The wisp animation is resource-intensive. `App.vue` currently sets density to 160, which creates ~4x overdraw due to shadow layers.

### Recommendations:

1.  **Reduce Wisp Density:**
    Reduce the base density to improve potential frame drops on 60Hz displays. `WispsLayer` already handles mobile reduction (45%), but a lower base is safer.

    _Action:_ Update `src/App.vue`:

    ```vue
    <!-- Reduced from 160 to 90 for better performance/visual balance -->
    <WispsLayer :densityPerScreen="90" />
    ```

2.  **Image Formats:**
    Convert registry images to **WebP**.

    _Action:_ Contextual conversion of `public/registry/*.jpg` to `.webp` and update `registry.amazon.json`.

3.  **Lazy Loading:**
    Async import for `RegistrySection`.

    ```javascript
    // src/App.vue
    import { defineAsyncComponent } from "vue";
    const RegistrySection = defineAsyncComponent(
      () => import("@/components/RegistrySection.vue"),
    );
    ```

## 3. General Design Polish

- **Mobile Navigation:** Ensure the new transparent registry container doesn't visually clash if the mobile nav menu (which has its own blur) is opened over it. (Checked: Nav is z-index 999, so it will sit safely on top).
- **Typography:** The "View on Amazon" text in cards should use `var(--pastel-sage-3)` (which is `#20633f`) rather than a lighter shade, to pass WCAG AA contrast against the new 0.92 background.

---

_End of Design Update Plan_
