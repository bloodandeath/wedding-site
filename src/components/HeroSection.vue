<template>
  <header class="hero" role="banner">
    <section class="hero-content" id="top">
      <div class="container hero-inner">
        <!-- Top text -->
        <div class="hero-top">
          <p class="eyebrow">The wedding of</p>
          <h1 class="title">{{ titleLine }}</h1>
          <p class="subtitle">{{ dateText }} • {{ cityText }}</p>
        </div>

        <!-- Countdown + Details share one aligned column -->
        <div class="hero-mid">
          <!-- Countdown -->
          <div class="countdown countdown--compact" aria-label="Countdown to wedding day">
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
              <div class="cd-label">Min</div>
            </div>
            <div class="cd-item">
              <div class="cd-num">{{ countdown.seconds }}</div>
              <div class="cd-label">Sec</div>
            </div>
          </div>

          <!-- Details -->
          <article class="details-card" aria-label="Location details">
            <div class="details-head">
              <div class="details-kicker">{{ detailsKicker }}</div>
              <div class="details-time" v-if="details.time">{{ details.time }}</div>
            </div>

            <div class="details-venue" v-if="details.venue">{{ details.venue }}</div>

            <div class="details-addressBar" v-if="details.address">
              <!-- Left: address + copy -->
              <div class="addressLeft">
    <span class="details-address muted">
      {{ details.address }}
    </span>

                <div class="copyWrap">
                  <button
                      class="copyBtn"
                      type="button"
                      :class="{ 'is-copied': copied }"
                      :aria-label="copied ? 'Address copied' : 'Copy address'"
                      @click="copyAddress"
                  >
        <span class="copyIcon" aria-hidden="true">
          <!-- Copy icon -->
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

          <!-- Check icon -->
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

              <!-- Right: maps -->
              <div class="addressRight">
                <!-- iOS split button -->
                <div
                    v-if="isIOS && (appleMapsHref || googleMapsHref)"
                    class="splitBtn"
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
                    Apple Maps
                  </a>
                  <a
                      v-if="googleMapsHref"
                      class="splitBtn__item"
                      :href="googleMapsHref"
                      target="_blank"
                      rel="noreferrer"
                  >
                    Google Maps
                  </a>
                </div>

                <!-- non-iOS -->
                <a
                    v-else-if="mapsHref"
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
        </div>

        <!-- CTAs -->
        <div class="cta-row">
          <a class="btn" :href="rsvpUrl">RSVP</a>
          <a class="btn btn--ghost" href="#schedule">View schedule</a>
        </div>

        <!-- Note -->
        <p class="note" v-if="dressCode || guestPolicy">
          <span v-if="dressCode">Dress code: <strong>{{ dressCode }}</strong></span>
          <span v-if="dressCode && guestPolicy"> • </span>
          <span v-if="guestPolicy">Adults/children: <strong>{{ guestPolicy }}</strong></span>
        </p>
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

// Scroll cue
const showScrollCue = ref(true);
function onCueScroll() {
  showScrollCue.value = (window.scrollY || 0) < 40;
}
onMounted(() => {
  onCueScroll();
  window.addEventListener("scroll", onCueScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener("scroll", onCueScroll));

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

// Apple Maps (iOS)
const appleMapsHref = computed(() => {
  const q = queryString.value;
  if (!q) return "";
  return `https://maps.apple.com/?q=${enc(q)}`;
});

// Google Maps (works on iOS too, opens app if installed; otherwise browser)
const googleMapsHref = computed(() => {
  const q = queryString.value;
  if (!q) return "";
  return `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
});

// Non-iOS default link
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
