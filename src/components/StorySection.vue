<template>
  <section class="section" id="story">
    <div class="container">
      <h2 class="h2">{{ title }}</h2>
      <p v-if="lead" class="lead">{{ lead }}</p>

      <article
          class="card gallery"
          tabindex="0"
          @keydown.left.prevent="prev"
          @keydown.right.prevent="next"
          :aria-label="title + ' gallery'"
      >
        <div class="viewport">
          <div class="track" :style="trackStyle">
            <figure v-for="(s, i) in slides" :key="i" class="slide">
              <img class="img" :src="s.src" :alt="s.alt || ''" loading="lazy" />
              <figcaption v-if="s.caption" class="caption">
                {{ s.caption }}
              </figcaption>
            </figure>
          </div>
        </div>

        <div class="controls">
          <button class="btn btn--small" type="button" @click="prev" aria-label="Previous photo">
            Prev
          </button>

          <div class="dots" role="tablist" aria-label="Gallery slide selector">
            <button
                v-for="(_, i) in slides"
                :key="i"
                class="dot"
                type="button"
                role="tab"
                :aria-selected="i === index"
                :aria-label="`Go to slide ${i + 1}`"
                @click="go(i)"
            />
          </div>

          <button class="btn btn--small" type="button" @click="next" aria-label="Next photo">
            Next
          </button>
        </div>

        <p v-if="slides.length" class="muted counter" aria-live="polite">
          {{ index + 1 }} / {{ slides.length }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  title: { type: String, default: "Our Story" },
  lead: { type: String, default: "" },
  slides: { type: Array, default: () => [] }, // [{src, alt, caption}]
  autoplayMs: { type: Number, default: 0 }, // 0 = off
});

const index = ref(0);
let timer = null;

const trackStyle = computed(() => ({
  transform: `translateX(-${index.value * 100}%)`,
}));

function clamp(i) {
  const n = props.slides.length;
  if (n === 0) return 0;
  return (i + n) % n;
}

function go(i) {
  index.value = clamp(i);
}

function next() {
  go(index.value + 1);
}

function prev() {
  go(index.value - 1);
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startAutoplay() {
  stopAutoplay();
  if (!props.autoplayMs || props.autoplayMs < 1000) return;
  if (props.slides.length <= 1) return;

  timer = setInterval(() => {
    next();
  }, props.autoplayMs);
}

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});

watch(
    () => [props.autoplayMs, props.slides.length],
    () => startAutoplay()
);
</script>

<style scoped>
.gallery {
  padding: 0.8rem;
  outline: none;
}

.viewport {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.45);
}

.track {
  display: flex;
  width: 100%;
  transition: transform 380ms ease;
  will-change: transform;
}

.slide {
  min-width: 100%;
  margin: 0;
}

.img {
  width: 100%;
  height: auto;
  display: block;
}

.caption {
  padding: 0.7rem 0.8rem;
}

.controls {
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.dots {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.dot[aria-selected="true"] {
  background: rgba(255, 255, 255, 1);
}

.counter {
  margin-top: 0.6rem;
  text-align: center;
}
</style>
