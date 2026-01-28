<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-mark">
          <CrestLogo class="footer-mark__svg" />
        </span>

        <div class="footer-brand__text">
          <div class="footer-couple">{{ coupleLine }}</div>
          <div class="footer-sub muted">{{ dateText }} • {{ cityText }}</div>
        </div>
      </div>

      <div class="footer-meta">
        <div class="muted">
          © {{ new Date().getFullYear() }} •
          <a class="link" :href="rsvpUrl">RSVP</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import CrestLogo from "@/assets/logo.svg?component";

defineProps({
  coupleLine: String,
  dateText: String,
  cityText: String,
  rsvpUrl: String,
});
</script>
