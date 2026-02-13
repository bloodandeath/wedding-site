<template>
  <section class="section" id="contact">
    <div class="container">
      <h2 class="h2">Contact</h2>
      <p class="text" style="margin-bottom: 1rem">Questions? Reach out anytime.</p>

      <div class="grid grid--2">
        <article class="card" v-for="person in contacts" :key="person.name">
          <h3 class="h3">{{ person.title }}</h3>
          <p class="text">{{ person.name }}</p>
          <p class="text">
            <a class="link" :href="`tel:${person.phone}`">{{ person.phone }}</a>
          </p>
          <p class="text">
            <a class="link" :href="`mailto:${person.email}`">{{ person.email }}</a>
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  contacts: Array,
});
</script>
