<template>
  <section class="section section--alt" id="faq">
    <div class="container">
      <h2 class="h2">FAQ</h2>

      <div class="grid grid--2">
        <div
            v-for="(q, idx) in faqs"
            :key="idx"
            class="faq card"
            :class="{ 'faq--open': openFaq === idx }"
        >
          <button
              class="faq-summary"
              type="button"
              @click="openFaq = openFaq === idx ? null : idx"
              :aria-expanded="String(openFaq === idx)"
          >
            {{ q.q }}
            <span class="faq-icon" aria-hidden="true"></span>
          </button>

          <div class="faq-body" :class="{ 'faq-body--open': openFaq === idx }">
            <div class="faq-body__inner">
              <p class="text">{{ q.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
defineProps({ faqs: Array });
const openFaq = ref(null);
</script>
