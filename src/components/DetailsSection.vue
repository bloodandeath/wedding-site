<template>
  <section class="section section--alt" id="details">
    <div class="container">
      <h2 class="h2">Wedding details</h2>

      <div class="grid grid--3">
        <article class="card">
          <h3 class="h3">Ceremony & Reception</h3>
          <p class="text">
            <strong>{{ ceremony.time }}</strong><br />
            {{ ceremony.venue }}<br />
            <span class="muted">{{ ceremony.address }}</span>
          </p>
          <a class="btn btn--small" :href="ceremony.mapUrlGoogle" target="_blank" rel="noreferrer">Open in maps</a>
        </article>

        <article class="card">
          <h3 class="h3">Reception</h3>
          <p class="text">
            <strong>{{ reception.time }}</strong><br />
            {{ reception.venue }}<br />
            <span class="muted">{{ reception.address }}</span>
          </p>
          <a class="link" :href="reception.mapUrl" target="_blank" rel="noreferrer">Open in maps</a>
        </article>

        <article class="card">
          <h3 class="h3">Contact</h3>
          <p class="text">
            Questions? Reach out anytime.<br />
            <span class="muted">{{ contactName }}</span><br />
            <a class="link" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  details: Object,
  reception: Object,
  contactName: String,
  contactEmail: String,
});
</script>
