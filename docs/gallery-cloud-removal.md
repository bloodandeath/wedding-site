# Gallery Cloud Frame Removal Plan

## Goal
Remove the decorative "cloud frame" overlay from the Gallery section to provide a cleaner view of the photos, while maintaining the existing carousel functionality, navigation, and other styling.

## User Review Required
> [!NOTE]
> This plan strictly removes the `.cloudFrame` overlay. The distinct "vignette" mask on the `.viewport` (which fades the edges of the images) will remain intact as it is part of the viewport container styling, not the cloud frame itself.

## Proposed Changes

### Components
`src/components/GallerySection.vue`

#### [MODIFY] [GallerySection.vue](file:///c:/Users/corbin/WebstormProjects/wedding/src/components/GallerySection.vue)
- **Remove HTML**: Delete the `<div class="cloudFrame" aria-hidden="true"></div>` element (Line 81).
- **Remove CSS**:
    - Delete the `.cloudFrame` rule block (Lines 424-444).
    - Delete the `@keyframes cloud-drift` rule block (Lines 446-463).
    - Remove the `.cloudFrame { animation: none; }` line inside the `@media (prefers-reduced-motion: reduce)` block (Line 605).

## Verification Plan
### Manual Verification
1.  **Visual Check**:
    - Open the site in the browser.
    - Navigate to the Gallery section.
    - Confirm the white cloudy overlay is gone.
    - Confirm the images are still visible and the carousel still works (drag/arrows).
    - Confirm the grainy texture overlay (`.viewport::after`) and rounded corners/mask (`.viewport`) remain (unless they are also deemed part of the "cloud" look, but for now we follow strict isolation).
