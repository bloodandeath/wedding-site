<template>
  <section class="section" id="gallery">
    <div class="container">
      <div
          ref="viewportEl"
          class="viewport"
          tabindex="0"
          aria-label="Photo gallery"
          @keydown.left.prevent="goPrev"
          @keydown.right.prevent="goNext"
      >
        <div
            v-for="(s, i) in slides"
            :key="s.src"
            class="slide"
            :data-index="i"
            ref="slideEls"
        >
          <div class="media">
            <img
                class="img"
                :src="s.src"
                :alt="s.alt || ''"
                :loading="i === 0 ? 'eager' : 'lazy'"
                draggable="false"
            />
          </div>
        </div>

        <!-- Cloud frame (decorative overlay) -->
        <div class="cloudFrame" aria-hidden="true"></div>

        <!-- Navigation arrows -->
        <button
            class="nav nav--left"
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
            class="nav nav--right"
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
              :aria-selected="i === activeIndex"
              :aria-label="'Go to slide ' + (i + 1)"
              @click.stop="goTo(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  slides: { type: Array, default: () => [] },
  autoplayMs: { type: Number, default: 0 },
});

const viewportEl = ref(null);
const slideEls = ref([]);
const activeIndex = ref(0);

let autoplayTimer = null;
let observer = null;
let userInteracted = false;
let autoplayResumeTimer = null;

// ---- Navigation via native scrollTo ----

function goTo(i) {
  const el = viewportEl.value;
  if (!el) return;
  const target = Math.max(0, Math.min(props.slides.length - 1, i));
  el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  onUserInteraction();
}

function goNext() {
  goTo((activeIndex.value + 1) % props.slides.length);
}

function goPrev() {
  goTo((activeIndex.value - 1 + props.slides.length) % props.slides.length);
}

// ---- Active slide tracking via IntersectionObserver ----

function setupObserver() {
  const el = viewportEl.value;
  if (!el) return;

  observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            if (Number.isFinite(idx)) {
              activeIndex.value = idx;
            }
          }
        }
      },
      { root: el, threshold: 0.5 }
  );

  for (const slide of slideEls.value) {
    if (slide) observer.observe(slide);
  }
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
  if (!props.autoplayMs || props.autoplayMs < 1200) return;
  if (props.slides.length <= 1) return;

  autoplayTimer = setInterval(() => {
    const next = (activeIndex.value + 1) % props.slides.length;
    const el = viewportEl.value;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, props.autoplayMs);
}

function onUserInteraction() {
  userInteracted = true;
  stopAutoplay();
  if (autoplayResumeTimer) clearTimeout(autoplayResumeTimer);
  autoplayResumeTimer = setTimeout(() => {
    userInteracted = false;
    startAutoplay();
  }, 10000);
}

// ---- Lifecycle ----

onMounted(() => {
  setupObserver();
  startAutoplay();

  // Pause autoplay on any touch/pointer interaction with the viewport
  const el = viewportEl.value;
  if (el) {
    el.addEventListener("pointerdown", onUserInteraction, { passive: true });
  }
});

onBeforeUnmount(() => {
  stopAutoplay();
  if (observer) observer.disconnect();
  if (autoplayResumeTimer) clearTimeout(autoplayResumeTimer);

  const el = viewportEl.value;
  if (el) {
    el.removeEventListener("pointerdown", onUserInteraction);
  }
});
</script>

<style scoped>
/* Scroll-snap viewport */
.viewport {
  position: relative;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  border-radius: 16px;
  outline: none;
  user-select: none;
  -webkit-user-select: none;

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

.viewport::-webkit-scrollbar {
  display: none;
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
  mix-blend-mode: overlay;
  background-repeat: repeat;
  background-size: 180px 180px;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");

  animation: grain-drift 10s steps(10) infinite;
}

@keyframes grain-drift {
  0% { background-position: 0 0; }
  100% { background-position: 180px 120px; }
}

/* Cloud frame overlay */
.cloudFrame {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: 16px;
  z-index: 6;

  background:
      radial-gradient(70% 70% at 50% 50%, rgba(255,255,255,0.00) 58%, rgba(255,255,255,0.05) 78%, rgba(255,255,255,0.00) 100%),
      radial-gradient(140px 140px at 50% 0%, rgba(255,255,255,0.035), rgba(255,255,255,0) 72%),
      radial-gradient(140px 140px at 50% 100%, rgba(255,255,255,0.035), rgba(255,255,255,0) 72%),
      radial-gradient(180px 180px at 0% 50%, rgba(255,255,255,0.03), rgba(255,255,255,0) 75%),
      radial-gradient(180px 180px at 100% 50%, rgba(255,255,255,0.03), rgba(255,255,255,0) 75%),
      radial-gradient(260px 260px at 50% 50%, rgba(255,255,255,0.025), rgba(255,255,255,0) 72%);

  filter: blur(3.5px);
  opacity: 0.85;

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

/* Slides */
.slide {
  scroll-snap-align: start;
  flex-shrink: 0;
  min-width: 100%;
  height: 100%;
}

.media {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
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

/* Navigation arrows — always visible at low opacity */
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
  padding: 0;

  opacity: 0.55;
  transition: opacity 180ms ease;
}

.nav--left {
  left: 18px;
}
.nav--right {
  right: 18px;
}

.nav:hover {
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

/* Respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .viewport::after { animation: none; }
  .cloudFrame { animation: none; }
}
</style>
