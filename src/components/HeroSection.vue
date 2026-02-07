<template>
  <header class="hero" role="banner">
    <section class="hero-content" id="home">
      <div class="container hero-inner">
        <!-- Top text -->
        <div class="hero-top">
          <p class="eyebrow">The wedding of</p>
          <h1 class="title">{{ titleLine }}</h1>
          <p class="subtitle">{{ dateText }}</p>
        </div>

        <!-- Countdown + Details share one aligned column -->
        <div class="hero-mid">
          <!-- Details -->
          <article class="details-card" aria-label="Location details">
            <div class="details-head">
              <div class="details-kicker">{{ detailsKicker }}</div>
              <div class="details-time" v-if="details.time">{{ details.time }}</div>
            </div>

            <div class="details-venue" v-if="details.venue">{{ details.venue }}</div>

            <!-- Address row: address + copy only -->
            <div class="details-addressBar" v-if="details.address">
              <div class="addressLeft">
                <span class="details-address muted">{{ details.address }}</span>

                <div class="copyWrap">
                  <button
                      class="copyBtn"
                      type="button"
                      :class="{ 'is-copied': copied }"
                      :aria-label="copied ? 'Address copied' : 'Copy address'"
                      @click="copyAddress"
                  >
                    <span class="copyIcon" aria-hidden="true">
                      <svg class="ico ico-copy" viewBox="0 0 24 24">
                        <path
                            d="M9 9h10v10H9V9Zm-4 6H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                      </svg>

                      <svg class="ico ico-check" viewBox="0 0 24 24">
                        <path
                            d="M20 6L9 17l-5-5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <span
                      class="copyTip"
                      :class="{ 'is-visible': copied }"
                      role="status"
                      aria-live="polite"
                  >
                    Copied
                  </span>
                </div>
              </div>
            </div>

            <!-- Foot row: Dress code left, Maps right (prevents mobile clashes) -->
            <div class="details-footBar" v-if="dressCode || guestPolicy || mapsAnyHref">
              <p class="note" v-if="dressCode || guestPolicy">
                <span v-if="dressCode">Dress code: <strong>{{ dressCode }}</strong></span>
                <span v-if="dressCode && guestPolicy"> • </span>
                <span v-if="guestPolicy">Adults/children: <strong>{{ guestPolicy }}</strong></span>
              </p>

              <div class="mapsSlot" v-if="mapsAnyHref">
                <!-- iOS split button -->
                <div
                    v-if="isIOS && (appleMapsHref || googleMapsHref)"
                    class="splitBtn splitBtn--compact"
                    role="group"
                    aria-label="Open in Maps"
                >
                  <a
                      v-if="appleMapsHref"
                      class="splitBtn__item splitBtn__item--primary"
                      :href="appleMapsHref"
                      target="_blank"
                      rel="noreferrer"
                  >
                    Apple
                  </a>
                  <a
                      v-if="googleMapsHref"
                      class="splitBtn__item"
                      :href="googleMapsHref"
                      target="_blank"
                      rel="noreferrer"
                  >
                    Google
                  </a>
                </div>

                <!-- non-iOS -->
                <a
                    v-else
                    class="btn btn--small"
                    :href="mapsHref"
                    target="_blank"
                    rel="noreferrer"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </article>

          <!-- Countdown -->
          <div class="countdownBar" aria-label="Countdown to wedding day">
            <span class="muted">Countdown:</span>
            <span class="barNum">{{ countdown.days }}</span><span class="barLab">days</span>
            <span class="barNum">{{ countdown.hours }}</span><span class="barLab">hrs</span>
            <span class="barNum">{{ countdown.minutes }}</span><span class="barLab">min</span>
            <span class="barNum">{{ countdown.seconds }}</span><span class="barLab">sec</span>
          </div>
        </div>

        <!-- CTAs -->
        <div class="cta-row">
          <a class="btn" href="#rsvp">RSVP</a>
          <a class="btn btn--ghost" href="#schedule">View schedule</a>
        </div>
      </div>
    </section>

    <!-- Scroll cue -->
    <a v-if="showScrollCue" class="scroll-cue" href="#schedule" aria-label="Scroll to schedule">
      <span class="scroll-cue__line" aria-hidden="true"></span>
      <span class="scroll-cue__dot" aria-hidden="true"></span>
      <span class="scroll-cue__text">Scroll</span>
    </a>

    <div class="hero-glow" aria-hidden="true"></div>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useCountdown } from "@/composables/useCountdown";

const props = defineProps({
  titleLine: { type: String, required: true },
  dateText: { type: String, required: true },
  cityText: { type: String, required: true },
  dressCode: { type: String, default: "" },
  guestPolicy: { type: String, default: "" },
  weddingDateISO: { type: String, required: true },
  rsvpUrl: { type: String, required: true },

  details: {
    type: Object,
    default: () => ({ time: "", venue: "", address: "", mapUrl: "" }),
  },

  detailsKicker: { type: String, default: "Ceremony & Reception" },
});

const { countdown } = useCountdown(props.weddingDateISO);

// Scroll cue — disappears permanently on first scroll
const showScrollCue = ref(true);
let scrollCueDismissed = false;

function onCueScroll() {
  if (!scrollCueDismissed && (window.scrollY || 0) >= 40) {
    scrollCueDismissed = true;
    showScrollCue.value = false;
    window.removeEventListener("scroll", onCueScroll);
  }
}

onMounted(() => {
  if ((window.scrollY || 0) >= 40) {
    scrollCueDismissed = true;
    showScrollCue.value = false;
  } else {
    window.addEventListener("scroll", onCueScroll, { passive: true });
  }
});
onUnmounted(() => {
  if (!scrollCueDismissed) window.removeEventListener("scroll", onCueScroll);
});

// iOS detection
const isIOS = computed(() => {
  if (typeof navigator === "undefined") return false;
  return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
});

function enc(s) {
  return encodeURIComponent((s || "").trim());
}

const queryString = computed(() => {
  const addr = props.details?.address || "";
  const venue = props.details?.venue || "";
  return `${venue ? venue + ", " : ""}${addr}`.trim();
});

const appleMapsHref = computed(() => {
  const q = queryString.value;
  if (!q) return "";
  return `https://maps.apple.com/?q=${enc(q)}`;
});

const googleMapsHref = computed(() => {
  const q = queryString.value;
  if (!q) return "";
  return `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
});

const mapsAnyHref = computed(() => !!(appleMapsHref.value || googleMapsHref.value));

const mapsHref = computed(() => {
  const q = queryString.value;
  if (!q) return "";
  return googleMapsHref.value;
});

// Copy button (copy -> check)
const copied = ref(false);
let copyTimer = null;

async function copyAddress() {
  const text = `${props.details?.venue ? props.details.venue + "\n" : ""}${props.details?.address || ""}`.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard can be blocked; we still animate feedback
  }

  copied.value = true;
  if (copyTimer) window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => (copied.value = false), 1200);
}

onUnmounted(() => {
  if (copyTimer) window.clearTimeout(copyTimer);
});
</script>
