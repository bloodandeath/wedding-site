<template>
  <div class="wisps" aria-hidden="true">
    <div
        v-for="p in particles"
        :key="p.id"
        class="wisp"
        :style="p.style"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

/**
 * Density model:
 * - densityPerScreen controls how many wisps per viewport-height of content
 * - minCount / maxCount clamp for performance
 */
const props = defineProps({
  densityPerScreen: { type: Number, default: 120 }, // tune up/down
  minCount: { type: Number, default: 160 },
  maxCount: { type: Number, default: 520 },

  // Optional: allow forcing a specific count (set to 0 to use density)
  count: { type: Number, default: 0 },
});

const particles = ref([]);

let ro = null;
let rebuildTimer = null;
let rafId = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
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
 * Depth/parallax factor:
 * Bigger wisps move faster than smaller ones.
 * The value is unitless multiplier used in CSS:
 *   top: calc(var(--y) + (var(--scrollY) * var(--par)))
 */
function computeParallaxFactor(sizePx, maxSizePx) {
  const sizeNorm = sizePx / maxSizePx; // 0..1
  const jitter = rand(0.80, 1.20);     // small random fluctuation
  const base = 0.02 + sizeNorm * 0.18; // ~0.02..0.20
  return +(base * jitter).toFixed(4);
}

function makeParticle(id, pageH) {
  // Spread across entire document space
  const x = rand(0, 100);
  const y = rand(0, pageH);

  // Size range (kept modest to avoid “balls”; glow handled in CSS/SASS)
  const minS = 2.6;
  const maxS = 6.2;
  const size = rand(minS, maxS);

  // Visual / behavior vars
  const glow = rand(0.65, 2.0);

  const dx = rand(-26, 26);
  const dy = rand(-22, 22);
  const dur = rand(18, 44);

  const tw = rand(4, 10);
  const delay = -rand(0, dur);
  const twDelay = -rand(0, tw);

  // Color tint (sage-family)
  const hue = rand(128, 152);
  const sat = rand(40, 70);
  const light = rand(18, 28);
  const alpha = rand(0.45, 0.75);

  // Size-derived parallax speed (bigger = faster)
  const par = computeParallaxFactor(size, maxS);

  // For star glints / rotation
  const rot = rand(0, 360);

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

      // Key parallax factor
      "--par": par,
    },
  };
}

function applyScrollVar() {
  setRootVar("--scrollY", `${window.scrollY}px`);
}

function rebuildWisps() {
  const pageH = getPageHeight();
  setRootVar("--pageH", `${pageH}px`);

  const count = computeCount(pageH);
  particles.value = Array.from({ length: count }, (_, i) => makeParticle(i, pageH));
}

function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    rebuildWisps();
  }, 140);
}

function startScrollRAF() {
  const tick = () => {
    applyScrollVar();
    rafId = requestAnimationFrame(tick);
  };
  tick();
}

function stopScrollRAF() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

onMounted(() => {
  // Initial state
  applyScrollVar();
  rebuildWisps();

  // Keep scroll var updated smoothly
  startScrollRAF();

  // Rebuild on resize
  window.addEventListener("resize", scheduleRebuild, { passive: true });

  // Auto-rebuild when layout/page height changes
  ro = new ResizeObserver(() => {
    scheduleRebuild();
  });

  // observing both catches more cases across browsers/layouts
  ro.observe(document.documentElement);
  if (document.body) ro.observe(document.body);
});

onBeforeUnmount(() => {
  stopScrollRAF();
  window.removeEventListener("resize", scheduleRebuild);

  if (ro) ro.disconnect();
  if (rebuildTimer) clearTimeout(rebuildTimer);
});

// If density-related props change, rebuild
watch(
    () => [props.densityPerScreen, props.minCount, props.maxCount, props.count],
    () => scheduleRebuild()
);
</script>
