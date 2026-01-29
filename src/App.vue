<template>
  <main class="page">
    <WispsLayer :count="90" />

    <FloatingNav :rsvpUrl="c.rsvpUrl" />

    <HeroSection
        :titleLine="c.titleLine"
        :dateText="c.dateText"
        :cityText="c.cityText"
        :dressCode="c.dressCode"
        :guestPolicy="c.guestPolicy"
        :weddingDateISO="c.weddingDateISO"
        :rsvpUrl="c.rsvpUrl"
    />

    <StorySection
        :storyLead="c.storyLead"
        :storyBody="c.storyBody"
        :photoAlt="c.photoAlt"
        :photoCaption="c.photoCaption"
        :weddingHashtag="c.weddingHashtag"
    />

    <DetailsSection
        :ceremony="c.ceremony"
        :reception="c.reception"
        :contactName="c.contactName"
        :contactEmail="c.contactEmail"
    />

    <ScheduleSection :schedule="c.schedule" />

    <TravelSection :hotel="c.hotel" :travel="c.travel" :travelInfoUrl="c.travelInfoUrl" />

    <RsvpSection />

    <RegistrySection />

    <FaqSection :faqs="c.faqs" />

    <SiteFooter :coupleLine="c.coupleLine" :dateText="c.dateText" :cityText="c.cityText" :rsvpUrl="c.rsvpUrl" />
  </main>
</template>

<script setup>
import WispsLayer from "@/components/WispsLayer.vue";
import FloatingNav from "@/components/FloatingNav.vue";
import HeroSection from "@/components/HeroSection.vue";
import StorySection from "@/components/StorySection.vue";
import DetailsSection from "@/components/DetailsSection.vue";
import ScheduleSection from "@/components/ScheduleSection.vue";
import TravelSection from "@/components/TravelSection.vue";
import RsvpSection from "@/components/RsvpSection.vue";
import RegistrySection from "@/components/RegistrySection.vue";
import FaqSection from "@/components/FaqSection.vue";
import SiteFooter from "@/components/SiteFooter.vue";

import { siteContent as c } from "@/data/siteContent";
</script>

<style src="@/assets/app.css"></style>
