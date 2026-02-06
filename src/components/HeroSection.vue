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
            <div class="details-address muted" v-if="details.address">{{ details.address }}</div>

            <div class="details-actions">
              <a
                  v-if="mapsHref"
                  class="btn btn--small"
                  :href="mapsHref"
                  target="_blank"
                  rel="noreferrer"
              >
                Open in Maps
              </a>

              <button
                  v-if="details.address"
                  class="btn btn--ghost btn--small"
                  type="button"
                  @click="copyAddress"
              >
                Copy address
              </button>
            </div>

            <p v-if="copyToast" class="details-toast" role="status" aria-live="polite">
              Copied ✨
            </p>
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

  // Uses your current siteContent model: c.details
  details: {
    type: Object,
    default: () => ({ time: "", venue: "", address: "", mapUrl: "" }),
  },

  detailsKicker: { type: String, default: "Ceremony & Reception" },
});

const { countdown } = useCountdown(props.weddingDateISO);

const showScrollCue = ref(true);
function onCueScroll() {
  showScrollCue.value = (window.scrollY || 0) < 40;
}

onMounted(() => {
  onCueScroll();
  window.addEventListener("scroll", onCueScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener("scroll", onCueScroll));

// Maps link: Apple Maps on iOS, Google Maps elsewhere
function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function enc(s) {
  return encodeURIComponent((s || "").trim());
}

const mapsHref = computed(() => {
  const addr = props.details?.address || "";
  const venue = props.details?.venue || "";
  const q = `${venue ? venue + ", " : ""}${addr}`.trim();
  if (!q) return "";

  if (isIOS()) return `https://maps.apple.com/?q=${enc(q)}`;
  return `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
});

const copyToast = ref(false);
async function copyAddress() {
  const text = `${props.details?.venue ? props.details.venue + "\n" : ""}${props.details?.address || ""}`.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard can be blocked; just show toast anyway
  }

  copyToast.value = true;
  window.setTimeout(() => (copyToast.value = false), 1200);
}
</script>
