<template>
  <section class="section" id="registry">
    <div class="container">
      <h2 class="h2">Registry</h2>

      <div class="registry-head">
        <p class="lead">
          Here are a few items we'd greatly appreciate. If you would like to contribute to our house & honeymoon fund, please bring an envelope to the ceremony.
        </p>

        <a class="btn btn--ghost registry-amazon" :href="amazonRegistryUrl" target="_blank" rel="noreferrer">
          View full registry on Amazon
        </a>
      </div>

      <div class="reg-carousel" aria-label="Registry items carousel">
        <component
            :is="item.purchased ? 'div' : 'a'"
            v-for="item in registryItems"
            :key="item.id"
            class="reg-card"
            :class="{ 'reg-card--purchased': item.purchased }"
            v-bind="item.purchased ? {} : { href: item.url, target: '_blank', rel: 'noreferrer' }"
        >
          <div class="reg-img" :style="item.lqip ? { '--lqip': `url(${item.lqip})` } : null">
            <img
                :src="item.image"
                :alt="item.title"
                loading="lazy"
                decoding="async"
                :class="{ loaded: loaded[item.image] }"
                @load="onImgLoad(item.image)"
            />
          </div>

          <div class="reg-body">
            <div class="reg-title">{{ item.title }}</div>
            <span class="reg-price" v-if="item.price">{{ item.price }}</span>

            <div class="reg-meta">
              <span class="reg-cta" v-if="!item.purchased">View on Amazon →</span>
              <span class="reg-purchased-label" v-else>Purchased</span>
            </div>
          </div>
        </component>
      </div>

      <p class="muted registry-footnote">Availability is always up to date at the Amazon registry link</p>
    </div>
  </section>
</template>

<script setup>
import { reactive } from "vue";
import registryData from "@/data/registry.amazon.json";

const registryItems = registryData.items ?? [];
const amazonRegistryUrl = registryData.amazonRegistryUrl ?? "https://www.amazon.com/";

const loaded = reactive({});

function onImgLoad(src) {
  loaded[src] = true;
}
</script>
