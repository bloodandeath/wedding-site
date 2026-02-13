<template>
  <section class="section" id="gallery">
    <div class="container">
      <div
          ref="viewportEl"
          class="viewport"
          tabindex="0"
          aria-label="Photo gallery"
          @keydown.left.prevent="onKeyPrev"
          @keydown.right.prevent="onKeyNext"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
      >
        <!-- Interactions-only UI (arrows) -->
        <button
            class="nav nav--left"
            type="button"
            aria-label="Previous photo"
            :data-visible="uiVisible"
            @pointerdown.stop.prevent="onUiInteract"
            @click.stop="onClickPrev"
        >
          <span class="chev" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="chevIcon">
              <path
                  d="M14.5 5.5L8 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>

        <button
            class="nav nav--right"
            type="button"
            aria-label="Next photo"
            :data-visible="uiVisible"
            @pointerdown.stop.prevent="onUiInteract"
            @click.stop="onClickNext"
        >
          <span class="chev" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="chevIcon">
              <path
                  d="M9.5 5.5L16 12l-6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>

        <!-- Track -->
        <div
            class="track"
            :class="{ 'is-dragging': isDragging }"
            :style="trackStyle"
            @transitionend="onTransitionEnd"
        >
          <div v-for="(s, i) in renderSlides" :key="slideKey(s, i)" class="slide">
            <div class="media">
              <img class="img" :src="s.src" :alt="s.alt || ''" loading="lazy" draggable="false" />
            </div>
          </div>
        </div>

        <!-- Cloud frame (white/transparent) -->
        <div class="cloudFrame" aria-hidden="true"></div>
      </div>

      <!-- Dots only (also interactions-only visibility) -->
      <div class="dotsWrap" :data-visible="uiVisible" v-if="slides.length > 1">
        <div class="dots" role="tablist" aria-label="Gallery slide selector">
          <button
              v-for="(_, i) in slides"
              :key="i"
              class="dot"
              type="button"
              role="tab"
              :aria-selected="i === realIndex"
              :aria-label="'Go to slide ' + (i + 1)"
              @pointerdown.stop.prevent="onUiInteract"
              @click.stop="onClickDot(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const { slides, autoplayMs } = defineProps({
  slides: { type: Array, default: () => [] }, // [{src, alt}]
  autoplayMs: { type: Number, default: 0 },
});

const viewportEl = ref(null);

const internalIndex = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragDeltaX = ref(0);
const disableTransition = ref(false);

const uiVisible = ref(false);
let uiHideTimer = null;

let pointerId = null;
let autoplayTimer = null;

const hasLoopClone = computed(() => slides.length > 1);
const renderSlides = computed(() => (hasLoopClone.value ? [...slides, slides[0]] : slides));
const slideCount = computed(() => slides.length);

const realIndex = computed(() => {
  if (slideCount.value === 0) return 0;
  if (!hasLoopClone.value) return internalIndex.value;
  return internalIndex.value >= slideCount.value ? 0 : internalIndex.value;
});

function slideKey(s, i) {
  return (s && s.src ? s.src : "slide") + ":" + i;
}

function clamp(i) {
  if (slideCount.value === 0) return 0;
  if (!hasLoopClone.value) return Math.max(0, Math.min(slideCount.value - 1, i));
  return Math.max(0, Math.min(slideCount.value, i)); // allow clone index
}

const trackStyle = computed(() => {
  const basePct = -internalIndex.value * 100;
  const dragPx = isDragging.value ? dragDeltaX.value : 0;

  const transition =
      disableTransition.value || isDragging.value
          ? "none"
          : "transform 740ms cubic-bezier(0.22, 1, 0.36, 1)";

  return {
    transform: `translate3d(calc(${basePct}% + ${dragPx}px), 0, 0)`,
    transition,
  };
});

// ---- UI visibility (tap/drag shows; auto-hides) ----
function showUi() {
  uiVisible.value = true;
  if (uiHideTimer) clearTimeout(uiHideTimer);
  uiHideTimer = setTimeout(() => {
    uiVisible.value = false;
  }, 1500);
}

function onUiInteract() {
  showUi();
  resetAutoplay();
}

// ---- Autoplay ----
function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function startAutoplay() {
  stopAutoplay();
  if (!autoplayMs || autoplayMs < 1200) return;
  if (slideCount.value <= 1) return;

  autoplayTimer = setInterval(() => {
    goNext();
  }, autoplayMs);
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// ---- Navigation ----
function goNext() {
  if (slideCount.value <= 1) return;
  internalIndex.value = clamp(internalIndex.value + 1);
}

function goPrev() {
  if (slideCount.value <= 1) return;

  if (hasLoopClone.value && internalIndex.value === 0) {
    disableTransition.value = true;
    internalIndex.value = slideCount.value - 1;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        disableTransition.value = false;
      });
    });
    return;
  }

  internalIndex.value = clamp(internalIndex.value - 1);
}

function goTo(i) {
  if (slideCount.value <= 1) return;
  internalIndex.value = clamp(i);
}

function onTransitionEnd() {
  if (!hasLoopClone.value) return;

  if (internalIndex.value === slideCount.value) {
    disableTransition.value = true;
    internalIndex.value = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        disableTransition.value = false;
      });
    });
  }
}

// ---- Event wrappers that also show UI + reset autoplay ----
function onClickNext() {
  onUiInteract();
  goNext();
}
function onClickPrev() {
  onUiInteract();
  goPrev();
}
function onClickDot(i) {
  onUiInteract();
  goTo(i);
}
function onKeyNext() {
  onUiInteract();
  goNext();
}
function onKeyPrev() {
  onUiInteract();
  goPrev();
}

// ---- Swipe/drag ----
function onPointerDown(e) {
  if (slideCount.value <= 1) return;
  if (!viewportEl.value) return;

  showUi();
  stopAutoplay();

  pointerId = e.pointerId;
  viewportEl.value.setPointerCapture(pointerId);

  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragDeltaX.value = 0;
}

function onPointerMove(e) {
  if (!isDragging.value) return;
  if (e.pointerId !== pointerId) return;

  e.preventDefault();
  dragDeltaX.value = e.clientX - dragStartX.value;
  showUi(); // keep UI visible while dragging
}

function onPointerUp(e) {
  if (!isDragging.value) return;
  if (pointerId !== null && e.pointerId !== pointerId) return;

  const el = viewportEl.value;
  const width = el ? el.clientWidth : 1;
  const threshold = Math.max(60, width * 0.12);
  const dx = dragDeltaX.value;

  isDragging.value = false;
  dragDeltaX.value = 0;
  pointerId = null;

  if (dx <= -threshold) goNext();
  else if (dx >= threshold) goPrev();

  resetAutoplay();
}

onMounted(() => startAutoplay());

onBeforeUnmount(() => {
  stopAutoplay();
  if (uiHideTimer) clearTimeout(uiHideTimer);
});

watch(
    () => slideCount.value,
    () => {
      disableTransition.value = true;
      internalIndex.value = 0;
      requestAnimationFrame(() => {
        disableTransition.value = false;
      });
      resetAutoplay();
    }
);
</script>

<style scoped>
/* Gallery viewport.
   Fixed aspect ratio prevents "zoom/crop too much" on tall desktop screens. */
.viewport {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  outline: none;

  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;

  aspect-ratio: 16 / 10;

  /* Radial vignette mask: smooth fade on all edges AND corners.
     Ellipse sizes tuned so horizontal fade is slightly wider than vertical
     (matching the original left/right emphasis). */
  -webkit-mask-image: radial-gradient(
      ellipse 94% 96% at 50% 50%,
      #000 78%,
      rgba(0,0,0,0.6) 87%,
      rgba(0,0,0,0.15) 95%,
      transparent 100%
  );
  mask-image: radial-gradient(
      ellipse 94% 96% at 50% 50%,
      #000 78%,
      rgba(0,0,0,0.6) 87%,
      rgba(0,0,0,0.15) 95%,
      transparent 100%
  );
}

/* Light grain overlay to prevent banding + add softness */
.viewport::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 7; /* above cloudFrame (6), below nav (10) */

  opacity: 0.08;              /* keep subtle */
  mix-blend-mode: overlay;    /* gentle; try 'soft-light' if you prefer */
  background-repeat: repeat;
  background-size: 180px 180px;

  /* SVG turbulence noise (data URI) */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");

  /* slight grain drift so it feels organic */
  animation: grain-drift 10s steps(10) infinite;
}

@keyframes grain-drift {
  0% { background-position: 0 0; }
  100% { background-position: 180px 120px; }
}


/* Cloud frame overlay: white/transparent haze that blends into light sage background */
.cloudFrame {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: 16px;
  z-index: 6;

  /* More transparent, less white cloud mist */
  background:
      /* Soft Edge Wrap */
      radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.00) 58%, rgba(255,255,255,0.05) 78%, rgba(255,255,255,0.00) 100%),

      radial-gradient(140px 140px at 50% 0%,
      rgba(255,255,255,0.035),
      rgba(255,255,255,0) 72%
      ),
      radial-gradient(140px 140px at 50% 100%,
      rgba(255,255,255,0.035),
      rgba(255,255,255,0) 72%
      ),
      radial-gradient(180px 180px at 0% 50%,
      rgba(255,255,255,0.03),
      rgba(255,255,255,0) 75%
      ),
      radial-gradient(180px 180px at 100% 50%,
      rgba(255,255,255,0.03),
      rgba(255,255,255,0) 75%
      ),
      radial-gradient(260px 260px at 50% 50%,
      rgba(255,255,255,0.025),
      rgba(255,255,255,0) 72%
      );

  filter: blur(3.5px);
  opacity: 0.85; /* higher opacity, but lighter color = more transparent feel */

  background-size: 140% 140%;
  animation: cloud-drift 24s ease-in-out infinite;
  transform-origin: center;
}


@keyframes cloud-drift {
  0% {
    transform: translate3d(-1.8%, -1.2%, 0) scale(1.02);
    opacity: 0.78;
  }

  35% {
    transform: translate3d(1.2%, 1.4%, 0) scale(1.045);
    opacity: 0.92;
  }

  65% {
    transform: translate3d(1.6%, -0.8%, 0) scale(1.035);
    opacity: 0.88;
  }

  100% {
    transform: translate3d(-1.2%, 1.0%, 0) scale(1.02);
    opacity: 0.82;
  }
}



/* Track */
.track {
  display: flex;
  width: 100%;
  height: 100%; /* fill fixed aspect-ratio viewport */
  will-change: transform;
}

.track.is-dragging {
  cursor: grabbing;
}

.slide {
  min-width: 100%;
  height: 100%;
  padding: 0; /* no extra padding; strict gallery */
}

.media {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px; /* matches viewport */
  background: transparent;
}

.img {
  width: 100%;
  height: 100%;
  display: block;

  object-fit: cover;
  object-position: center;

  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;
}

/* Arrows appear only during interactions */
.nav {
  position: absolute;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  width: 56px;
  height: 56px;
  z-index: 10;
  border: 0;
  background: transparent;
  cursor: pointer;

  opacity: 0;
  transition: opacity 180ms ease, transform 180ms ease;
}

/* Symmetric inset: keep inside picture and aligned around where fade begins */
.nav--left {
  left: 18px;
}
.nav--right {
  right: 18px;
}

.nav[data-visible="true"] {
  opacity: 1;
}

/* Requested: lower opacity on hover */
.nav[data-visible="true"]:hover {
  opacity: 0.65;
}

.chev {
  width: 44px;
  height: 44px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.58);
  color: rgba(0, 0, 0, 0.72);
}

.chevIcon {
  width: 22px;
  height: 22px;
  display: block;
}

/* Dots: only show during interactions */
.dotsWrap {
  margin-top: 0.9rem;
  display: grid;
  justify-items: center;

  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 180ms ease, transform 180ms ease;
}

.dotsWrap[data-visible="true"] {
  opacity: 1;
  transform: translateY(0);
}

.dots {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.dots::-webkit-scrollbar {
  display: none;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  flex: 0 0 auto;
  transition: transform 160ms ease, background 160ms ease;
}

.dot[aria-selected="true"] {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.18);
}

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .viewport::after { animation: none; }
  .cloudFrame { animation: none; }
}

</style>
