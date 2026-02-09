# Responsive Tweaks Plan

## Analysis of Issues

The reported issues (white margin, buggy nav, weird loading, registry rendering) are symptoms of specific iOS WebKit behaviors, particularly how it handles viewport resizing (address bar behavior), hardware acceleration, and flexbox/aspect-ratio interactions.

### 1. Top of the page has a white margin

**Cause:**

- `viewport-fit=cover` is missing from the `<meta name="viewport">` tag, causing the safe area (notch/status bar) to remain white.
- The `<body>` background is transparent/white by default. When `WispsLayer` (the background) recalculates or if user overscrolls ("rubber banding"), the white background is revealed.
- `WispsLayer.vue` listens to `resize` events. On iOS, scrolling triggers a resize event when the address bar collapses/expands. The current logic completely destroys and recreates all particles on every resize, causing a "flash" of empty white space.

**Fix:**

- Update `index.html` viewport meta tag.
- Set a global background color on `body` in `layout.css` to match the sage theme (so overscrolls/flashes are less noticeable).

### 2. Certain sections are loading weird (and Nav Bugginess)

**Cause:**

- **Critical Issue:** In `WispsLayer.vue`, the `rebuildWisps` function regenerates random positions for every particle.
- On iOS, **scrolling changes the viewport height**, triggering `resize`.
- Result: Every time the user scrolls enough to move the address bar, the entire background animation resets and particles jump to new random locations. This looks like a glitch/bug and makes the whole page feel unstable ("loading weird").

**Fix:**

- Modify `WispsLayer.vue` to ignore small height changes (e.g., < 150px) which correspond to browser UI toggling, OR
- Store particle state so `rebuild` doesn't strictly re-randomize positions, just adds/removes if density changes.
- Simplest robust fix: Debounce the resize listener and add a check: `if (Math.abs(newHeight - oldHeight) < 100) return;` (unless width changed).

### 3. Nav menu is buggy

**Cause:**

- The background "flash" described above makes the fixed Nav feel glitchy.
- `backdrop-filter` on `nav-links--expanded` can cause rendering artifacts on iOS when combined with animations.
- The tap target on the toggle might be conflicting with the `pointerdown` listener if not carefully handled.

**Fix:**

- The `WispsLayer` fix will solve the perceived instability.
- ensure `touch-action: manipulation` is on interactive elements to prevent 300ms click delay.
- Ensure `cursor: pointer` is set on the toggle button.

### 4. Registry items rendering improperly

**Cause:**

- In `registry.css`, `.reg-img` relies on `aspect-ratio` and `display: grid`.
- The `img` inside has `height: 100%`.
- On some WebKit versions, flexible items with `aspect-ratio` don't always constrain their children correctly if `position` isn't explicit, leading to the image overflowing or the card stretching.

**Fix:**

- Switch `.reg-img` to `position: relative` and the `img` to `position: absolute; inset: 0; width: 100%; height: 100%;`.
- This forces the image to strictly obey the container's aspect ratio without relying on flex alignment quirks.

---

## Implementation Plan

### Step 1: Global & Head Fixes

**File:** `index.html`

- Update viewport meta: `width=device-width, initial-scale=1.0, viewport-fit=cover`.

**File:** `src/assets/styles/layout.css`

- Add `background-color: #F4F7F4;` (or similar theme var) to `body` to mask overscroll/loading flashes.

### Step 2: Wisps Performance (Critical)

**File:** `src/components/WispsLayer.vue`

- Update `onMounted` or `scheduleRebuild` logic.
- Store `lastWidth` and `lastHeight`.
- In the resize handler:
  ```js
  const newW = window.innerWidth;
  const newH = window.innerHeight;
  // Ignore vertical resizes caused by address bar (unless huge)
  if (newW === lastWidth && Math.abs(newH - lastHeight) < 120) return;
  ```
- This prevents background resetting during scroll usage.

### Step 3: Registry Card Styling

**File:** `src/assets/styles/registry.css`

- Refactor `.reg-img` and `.reg-img img`:

  ```css
  .reg-img {
    position: relative;
    aspect-ratio: 4 / 3;
    width: 100%;
    background: rgba(255, 255, 255, 0.45);
    border-radius: 18px; /* Ensure radius clips image */
    overflow: hidden; /* Ensure radius clips image */
  }

  .reg-img img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ```

### Step 4: Nav & General Mobile Polish

**File:** `src/assets/styles/nav.css`

- Ensure `touch-action: manipulation` is on `.brand--toggle`.

**File:** `src/assets/styles/responsive.css`

- Verify `.nav-links--expanded` fits on screen. (Current `width: min(82vw, 320px)` is generally safe, but `right: 0` relative to a fixed nav might be tight. The current CSS looks okay, but fixing the background flash is the priority).
