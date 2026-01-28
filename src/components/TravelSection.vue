<template>
  <section class="section section--alt" id="travel">
    <div class="container">
      <h2 class="h2">Travel & stay</h2>

      <div class="grid grid--2">
        <article class="card">
          <h3 class="h3">Hotel block</h3>
          <p class="text">
            {{ hotel.name }}<br />
            <span class="muted">{{ hotel.address }}</span>
          </p>
          <p class="text muted">
            Block rate until <strong>{{ hotel.blockDeadline }}</strong>
          </p>
          <a class="btn btn--ghost btn--full" :href="hotel.bookingUrl" target="_blank" rel="noreferrer">
            Book your room
          </a>
        </article>

        <article class="card">
          <h3 class="h3">Getting there</h3>
          <ul class="list">
            <li><strong>Airport:</strong> {{ travel.airport }}</li>
            <li><strong>Parking:</strong> {{ travel.parking }}</li>
            <li><strong>Rideshare:</strong> {{ travel.rideshare }}</li>
          </ul>
          <a class="link" :href="travelInfoUrl">More travel info</a>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  hotel: Object,
  travel: Object,
  travelInfoUrl: String,
});
</script>
