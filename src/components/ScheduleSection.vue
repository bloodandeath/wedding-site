<template>
  <section class="section" id="schedule">
    <div class="container">
      <h2 class="h2">Schedule</h2>

      <div class="timeline">
        <div v-for="(item, idx) in schedule" :key="idx" class="timeline-item">
          <div class="dot" aria-hidden="true"></div>
          <div class="timeline-content card">
            <div class="row">
              <div class="time">{{ item.time }}</div>
              <div class="label">{{ item.title }}</div>
            </div>
            <div class="muted" v-if="item.notes">{{ item.notes }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ schedule: Array });
</script>
