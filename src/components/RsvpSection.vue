<template>
  <section class="section section--alt" id="rsvp">
    <div class="container">
      <h2 class="h2">{{ title }}</h2>
      <p v-if="lead" class="lead">{{ lead }}</p>

      <article v-if="!closed" class="card rsvp-card">
        <!-- Form -->
        <form v-if="!submitted" @submit.prevent="onSubmit" novalidate>

          <!-- Name -->
          <div class="form-group">
            <label class="form-label" for="rsvp-name">Your full name: <span class="req">*</span></label>
            <input
                id="rsvp-name"
                v-model="form.name"
                type="text"
                class="form-input"
                required
                autocomplete="name"
                placeholder="John Smith IV."
            />
          </div>

          <!-- Attending choice -->
          <fieldset class="form-group choice-fieldset">
            <legend class="form-label">Will you be attending? <span class="req">*</span></legend>
            <div class="choice-list" role="radiogroup" aria-label="Attendance">
              <label
                  class="choice-card"
                  :class="{ 'choice-card--active': form.attending === 'accepts' }"
              >
                <input
                    v-model="form.attending"
                    class="choice-card__input"
                    type="radio"
                    name="rsvp-attending"
                    value="accepts"
                />
                <span class="choice-card__label">Joyfully accept</span>
              </label>

              <label
                  class="choice-card"
                  :class="{ 'choice-card--active': form.attending === 'declines' }"
              >
                <input
                    v-model="form.attending"
                    class="choice-card__input"
                    type="radio"
                    name="rsvp-attending"
                    value="declines"
                />
                <span class="choice-card__label">Regretfully decline</span>
              </label>
            </div>
          </fieldset>

          <!-- Accept path -->
          <div v-show="isAccepting" class="detail-block">
            <hr class="form-divider" />

            <div class="form-group">
              <label class="form-label" for="rsvp-party">
                How many people are in your party (including yourself): <span class="req">*</span>
              </label>
              <input
                  id="rsvp-party"
                  v-model.number="form.partySize"
                  type="number"
                  class="form-input form-input--narrow"
                  min="1"
                  max="20"
                  step="1"
                  inputmode="numeric"
              />
            </div>

            <div v-show="showKidsFields" class="detail-block detail-block--sub">
              <div class="form-group">
                <label class="form-label form-label--sub" for="rsvp-kids-under5">
                  Number of kids 5 &amp; under: <span class="req">*</span>
                </label>
                <input
                    id="rsvp-kids-under5"
                    v-model.number="form.kidsUnder5"
                    type="number"
                    class="form-input form-input--narrow"
                    min="0"
                    max="20"
                    step="1"
                    inputmode="numeric"
                />
              </div>

              <div class="form-group">
                <label class="form-label form-label--sub" for="rsvp-kids-6to10">
                  Number of kids 6-10: <span class="req">*</span>
                </label>
                <input
                    id="rsvp-kids-6to10"
                    v-model.number="form.kids6to10"
                    type="number"
                    class="form-input form-input--narrow"
                    min="0"
                    max="20"
                    step="1"
                    inputmode="numeric"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="rsvp-dietary">Dietary restrictions or allergies?</label>
              <textarea
                  id="rsvp-dietary"
                  v-model="form.dietary"
                  class="form-input form-textarea"
                  rows="2"
                  placeholder="Vegetarian, gluten-free, nut allergy, etc."
                  @input="autoGrow"
              ></textarea>
            </div>

            <hr class="form-divider" />

            <div class="form-group">
              <h3 class="contact-heading">Contact Info</h3>
              <p class="contact-desc">We will only use information left here to provide last-minute updates or to answer any questions.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="rsvp-email">Email (optional)</label>
              <input
                  id="rsvp-email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  autocomplete="email"
                  placeholder="john.smith4@gmail.com"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="rsvp-phone">Phone number (optional)</label>
              <input
                  id="rsvp-phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  autocomplete="tel"
                  inputmode="tel"
                  placeholder="(123) 456-7890"
              />
            </div>
          </div>

          <hr v-if="form.attending" class="form-divider" />

          <div class="form-group">
            <label class="form-label" for="rsvp-comments">Anything else we should know?</label>
            <textarea
                id="rsvp-comments"
                v-model="form.comments"
                class="form-input form-textarea"
                rows="3"
                @input="autoGrow"
            ></textarea>
          </div>

          <p v-if="deadlineText" class="text muted form-deadline">{{ deadlineText }}</p>

          <button
              type="submit"
              class="btn submit-btn"
              :class="{ 'is-shaking': shaking }"
              :disabled="submitting"
          >
            {{ submitting ? 'Sending...' : 'Submit' }}
            <svg v-if="!submitting" class="submit-arrow" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12m-5-5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <p class="form-error" :class="{ 'form-error--visible': error }">{{ error }}</p>
        </form>

        <!-- Success state -->
        <div v-else class="rsvp-success">
          <h3 class="h3">Thank you!</h3>
          <p class="text" v-if="form.attending === 'accepts'">
            We're looking forward to seeing you there!
          </p>
          <p class="text" v-else>
            We've received your response.
          </p>
        </div>
      </article>

      <article v-else class="card rsvp-card rsvp-closed-card" aria-live="polite">
        <div class="rsvp-closed__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="12" width="36" height="26" rx="4" stroke="currentColor" stroke-width="2"/>
            <path d="M8 15l16 12 16-12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="36" cy="36" r="7" fill="var(--panel)" stroke="currentColor" stroke-width="2"/>
            <path d="M33 36l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="h3 rsvp-closed__heading">{{ closedHeading }}</h3>
        <p v-if="closedMessage" class="text rsvp-closed__message">{{ closedMessage }}</p>
        <a v-if="closedCtaLabel" class="btn rsvp-closed__cta" :href="closedCtaHref">
          {{ closedCtaLabel }}
        </a>
      </article>

      <p v-if="!closed && helpText" class="text muted rsvp-help">{{ helpText }}</p>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";

const props = defineProps({
  title: { type: String, default: "RSVP" },
  lead: { type: String, default: "" },
  deadlineText: { type: String, default: "" },
  submitUrl: { type: String, default: "" },
  helpText: { type: String, default: "" },
  closed: { type: Boolean, default: false },
  closedHeading: { type: String, default: "RSVPs are closed" },
  closedMessage: { type: String, default: "" },
  closedCtaLabel: { type: String, default: "" },
  closedCtaHref: { type: String, default: "#contact" },
});

const form = reactive({
  name: "",
  attending: "",
  partySize: 1,
  kidsUnder5: 0,
  kids6to10: 0,
  dietary: "",
  email: "",
  phone: "",
  comments: "",
});

const submitting = ref(false);
const submitted = ref(false);
const error = ref("");
const shaking = ref(false);

const isAccepting = computed(() => form.attending === "accepts");
const showKidsFields = computed(() => isAccepting.value && Number(form.partySize) > 1);

function autoGrow(e) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// ── Validation helpers ─────────────────────────────────────────────

function isValidEmail(email) {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return normalizePhone(phone) !== null;
}

function normalizePhone(phone) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  const normalized = digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;

  if (normalized.length !== 10) return null;

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

function toWholeNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) ? num : null;
}

function triggerShake() {
  shaking.value = true;
  setTimeout(() => { shaking.value = false; }, 400);
}

// ── Submit ─────────────────────────────────────────────────────────

async function onSubmit() {
  error.value = "";

  // Required: name
  if (!form.name.trim()) {
    error.value = "Please enter your name.";
    triggerShake();
    return;
  }

  // Required: attending choice
  if (!form.attending) {
    error.value = "Please select whether you'll be attending.";
    triggerShake();
    return;
  }

  // Accept-path validation
  if (isAccepting.value) {
    const partySize = toWholeNumber(form.partySize);
    if (!partySize || partySize < 1) {
      error.value = "Please enter your party size.";
      triggerShake();
      return;
    }

    if (partySize > 1) {
      const kidsUnder5 = toWholeNumber(form.kidsUnder5);
      const kids6to10 = toWholeNumber(form.kids6to10);

      if (kidsUnder5 === null || kidsUnder5 < 0) {
        error.value = "Please enter the number of kids 5 & under (enter 0 if none).";
        triggerShake();
        return;
      }
      if (kids6to10 === null || kids6to10 < 0) {
        error.value = "Please enter the number of kids 6–10 (enter 0 if none).";
        triggerShake();
        return;
      }
    }

    if (!isValidEmail(form.email.trim())) {
      error.value = "Please enter a valid email address.";
      triggerShake();
      return;
    }

    if (!isValidPhone(form.phone)) {
      error.value = "Please enter a valid 10-digit phone number.";
      triggerShake();
      return;
    }
  }

  if (!props.submitUrl) {
    error.value = "RSVP submission is not configured yet. Please contact us directly.";
    triggerShake();
    return;
  }

  submitting.value = true;

  try {
    const partySize = toWholeNumber(form.partySize) || 0;
    const kidsUnder5 = toWholeNumber(form.kidsUnder5) || 0;
    const kids6to10 = toWholeNumber(form.kids6to10) || 0;
    const normalizedPhone = normalizePhone(form.phone);
    const payload = {
      timestamp: new Date().toISOString(),
      name: form.name.trim(),
      attending: form.attending,
      partySize: isAccepting.value ? partySize : 0,
      kidsUnder5: isAccepting.value && partySize > 1 ? kidsUnder5 : 0,
      kids6to10: isAccepting.value && partySize > 1 ? kids6to10 : 0,
      dietary: isAccepting.value ? form.dietary.trim() : "",
      email: isAccepting.value ? form.email.trim() : "",
      phone: isAccepting.value ? normalizedPhone || "" : "",
      comments: form.comments.trim(),
    };

    await fetch(props.submitUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });

    submitted.value = true;
  } catch {
    error.value = "Something went wrong. Please try again or contact us directly.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.rsvp-card {
  padding: 1.5rem;
}

/* ── Form groups ────────────────────────────────────── */

.form-group {
  margin-bottom: 1rem;
}

.choice-fieldset {
  border: 0;
  margin: 0 0 1rem;
  padding: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 650;
  font-size: 0.92rem;
  color: var(--ink);
}

.req {
  color: #b44040;
}

.form-input {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  font-size: 0.95rem;
  color: var(--ink);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.form-input--narrow {
  max-width: 140px;
}

.form-input:focus {
  outline: none;
  border-color: rgba(123, 143, 122, 0.55);
  box-shadow: 0 0 0 3px rgba(123, 143, 122, 0.12);
}

.form-input::placeholder {
  color: rgba(51, 55, 51, 0.4);
}

.form-textarea {
  resize: vertical;
  min-height: 72px;
}

.choice-list {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 860px) {
  .choice-list {
    flex-direction: column;
  }
}

.choice-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

.choice-card:hover {
  border-color: rgba(123, 143, 122, 0.4);
}

.choice-card--active {
  background: linear-gradient(145deg, rgba(123, 143, 122, 0.9), rgba(123, 143, 122, 0.72));
  color: white;
  border-color: rgba(123, 143, 122, 0.38);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.choice-card__input {
  margin: 0;
  inline-size: 1.05rem;
  block-size: 1.05rem;
  accent-color: rgba(123, 143, 122, 0.95);
}

.choice-card__label {
  font-weight: 650;
  font-size: 0.95rem;
}

.detail-block {
  margin-bottom: 1rem;
}

.detail-block--sub {
  padding-left: 0.35rem;
  border-left: 2px solid rgba(123, 143, 122, 0.18);
}

.form-label--sub {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}

/* ── Dividers ───────────────────────────────────────── */

.form-divider {
  border: none;
  border-top: 1px solid var(--line);
  margin: 0.75rem 0 1rem;
}

/* ── Contact info heading ───────────────────────────── */

.contact-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.25rem;
}

.contact-desc {
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
}

/* ── Submit button ──────────────────────────────────── */

.submit-btn {
  min-width: min(240px, 100%);
  gap: 0.4rem;
  box-shadow: none;
}

.submit-arrow {
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
}

.form-deadline {
  margin-bottom: 1rem;
  font-size: 0.88rem;
}

.form-error {
  min-height: 1.4em;
  margin-top: 0.5rem;
  margin-bottom: 0;
  color: #b44040;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 200ms ease;
}

.form-error--visible {
  opacity: 1;
}

/* ── Shake animation ────────────────────────────────── */

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%      { transform: translateX(-6px); }
  30%      { transform: translateX(5px); }
  45%      { transform: translateX(-4px); }
  60%      { transform: translateX(3px); }
  75%      { transform: translateX(-2px); }
}

.is-shaking {
  animation: shake 400ms ease;
}

/* ── Success ────────────────────────────────────────── */

.rsvp-success {
  text-align: center;
  padding: 2rem 1rem;
}

.rsvp-success .h3 {
  font-size: 1.3rem;
  color: var(--sage);
}

.rsvp-help {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.88rem;
}

/* ── Closed state ───────────────────────────────────── */

.rsvp-closed-card {
  text-align: center;
  padding: 2.25rem 1.5rem;
}

.rsvp-closed__icon {
  color: var(--sage);
  display: inline-flex;
  margin-bottom: 0.75rem;
  opacity: 0.85;
}

.rsvp-closed__icon svg {
  width: 44px;
  height: 44px;
}

.rsvp-closed__heading {
  font-size: 1.25rem;
  color: var(--sage);
  margin: 0 0 0.6rem;
}

.rsvp-closed__message {
  color: var(--muted);
  max-width: 46ch;
  margin: 0 auto 1.25rem;
  line-height: 1.55;
}

.rsvp-closed__cta {
  min-width: min(220px, 100%);
}
</style>
