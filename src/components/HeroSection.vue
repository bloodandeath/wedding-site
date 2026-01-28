<template>
  <header class="hero" role="banner">
    <section class="hero-content" id="top">
      <p class="eyebrow">The wedding of</p>
      <h1 class="title">{{ titleLine }}</h1>
      <p class="subtitle">{{ dateText }} • {{ cityText }}</p>

      <div class="countdown" aria-label="Countdown to wedding day">
        <div class="cd-item">
          <div class="cd-num">{{ countdown.days }}</div>
          <div class="cd-label">Days</div>
        </div>
        <div class="cd-item">
          <div class="cd-num">{{ countdown.hours }}</div>
          <div class="cd-label">Hours</div>
        </div>
        <div class="cd-item">
          <div class="cd-num">{{ countdown.minutes }}</div>
          <div class="cd-label">Minutes</div>
        </div>
        <div class="cd-item">
          <div class="cd-num">{{ countdown.seconds }}</div>
          <div class="cd-label">Seconds</div>
        </div>
      </div>

      <div class="cta-row">
        <a class="btn" :href="rsvpUrl">RSVP</a>
        <a class="btn btn--ghost" href="#details">See details</a>
      </div>

      <p class="note">
        Dress code: <strong>{{ dressCode }}</strong> • Adults/children: <strong>{{ guestPolicy }}</strong>
      </p>
    </section>

    <a v-if="showScrollCue" class="scroll-cue" href="#details" aria-label="Scroll to details">
      <span class="scroll-cue__line" aria-hidden="true"></span>
      <span class="scroll-cue__dot" aria-hidden="true"></span>
      <span class="scroll-cue__text">Scroll</span>
    </a>

    <div class="hero-glow" aria-hidden="true"></div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useCountdown } from "@/composables/useCountdown";

const props = defineProps({
  titleLine: { type: String, required: true },
  dateText: { type: String, required: true },
  cityText: { type: String, required: true },
  dressCode: { type: String, required: true },
  guestPolicy: { type: String, required: true },
  weddingDateISO: { type: String, required: true },
  rsvpUrl: { type: String, required: true },
});

const { countdown } = useCountdown(props.weddingDateISO);

const showScrollCue = ref(true);
function onCueScroll() {
  showScrollCue.value = window.scrollY < 40;
}

onMounted(() => {
  onCueScroll();
  window.addEventListener("scroll", onCueScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onCueScroll);
});
</script>
