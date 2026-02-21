<template>
  <section class="section" id="gallery">
    <div class="container">
      <div
          class="gallery-wrap"
          @keydown.left.prevent="goPrev"
          @keydown.right.prevent="goNext"
          tabindex="0"
          aria-label="Photo gallery"
      >
        <div
            ref="viewportEl"
            class="viewport"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @lostpointercapture="onPointerUp"
        >
          <div
              ref="trackEl"
              class="track"
              :style="trackStyle"
              @transitionend="onTransitionEnd"
          >
            <!-- Clone of last slide -->
            <div v-if="slides.length > 1" class="slide" aria-hidden="true">
              <div class="media" :style="lqipStyle(slides[slides.length - 1])">
                <img
                    class="img"
                    :class="{ loaded: loaded[slides[slides.length - 1].src] }"
                    :src="slides[slides.length - 1].src"
                    :alt="''"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    @load="onImgLoad(slides[slides.length - 1].src)"
                />
              </div>
            </div>

            <!-- Real slides -->
            <div
                v-for="(s, i) in slides"
                :key="s.src"
                class="slide"
            >
              <div class="media" :style="lqipStyle(s)" :class="slideAnimClass(i)">
                <img
                    class="img"
                    :class="{ loaded: loaded[s.src] }"
                    :src="s.src"
                    :alt="s.alt || ''"
                    :loading="i === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="i === 0 ? 'high' : 'auto'"
                    decoding="async"
                    draggable="false"
                    @load="onImgLoad(s.src)"
                />
              </div>
            </div>

            <!-- Clone of first slide -->
            <div v-if="slides.length > 1" class="slide" aria-hidden="true">
              <div class="media" :style="lqipStyle(slides[0])">
                <img
                    class="img"
                    :class="{ loaded: loaded[slides[0].src] }"
                    :src="slides[0].src"
                    :alt="''"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    @load="onImgLoad(slides[0].src)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation arrows — OUTSIDE viewport so they don't scroll -->
        <button
            v-if="slides.length > 1"
            class="gal-nav gal-nav--left"
            type="button"
            aria-label="Previous photo"
            @click.stop="goPrev"
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
            v-if="slides.length > 1"
            class="gal-nav gal-nav--right"
            type="button"
            aria-label="Next photo"
            @click.stop="goNext"
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
      </div>

      <!-- Dots -->
      <div class="dotsWrap" v-if="slides.length > 1">
        <div class="dots" role="tablist" aria-label="Gallery slide selector">
          <button
              v-for="(_, i) in slides"
              :key="i"
              class="dot"
              type="button"
              role="tab"
              :aria-selected="i === realIndex"
              :aria-label="'Go to slide ' + (i + 1)"
              @click.stop="goTo(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

const props = defineProps({
  slides: { type: Array, default: () => [] },
  autoplayMs: { type: Number, default: 0 },
});

const viewportEl = ref(null);
const trackEl = ref(null);

// ── LQIP image loading state ────────────────────────────────────────
const loaded = reactive({});

function onImgLoad(src) {
  loaded[src] = true;
}

function lqipStyle(slide) {
  return slide.lqip ? { "--lqip": `url(${slide.lqip})` } : null;
}

// trackIndex includes the leading clone: 0 = clone-last, 1 = first real, ...
const trackIndex = ref(1);
const transitionEnabled = ref(true);
const dragOffset = ref(0);

// ── Slide animation state ───────────────────────────────────────────
let shouldAnimate = false;

let autoplayTimer = null;
let autoplayResumeTimer = null;
let isTransitioning = false;
let transitionSafetyTimer = null;

// ── Drag state (non-reactive for perf) ──────────────────────────────
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragPointerId = null;
let dragLocked = false;

// ── Computed ────────────────────────────────────────────────────────

const realIndex = computed(() => {
  const n = props.slides.length;
  if (n === 0) return 0;
  let idx = trackIndex.value - 1;
  if (idx < 0) idx = n - 1;
  if (idx >= n) idx = 0;
  return idx;
});

const trackStyle = computed(() => {
  const base = -trackIndex.value * 100;
  const px = dragOffset.value;
  return {
    transform: px !== 0
        ? `translateX(calc(${base}% + ${px}px))`
        : `translateX(${base}%)`,
    transition: transitionEnabled.value
        ? "transform 450ms cubic-bezier(0.33, 1, 0.68, 1)"
        : "none",
  };
});

// ── Slide animation class ───────────────────────────────────────────

function slideAnimClass(i) {
  if (!shouldAnimate || i !== realIndex.value) return {};
  return { animate__animated: true, animate__fadeIn: true };
}

// ── Navigation ──────────────────────────────────────────────────────

function goNext() {
  if (isTransitioning || props.slides.length <= 1) return;
  shouldAnimate = true;
  transitionEnabled.value = true;
  trackIndex.value++;
  isTransitioning = true;
  clearTimeout(transitionSafetyTimer);
  transitionSafetyTimer = setTimeout(() => { isTransitioning = false; }, 500);
  onUserInteraction();
}

function goPrev() {
  if (isTransitioning || props.slides.length <= 1) return;
  shouldAnimate = true;
  transitionEnabled.value = true;
  trackIndex.value--;
  isTransitioning = true;
  clearTimeout(transitionSafetyTimer);
  transitionSafetyTimer = setTimeout(() => { isTransitioning = false; }, 500);
  onUserInteraction();
}

function goTo(i) {
  if (isTransitioning || trackIndex.value === i + 1) return;
  shouldAnimate = true;
  transitionEnabled.value = true;
  trackIndex.value = i + 1;
  isTransitioning = true;
  clearTimeout(transitionSafetyTimer);
  transitionSafetyTimer = setTimeout(() => { isTransitioning = false; }, 500);
  onUserInteraction();
}

function onTransitionEnd(e) {
  if (e.target !== trackEl.value) return;

  clearTimeout(transitionSafetyTimer);
  isTransitioning = false;
  const n = props.slides.length;

  if (trackIndex.value >= n + 1) {
    // Landed on clone of first → jump to real first
    transitionEnabled.value = false;
    trackIndex.value = 1;
    nextTick(() => {
      void trackEl.value?.offsetHeight;
      requestAnimationFrame(() => {
        transitionEnabled.value = true;
      });
    });
  } else if (trackIndex.value <= 0) {
    // Landed on clone of last → jump to real last
    transitionEnabled.value = false;
    trackIndex.value = n;
    nextTick(() => {
      void trackEl.value?.offsetHeight;
      requestAnimationFrame(() => {
        transitionEnabled.value = true;
      });
    });
  }
}

// ── Touch / Drag ────────────────────────────────────────────────────

function onPointerDown(e) {
  if (isTransitioning || props.slides.length <= 1) return;
  if (e.button && e.button !== 0) return;

  isDragging = true;
  dragLocked = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragPointerId = e.pointerId;
  dragOffset.value = 0;
  transitionEnabled.value = false;

  viewportEl.value?.setPointerCapture(e.pointerId);
  onUserInteraction();
}

function onPointerMove(e) {
  if (!isDragging || e.pointerId !== dragPointerId) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (!dragLocked) {
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (Math.abs(dy) > Math.abs(dx) * 1.2) {
      isDragging = false;
      dragOffset.value = 0;
      transitionEnabled.value = true;
      return;
    }
    dragLocked = true;
  }

  e.preventDefault();
  dragOffset.value = dx;
}

function onPointerUp(e) {
  if (!isDragging || e.pointerId !== dragPointerId) return;
  isDragging = false;

  const el = viewportEl.value;
  const threshold = el ? el.clientWidth * 0.15 : 80;
  const delta = dragOffset.value;

  dragOffset.value = 0;
  transitionEnabled.value = true;

  if (Math.abs(delta) > threshold) {
    if (delta < 0) goNext();
    else goPrev();
    shouldAnimate = false; // drag provides its own visual feedback
  }
}

// ── Autoplay ────────────────────────────────────────────────────────

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function startAutoplay() {
  stopAutoplay();
  if (!props.autoplayMs || props.autoplayMs < 1200) return;
  if (props.slides.length <= 1) return;

  autoplayTimer = setInterval(() => {
    if (!isTransitioning && !isDragging) {
      shouldAnimate = true;
      transitionEnabled.value = true;
      trackIndex.value++;
      isTransitioning = true;
      clearTimeout(transitionSafetyTimer);
      transitionSafetyTimer = setTimeout(() => { isTransitioning = false; }, 500);
    }
  }, props.autoplayMs);
}

function onUserInteraction() {
  stopAutoplay();
  if (autoplayResumeTimer) clearTimeout(autoplayResumeTimer);
  autoplayResumeTimer = setTimeout(() => {
    startAutoplay();
  }, 10000);
}

// ── Lifecycle ───────────────────────────────────────────────────────

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
  if (autoplayResumeTimer) clearTimeout(autoplayResumeTimer);
  clearTimeout(transitionSafetyTimer);
});
</script>

<style scoped>
/* Gallery wrapper — positioning context for nav arrows */
.gallery-wrap {
  position: relative;
  outline: none;
}

/* Viewport — overflow hidden, no scroll */
.viewport {
  position: relative;
  overflow: hidden;

  border-radius: 16px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y pinch-zoom;

  aspect-ratio: 16 / 10;

  /* Radial vignette mask */
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

/* Light grain overlay */
.viewport::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 7;

  opacity: 0.08;
  mix-blend-mode: soft-light;
  background-repeat: repeat;
  background-size: 180px 180px;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");

  animation: grain-drift 10s steps(10) infinite;
}

@keyframes grain-drift {
  0% { background-position: 0 0; }
  100% { background-position: 180px 120px; }
}

/* Track — flex row, animated via translateX */
.track {
  display: flex;
  width: 100%;
  will-change: transform;
  backface-visibility: hidden;
}

/* Slides */
.slide {
  flex: 0 0 100%;
  height: 100%;
}

.media {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(222, 231, 221, 0.72);
}

/* LQIP blurred placeholder */
.media::before {
  content: "";
  position: absolute;
  inset: -10px;
  background-image: var(--lqip, none);
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  z-index: 0;
}

.img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;
  opacity: 0;
  transition: opacity 400ms ease;
}

.img.loaded {
  opacity: 1;
}

/* Navigation arrows — positioned on gallery-wrap, outside the viewport mask */
.gal-nav {
  position: absolute;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  width: 56px;
  height: 56px;
  z-index: 10;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;

  opacity: 0.55;
  transition: opacity 180ms ease;
}

.gal-nav--left {
  left: 18px;
}
.gal-nav--right {
  right: 18px;
}

.gal-nav:hover {
  opacity: 1;
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

/* Dots — always visible */
.dotsWrap {
  margin-top: 0.9rem;
  display: grid;
  justify-items: center;
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
  padding: 0;
  transition: transform 160ms ease, background 160ms ease;
}

.dot[aria-selected="true"] {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.18);
}

/* Gallery slide animation timing — matches track's 450ms */
.media.animate__animated {
    --animate-duration: 450ms;
}

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .viewport::after { animation: none; }
  .track { transition: none !important; }
}
</style>
