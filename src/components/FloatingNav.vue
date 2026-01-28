<template>
  <nav
      ref="navRef"
      class="nav nav--floating nav--right"
      :class="{ 'nav--open': navOpen, 'nav--scrolling': isScrolling }"
      aria-label="Primary"
  >
    <div class="nav-orb">
      <button
          class="brand brand--toggle"
          type="button"
          @click="navOpen = !navOpen"
          :aria-expanded="String(navOpen)"
          aria-controls="nav-menu"
          aria-label="Toggle navigation"
      >
        <span class="brand-mark">
          <CrestLogo class="brand-mark__svg" />
        </span>
      </button>
    </div>

    <transition name="nav-reveal">
      <div v-if="navOpen" id="nav-menu" class="nav-links nav-links--expanded">
        <a v-for="l in links" :key="l.href" :href="l.href" @click="navOpen = false">{{ l.label }}</a>
        <a class="btn btn--small" :href="rsvpUrl">RSVP</a>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import CrestLogo from "@/assets/logo.svg?component";

defineProps({
  rsvpUrl: { type: String, required: true },
  links: {
    type: Array,
    default: () => [
      { label: "Home", href: "#top" },
      { label: "Details", href: "#details" },
      { label: "Schedule", href: "#schedule" },
      { label: "Travel", href: "#travel" },
      { label: "Registry", href: "#registry" },
      { label: "FAQ", href: "#faq" },
    ],
  },
});

const navOpen = ref(false);
const navRef = ref(null);

const isScrolling = ref(false);
let scrollTimer = null;

function onScrollAffordance() {
  if (!isScrolling.value) isScrolling.value = true;
  if (scrollTimer) window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => (isScrolling.value = false), 220);
}

function closeNav() {
  navOpen.value = false;
}

function onDocumentPointerDown(e) {
  if (!navOpen.value) return;
  const navEl = navRef.value;
  if (navEl && navEl.contains(e.target)) return;
  closeNav();
}

let lastScrollY = window.scrollY;
function onWindowScroll() {
  if (!navOpen.value) return;
  const dy = Math.abs(window.scrollY - lastScrollY);
  if (dy > 6) closeNav();
  lastScrollY = window.scrollY;
}

function onKeyDown(e) {
  if (e.key === "Escape" && navOpen.value) closeNav();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown, { capture: true });
  window.addEventListener("scroll", onWindowScroll, { passive: true });
  window.addEventListener("scroll", onScrollAffordance, { passive: true });
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, { capture: true });
  window.removeEventListener("scroll", onWindowScroll);
  window.removeEventListener("scroll", onScrollAffordance);
  window.removeEventListener("keydown", onKeyDown);
});
</script>
