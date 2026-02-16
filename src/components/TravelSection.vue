<template>
  <section class="section" id="travel">
    <div class="container">
      <h2 class="h2">Travel & Stay</h2>

      <div class="grid grid--2">
        <article class="card" v-for="acc in accommodations" :key="acc.name">
          <span v-if="acc.isVenue" class="venue-badge">Wedding Venue</span>
          <h3 class="h3">{{ acc.name }}</h3>
          <p class="text">{{ acc.description }}</p>
          <p class="text muted">{{ acc.address }}</p>
          <p v-if="acc.blockDeadline" class="text muted">
            Block rate until <strong>{{ acc.blockDeadline }}</strong>
          </p>
          <p v-if="acc.bookingNote" class="text muted">{{ acc.bookingNote }}</p>
          <a class="btn btn--ghost btn--full" :href="acc.bookingUrl" target="_blank" rel="noreferrer">
            Book your room
          </a>
        </article>

        <article class="card card--travel">
          <h3 class="h3">Getting There</h3>
          <ul class="list">
            <li><strong>Airport:</strong> {{ travel.airport }}</li>
            <li><strong>Parking:</strong> {{ travel.parking }}</li>
            <li><strong>Rideshare:</strong> {{ travel.rideshare }}</li>
            <li v-if="travel.rentalCar"><strong>Rental Car:</strong> {{ travel.rentalCar }}</li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  accommodations: Array,
  travel: Object,
});
</script>

<style scoped>
.venue-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: white;
  background: rgba(123, 143, 122, 0.85);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.45rem;
}

.btn {
  margin-top: 0.5rem;
}

.card--travel {
  grid-column: 1 / -1;
}
</style>
