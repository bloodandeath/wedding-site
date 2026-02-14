<template>
  <main class="page">
    <WispsLayer
        :densityPerScreen="160"
    />

    <FloatingNav />

    <HeroSection
        :titleLine="c.titleLine"
        :dateText="c.dateText"
        :cityText="c.cityText"
        :dressCode="c.dressCode"
        :guestPolicy="c.guestPolicy"
        :weddingDateISO="c.weddingDateISO"
        :details="c.details"
    />

    <GallerySection
        data-reveal
        :title="c.gallery.title"
        :lead="c.gallery.lead"
        :slides="c.gallery.slides"
        :autoplayMs="c.gallery.autoplayMs"
    />

    <ScheduleSection
        data-reveal
        :schedule="c.schedule"
    />

    <TravelSection
        data-reveal
        :accommodations="c.accommodations"
        :travel="c.travel"
    />

    <RsvpSection
        data-reveal
        :title="c.rsvp.title"
        :lead="c.rsvp.lead"
        :deadlineText="c.rsvp.deadlineText"
        :submitUrl="c.rsvp.submitUrl"
        :helpText="c.rsvp.helpText"
    />

    <RegistrySection data-reveal />

    <FaqSection
        data-reveal
        :faqs="c.faqs"
    />

    <ContactSection
        data-reveal
        :contacts="c.contacts"
    />

    <SiteFooter
        :coupleLine="c.coupleLine"
        :dateText="c.dateText"
        :cityText="c.cityText"
        :rsvpUrl="c.rsvpUrl"
    />
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import WispsLayer from "@/components/WispsLayer.vue";
import FloatingNav from "@/components/FloatingNav.vue";
import HeroSection from "@/components/HeroSection.vue";
import GallerySection from "@/components/GallerySection.vue";
import ScheduleSection from "@/components/ScheduleSection.vue";
import TravelSection from "@/components/TravelSection.vue";
import RsvpSection from "@/components/RsvpSection.vue";
import RegistrySection from "@/components/RegistrySection.vue";
import ContactSection from "@/components/ContactSection.vue";
import FaqSection from "@/components/FaqSection.vue";
import SiteFooter from "@/components/SiteFooter.vue";

import { siteContent as c } from "@/data/siteContent";

let revealObserver = null;

onMounted(() => {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 }
  );

  for (const el of els) revealObserver.observe(el);
});

onBeforeUnmount(() => {
  if (revealObserver) revealObserver.disconnect();
});
</script>

<style src="@/assets/app.scss"></style>
