<template>
  <section class="section section--alt" id="rsvp">
    <div class="container">
      <h2 class="h2">{{ title }}</h2>
      <p v-if="lead" class="lead">{{ lead }}</p>

      <article class="card rsvp-card">
        <!-- Tally dynamic-height embed -->
        <div class="embed" role="region" :aria-label="title + ' form'">
          <iframe
              ref="iframeEl"
              :data-tally-src="embedUrl"
              loading="lazy"
              width="100%"
              height="100"
              frameborder="0"
              marginheight="0"
              marginwidth="0"
              :title="title + ' form'"
              class="embed-frame"
          />
        </div>

        <p class="text muted rsvp-help">
          <span v-if="helpText">{{ helpText }} </span>
          <a class="link" :href="fallbackUrl || embedUrl" target="_blank" rel="noreferrer">
            RSVP link
          </a>
        </p>

        <p v-if="privacyNote" class="text muted rsvp-help">
          {{ privacyNote }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

const {
  title,
  lead,
  helpText,
  embedUrl,
  fallbackUrl,
  privacyNote,
} = defineProps({
  title: { type: String, default: "RSVP" },
  lead: { type: String, default: "" },
  helpText: { type: String, default: "" },
  embedUrl: { type: String, required: true },
  fallbackUrl: { type: String, default: "" },
  privacyNote: { type: String, default: "" },
});

const iframeEl = ref(null);
let heightObserver = null;

function ensureTallyScript() {
  const widgetScriptSrc = "https://tally.so/widgets/embed.js";
  const existing = document.querySelector(`script[src="${widgetScriptSrc}"]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = widgetScriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

function loadTallyEmbeds() {
  if (window.Tally && typeof window.Tally.loadEmbeds === "function") {
    window.Tally.loadEmbeds();
    return;
  }

  const el = iframeEl.value;
  if (el && !el.getAttribute("src")) {
    el.setAttribute("src", embedUrl);
  }
}

function enableSmoothHeight() {
  const el = iframeEl.value;
  if (!el) return;

  const applyHeightFromAttr = () => {
    const hAttr = el.getAttribute("height");
    const next = Number.parseInt(hAttr || "", 10);
    if (!Number.isFinite(next) || next <= 0) return;

    const current = Number.parseInt(el.style.height || "", 10);
    if (!Number.isFinite(current) || current <= 0) {
      el.style.height = `${next}px`;
      return;
    }
    el.style.height = `${next}px`;
  };

  applyHeightFromAttr();

  if (heightObserver) heightObserver.disconnect();
  heightObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "height") {
        applyHeightFromAttr();
      }
    }
  });

  heightObserver.observe(el, { attributes: true, attributeFilter: ["height"] });
}

async function initEmbed() {
  await ensureTallyScript();
  loadTallyEmbeds();
  enableSmoothHeight();
}

onMounted(() => {
  initEmbed();
});

watch(
    () => embedUrl,
    () => {
      initEmbed();
    }
);

onBeforeUnmount(() => {
  if (heightObserver) heightObserver.disconnect();
});
</script>

<style scoped>
.rsvp-card {
  padding: 0.6rem;
}

.embed {
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  min-height: 0;
}

.embed-frame {
  width: 100%;
  border: 0;
  display: block;
  transition: height 200ms ease;
  will-change: height;
}

.rsvp-help {
  margin-top: 0.6rem;
}
</style>
