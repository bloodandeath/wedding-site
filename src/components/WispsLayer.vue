<template>
  <div class="wisps" aria-hidden="true">
    <span
        v-for="p in visibleParticles"
        :key="p.id"
        class="wisp"
        :class="p.depthClass"
        :style="p.style"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  densityPerScreen: { type: Number, default: 40 },
  minCount:         { type: Number, default: 0 },
  maxCount:         { type: Number, default: 700 },
  count:            { type: Number, default: 0 },
});

// All particles (full page). Only the viewport-visible subset is rendered.
const allParticles = ref([]);
const visibleParticles = ref([]);

let ro = null;
let rebuildTimer = null;
let scrollRaf = 0;
let isMobile = false;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function getViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight || 800;
}

function getPageHeight() {
  const de = document.documentElement;
  const b = document.body;
  return Math.max(
      de.scrollHeight, de.offsetHeight, de.clientHeight,
      b ? b.scrollHeight : 0, b ? b.offsetHeight : 0
  );
}

function setRootVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function computeCount(pageH) {
  if (props.count > 0) return props.count;
  const screens = pageH / getViewportHeight();
  // Lower density on mobile for performance
  const density = isMobile ? Math.round(props.densityPerScreen * 0.45) : props.densityPerScreen;
  const lo = isMobile ? Math.round(props.minCount * 0.4) : props.minCount;
  const hi = isMobile ? Math.round(props.maxCount * 0.4) : props.maxCount;
  return clamp(Math.round(screens * density), lo, hi);
}

function makeParticle(id, pageH) {
  const x = rand(0, 100);
  const y = rand(0, pageH);

  // Slightly larger, softer particles for the "elegant" look
  const minS = 3.0;
  const maxS = 8.0;
  const size = rand(minS, maxS);

  const dx = rand(-20, 20); // Slower horizontal drift
  const dy = rand(-15, 15); // Slower vertical drift
  const dur = rand(25, 60); // Longer animation durations

  const tw = rand(4, 10);
  const delay = -rand(0, dur);
  const twDelay = -rand(0, tw);

  // Warm whites / creams for sage theme
  const hue = rand(40, 60);
  const sat = rand(20, 60);
  const light = rand(70, 90);
  const alpha = rand(0.3, 0.6);

  const rot = rand(0, 360);

  const hasGlint = Math.random() < 0.15; // Fewer glints
  const glintDur = rand(7, 16);
  const glintDelay = -rand(0, glintDur);

  const depthClass = hasGlint ? "has-glint" : "";

  return {
    id,
    y, // raw y for virtualization culling
    depthClass,
    style: {
      "--x": `${x.toFixed(3)}vw`,
      "--y": `${Math.round(y)}px`,
      "--s": `${size.toFixed(2)}px`,

      "--dx": `${dx.toFixed(2)}px`,
      "--dy": `${dy.toFixed(2)}px`,
      "--dur": `${dur.toFixed(2)}s`,
      "--tw": `${tw.toFixed(2)}s`,
      "--delay": `${delay.toFixed(2)}s`,
      "--twDelay": `${twDelay.toFixed(2)}s`,

      "--c": `hsla(${hue.toFixed(1)} ${sat.toFixed(1)}% ${light.toFixed(1)}% / ${alpha.toFixed(2)})`,
      "--rot": `${rot.toFixed(2)}deg`,
      "--glintDur": `${glintDur.toFixed(2)}s`,
      "--glintDelay": `${glintDelay.toFixed(2)}s`,
    },
  };
}

// ── Viewport virtualization ─────────────────────────────────────────
// Only particles within viewport ± buffer are rendered in the DOM.

function cullToViewport() {
  const scrollY = window.scrollY || 0;
  const vh = getViewportHeight();
  const buffer = vh * 1.5; // Larger buffer since we are not strictly parallaxing

  const lo = scrollY - buffer;
  const hi = scrollY + vh + buffer;

  visibleParticles.value = allParticles.value.filter(p => p.y >= lo && p.y <= hi);
}

// ── Scroll handler ──────────────────────────────────────────────────

function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    cullToViewport();
    scrollRaf = 0;
  });
}

// ── Rebuild ─────────────────────────────────────────────────────────

function rebuildWisps() {
  const pageH = getPageHeight();
  setRootVar("--pageH", `${pageH}px`);

  const count = computeCount(pageH);
  allParticles.value = Array.from({ length: count }, (_, i) => makeParticle(i, pageH));

  cullToViewport();
}

function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuildWisps, 140);
}

// ── Lifecycle ───────────────────────────────────────────────────────

onMounted(() => {
  isMobile = window.matchMedia?.("(max-width: 860px)")?.matches ?? false;

  rebuildWisps();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scheduleRebuild, { passive: true });

  ro = new ResizeObserver(() => scheduleRebuild());
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", scheduleRebuild);

  if (ro) ro.disconnect();
  if (rebuildTimer) clearTimeout(rebuildTimer);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});

watch(
    () => [props.densityPerScreen, props.minCount, props.maxCount, props.count],
    () => scheduleRebuild()
);
</script>
