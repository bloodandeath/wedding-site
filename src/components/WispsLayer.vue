<template>
  <div class="wisps" aria-hidden="true">
    <span v-for="p in wispParticles" :key="p.id" class="wisp" :style="p.style" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  count: { type: Number, default: 90 },
});

const wispParticles = ref([]);

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function makeParticle(id) {
  const x = rand(0, 100);
  const y = rand(0, 100);

  const size = rand(1.2, 3.6);
  const glow = rand(0.35, 1.1);
  const depth = -rand(0.03, 0.16);

  const dx = rand(-26, 26);
  const dy = rand(-22, 22);
  const dur = rand(9, 24);

  const tw = rand(1.8, 5.2);
  const delay = -rand(0, dur);
  const twDelay = -rand(0, tw);

  const hue = rand(128, 150);
  const sat = rand(40, 70);
  const light = rand(18, 28);
  const alpha = rand(0.45, 0.75);

  return {
    id,
    style: {
      "--x": `${x}vw`,
      "--y": `${y}vh`,
      "--s": `${size}px`,
      "--g": glow.toFixed(2),
      "--d": depth.toFixed(3),
      "--dx": `${dx.toFixed(2)}px`,
      "--dy": `${dy.toFixed(2)}px`,
      "--dur": `${dur.toFixed(2)}s`,
      "--tw": `${tw.toFixed(2)}s`,
      "--delay": `${delay.toFixed(2)}s`,
      "--twDelay": `${twDelay.toFixed(2)}s`,
      "--c": `hsla(${hue} ${sat}% ${light}% / ${alpha})`,
    },
  };
}

function buildWispParticles() {
  wispParticles.value = Array.from({ length: props.count }, (_, i) => makeParticle(i));
}

let parallaxRaf = 0;
let latestScrollY = 0;

function updateParallaxVars() {
  document.documentElement.style.setProperty("--scrollY", `${latestScrollY}px`);
}

function onParallaxScroll() {
  latestScrollY = window.scrollY || 0;
  if (parallaxRaf) return;

  parallaxRaf = window.requestAnimationFrame(() => {
    updateParallaxVars();
    parallaxRaf = 0;
  });
}

function onResizeRebuild() {
  buildWispParticles();
}

onMounted(() => {
  buildWispParticles();
  onParallaxScroll();
  window.addEventListener("scroll", onParallaxScroll, { passive: true });
  window.addEventListener("resize", onResizeRebuild, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onParallaxScroll);
  window.removeEventListener("resize", onResizeRebuild);
  if (parallaxRaf) window.cancelAnimationFrame(parallaxRaf);
});
</script>
