<template>
  <div class="wisps" aria-hidden="true">
    <span v-for="p in wispParticles" :key="p.id" class="wisp" :style="p.style" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

/**
 * Density: scales with page height so wisps don’t get sparse on long pages.
 * - densityPerScreen = particles per viewport-height of content
 * - clamps keep perf stable
 */
const props = defineProps({
  densityPerScreen: { type: Number, default: 150 }, // ↑ more dense
  minCount: { type: Number, default: 220 },
  maxCount: { type: Number, default: 720 },

  // Optional override: set >0 to force a specific count
  count: { type: Number, default: 0 },
});

const wispParticles = ref([]);

let resizeObs = null;
let rebuildTimer = null;
let scrollRaf = 0;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight || 800;
}

function getPageHeight() {
  const de = document.documentElement;
  const b = document.body;
  return Math.max(
      de.scrollHeight,
      de.offsetHeight,
      de.clientHeight,
      b ? b.scrollHeight : 0,
      b ? b.offsetHeight : 0
  );
}

function setRootVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function computeCount(pageH) {
  if (props.count && props.count > 0) return props.count;

  const screens = pageH / getViewportHeight();
  const raw = Math.round(screens * props.densityPerScreen);
  return clamp(raw, props.minCount, props.maxCount);
}

/**
 * Parallax factor “par”:
 * Used in CSS: top = y + scrollY * par
 *
 * Interpretation:
 * - If par is large, we add back more scroll => moves slower (farther away)
 * - If par is small, we add back less scroll => moves faster (closer)
 *
 * You want bigger wisps move faster:
 * - larger size => smaller par
 * - plus a small random jitter
 */
function computeParallaxFactor(sizePx, maxSizePx) {
  const sizeNorm = sizePx / maxSizePx; // 0..1
  const jitter = rand(0.85, 1.15);

  // small (far) => ~0.20, big (near) => ~0.06
  const base = 0.20 - sizeNorm * 0.14;

  return +(clamp(base * jitter, 0.05, 0.22)).toFixed(4);
}

function makeParticle(id, pageH) {
  const x = rand(0, 100);
  const y = rand(0, pageH);

  // Keep your preferred sizing (glow handled in CSS/SASS)
  const minS = 2.6;
  const maxS = 7.2;
  const size = rand(minS, maxS);

  const glow = rand(0.65, 2.0);

  // Drift motion vars for your SASS drift keyframes
  const dx = rand(-26, 26);
  const dy = rand(-22, 22);
  const dur = rand(18, 44);

  const tw = rand(4, 10);
  const delay = -rand(0, dur);
  const twDelay = -rand(0, tw);

  const hue = rand(128, 152);
  const sat = rand(40, 70);
  const light = rand(18, 28);
  const alpha = rand(0.45, 0.75);

  const rot = rand(0, 360);
  const par = computeParallaxFactor(size, maxS);

  return {
    id,
    style: {
      "--x": `${x.toFixed(3)}vw`,
      "--y": `${Math.round(y)}px`,
      "--s": `${size.toFixed(2)}px`,
      "--g": glow.toFixed(2),

      "--dx": `${dx.toFixed(2)}px`,
      "--dy": `${dy.toFixed(2)}px`,
      "--dur": `${dur.toFixed(2)}s`,
      "--tw": `${tw.toFixed(2)}s`,
      "--delay": `${delay.toFixed(2)}s`,
      "--twDelay": `${twDelay.toFixed(2)}s`,

      "--c": `hsla(${hue.toFixed(1)} ${sat.toFixed(1)}% ${light.toFixed(1)}% / ${alpha.toFixed(2)})`,
      "--rot": `${rot.toFixed(2)}deg`,

      // key depth variable
      "--par": par,
    },
  };
}

function applyScrollVar() {
  setRootVar("--scrollY", `${window.scrollY || 0}px`);
}

function onScroll() {
  // rAF throttle
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    applyScrollVar();
    scrollRaf = 0;
  });
}

function rebuildWisps() {
  const pageH = getPageHeight();
  setRootVar("--pageH", `${pageH}px`);

  const count = computeCount(pageH);
  wispParticles.value = Array.from({ length: count }, (_, i) => makeParticle(i, pageH));
}

function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuildWisps, 140);
}

onMounted(() => {
  applyScrollVar();
  rebuildWisps();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", scheduleRebuild, { passive: true });

  // Auto rebuild when document size/layout changes
  resizeObs = new ResizeObserver(() => scheduleRebuild());
  resizeObs.observe(document.documentElement);
  if (document.body) resizeObs.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", scheduleRebuild);

  if (resizeObs) resizeObs.disconnect();
  if (rebuildTimer) clearTimeout(rebuildTimer);
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});

watch(
    () => [props.densityPerScreen, props.minCount, props.maxCount, props.count],
    () => scheduleRebuild()
);
</script>
