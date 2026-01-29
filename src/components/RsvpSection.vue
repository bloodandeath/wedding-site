<template>
  <section class="section" id="rsvp">
    <div class="container">
      <h2 class="h2">{{ title }}</h2>
      <p class="lead" v-if="lead">{{ lead }}</p>

      <!-- EMBED MODE -->
      <article v-if="mode === 'embed'" class="card rsvp-card">
        <div class="embed" role="region" :aria-label="`${title} form`">
          <iframe
              class="embed-frame"
              :src="embedUrl"
              :title="`${title} form`"
              loading="lazy"
              referrerpolicy="no-referrer"
          />
        </div>

        <p class="text muted rsvp-help">
          If the form doesn’t load, open it in a new tab:
          <a class="link" :href="fallbackUrl || embedUrl" target="_blank" rel="noreferrer">
            RSVP link
          </a>
        </p>

        <p class="text muted rsvp-help" v-if="privacyNote">
          {{ privacyNote }}
        </p>
      </article>

      <!-- SELF-HOSTED MODE (stub you can wire later) -->
      <article v-else class="card rsvp-card">
        <p class="text muted">
          RSVP is not configured yet.
        </p>

        <a
            v-if="fallbackUrl"
            class="btn btn--small"
            :href="fallbackUrl"
            target="_blank"
            rel="noreferrer"
        >
          RSVP link
        </a>
      </article>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  mode: { type: String, default: "embed" }, // "embed" | "selfHosted"
  title: { type: String, default: "RSVP" },
  lead: {
    type: String,
    default: "Please let us know if you can make it. We can’t wait to celebrate with you!",
  },
  embedUrl: { type: String, default: "" }, // e.g. Google Form embed URL
  fallbackUrl: { type: String, default: "" }, // optional: opens in a new tab
  privacyNote: {
    type: String,
    default:
        "We’ll only use your info for wedding planning. No guest list is published.",
  },
});
</script>

<style scoped>
.rsvp-card {
  padding: 0.9rem;
}

.embed {
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  min-height: 520px;
}

.embed-frame {
  width: 100%;
  height: 720px; /* tweak to match your form */
  border: 0;
  display: block;
}

.rsvp-help {
  margin-top: 0.9rem;
}
</style>
