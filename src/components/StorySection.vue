<template>
  <section class="section">
    <div class="container grid grid--2">
      <div>
        <h2 class="h2"></h2>
        <p class="lead">{{ storyLead }}</p>
        <p class="text">{{ storyBody }}</p>
      </div>

      <div class="card photo-card">
        <div class="photo" role="img" :aria-label="photoAlt"></div>
        <div class="photo-meta">
          <div class="mono">#{{ weddingHashtag }}</div>
          <div class="muted">{{ photoCaption }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  storyLead: String,
  storyBody: String,
  photoAlt: String,
  photoCaption: String,
  weddingHashtag: { type: String, default: "" },
});
</script>
