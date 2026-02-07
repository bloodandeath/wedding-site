<template>
  <section class="section" id="contact">
    <div class="container">
      <h2 class="h2">Contact</h2>
      <article class="card">
        <p class="text">
          Questions? Reach out anytime.<br />
          <span class="muted">{{ contactName }}</span><br />
          <a class="link" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </p>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  contactName: String,
  contactEmail: String,
});
</script>
