<template>
  <section class="section" id="registry">
    <div class="container">
      <div class="registry-head">
        <div>
          <h2 class="h2">Registry</h2>
          <p class="lead">
            Here are a few items we'd greatly appreciate. If you would like to contribute to our house & honeymoon fund, please bring an envelope to the ceremony.
          </p>
        </div>

        <a class="btn btn--ghost registry-amazon" :href="amazonRegistryUrl" target="_blank" rel="noreferrer">
          View full registry on Amazon
        </a>
      </div>

      <div class="reg-carousel" aria-label="Registry items carousel">
        <a
            v-for="item in registryItems"
            :key="item.id"
            class="reg-card"
            :href="item.url"
            target="_blank"
            rel="noreferrer"
        >
          <div class="reg-img">
            <img :src="item.image" :alt="item.title" loading="lazy" />
          </div>

          <div class="reg-body">
            <div class="reg-title">{{ item.title }}</div>
            <span class="reg-price" v-if="item.price">{{ item.price }}</span>

            <div class="reg-meta">
              <span class="reg-cta">View on Amazon →</span>
            </div>
          </div>
        </a>
      </div>

      <p class="muted registry-footnote">Availability is always up to date at the Amazon registry link</p>
    </div>
  </section>
</template>

<script setup>
import registryData from "@/data/registry.amazon.json";

const registryItems = registryData.items ?? [];
const amazonRegistryUrl = registryData.amazonRegistryUrl ?? "https://www.amazon.com/";
</script>
