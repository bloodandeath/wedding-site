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
        :title="c.gallery.title"
        :lead="c.gallery.lead"
        :slides="c.gallery.slides"
        :autoplayMs="c.gallery.autoplayMs"
    />

    <ScheduleSection
        :schedule="c.schedule"
    />

    <TravelSection
        :accommodations="c.accommodations"
        :travel="c.travel"
    />

    <RsvpSection
        mode="embed"
        :title="c.rsvp.title"
        :lead="c.rsvp.lead"
        :privacyNote="c.rsvp.privacyNote"
        :embedUrl="c.rsvp.embedUrl"
        :fallbackUrl="c.rsvp.fallbackUrl"
        :deadlineText="c.rsvp.deadlineText"
        :helpText="c.rsvp.helpText"
    />

    <RegistrySection />

    <FaqSection
        :faqs="c.faqs"
    />

    <ContactSection
        :contactName="c.contactName"
        :contactEmail="c.contactEmail"
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
</script>

<style src="@/assets/app.scss"></style>
