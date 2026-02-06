<template>
  <div class="wisps" aria-hidden="true">
    <span
        v-for="p in wispParticles"
        :key="p.id"
        class="wisp"
        :class="p.depthClass"
        :style="p.style"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

/**
 * Density model:
 * - densityPerScreen controls how many wisps per viewport-height of content
 * - clamps keep perf stable
 */
const props = defineProps({
  densityPerScreen: { type: Number, default: 170 }, // denser
  minCount: { type: Number, default: 360 },
  maxCount: { type: Number, default: 1200 },

  // Optional: set >0 to force a count (leave 0 to use density model)
  count: { type: Number, default: 0 },
});

const wispParticles = ref([]);

let ro = null;
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
 * Depth bands:
 * - far: smallest wisps (lag most)
 * - near: largest wisps (lag least) => "move faster"
 */
function depthClassForSize(sizePx, minS, maxS) {
  const t = (sizePx - minS) / (maxS - minS); // 0..1
  if (t < 0.33) return "depth-far";
  if (t < 0.70) return "depth-mid";
  return "depth-near";
}

function makeParticle(id, pageH) {
  const x = rand(0, 100);
  const y = rand(0, pageH);

  // Slightly larger range (still point-light via SCSS)
  const minS = 1.9;
  const maxS = 5.2;
  const size = rand(minS, maxS);

  const glow = rand(0.85, 2.2);

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

  return {
    id,
    depthClass: depthClassForSize(size, minS, maxS),
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
    },
  };
}

function applyParallaxVars() {
  const y = window.scrollY || 0;

  // Far lags most (moves slowest) => largest offset
  // Near lags least (moves fastest) => smallest offset
  setRootVar("--wispParFar", `${Math.round(y * 0.38)}px`);
  setRootVar("--wispParMid", `${Math.round(y * 0.22)}px`);
  setRootVar("--wispParNear", `${Math.round(y * 0.10)}px`);

  // keep this if anything else uses it
  setRootVar("--scrollY", `${y}px`);
}

function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    applyParallaxVars();
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
  applyParallaxVars();
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
