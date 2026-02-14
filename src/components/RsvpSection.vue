<template>
  <section class="section section--alt" id="rsvp">
    <div class="container">
      <h2 class="h2">{{ title }}</h2>
      <p v-if="lead" class="lead">{{ lead }}</p>

      <article class="card rsvp-card">
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

          <!-- Attending toggle -->
          <div class="form-group">
            <label class="form-label">Will you be attending? <span class="req">*</span></label>
            <div class="toggle-group">
              <button
                  type="button"
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': form.attending === 'accepts' }"
                  @click="setAttending('accepts')"
              >
                Joyfully accept
              </button>
              <button
                  type="button"
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': form.attending === 'declines' }"
                  @click="setAttending('declines')"
              >
                Regretfully decline
              </button>
            </div>
          </div>

          <!-- ═══ Accept path ═══ -->
          <div class="form-section" :class="{ 'form-section--open': form.attending === 'accepts' }">
            <div class="form-section__inner">

              <hr class="form-divider" />

              <!-- Party size -->
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
                />
              </div>

              <!-- Kids fields (shown if party > 1) -->
              <div class="form-section" :class="{ 'form-section--open': form.partySize > 1 }">
                <div class="form-section__inner">
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
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label form-label--sub" for="rsvp-kids-6to10">
                      Number of kids 6–10: <span class="req">*</span>
                    </label>
                    <input
                        id="rsvp-kids-6to10"
                        v-model.number="form.kids6to10"
                        type="number"
                        class="form-input form-input--narrow"
                        min="0"
                        max="20"
                    />
                  </div>
                </div>
              </div>

              <!-- Dietary -->
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

              <!-- Contact info -->
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
                    :value="form.phone"
                    @input="onPhoneInput"
                    type="tel"
                    class="form-input"
                    autocomplete="tel"
                    placeholder="(123) 456-7890"
                />
              </div>
            </div>
          </div>

          <!-- ═══ Comments (shown for BOTH accept and decline) ═══ -->
          <div class="form-section" :class="{ 'form-section--open': form.attending !== '' }">
            <div class="form-section__inner">
              <hr class="form-divider" />

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
            </div>
          </div>
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

      <p v-if="helpText" class="text muted rsvp-help">{{ helpText }}</p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";

const props = defineProps({
  title: { type: String, default: "RSVP" },
  lead: { type: String, default: "" },
  deadlineText: { type: String, default: "" },
  submitUrl: { type: String, default: "" },
  helpText: { type: String, default: "" },
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

function setAttending(value) {
  form.attending = value;
}

function autoGrow(e) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// ── Phone auto-format ──────────────────────────────────────────────

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function onPhoneInput(e) {
  const input = e.target;
  const raw = input.value;
  const formatted = formatPhone(raw);
  form.phone = formatted;

  // Keep cursor from jumping to end
  const digitsBeforeCursor = raw.slice(0, input.selectionStart).replace(/\D/g, "").length;
  // Find where that digit count lands in the formatted string
  let digitsSeen = 0;
  let cursorPos = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) digitsSeen++;
    if (digitsSeen >= digitsBeforeCursor) {
      cursorPos = i + 1;
      break;
    }
  }
  if (digitsBeforeCursor === 0) cursorPos = formatted.length;

  requestAnimationFrame(() => {
    input.value = formatted;
    input.setSelectionRange(cursorPos, cursorPos);
  });
}

// ── Validation helpers ─────────────────────────────────────────────

function isValidEmail(email) {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true; // optional
  return phone.replace(/\D/g, "").length === 10;
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
  if (form.attending === "accepts") {
    if (!form.partySize || form.partySize < 1) {
      error.value = "Please enter your party size.";
      triggerShake();
      return;
    }

    if (form.partySize > 1) {
      if (typeof form.kidsUnder5 !== "number" || form.kidsUnder5 < 0) {
        error.value = "Please enter the number of kids 5 & under (enter 0 if none).";
        triggerShake();
        return;
      }
      if (typeof form.kids6to10 !== "number" || form.kids6to10 < 0) {
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
    const isAccepting = form.attending === "accepts";
    const payload = {
      timestamp: new Date().toISOString(),
      name: form.name.trim(),
      attending: form.attending,
      partySize: isAccepting ? form.partySize : 0,
      kidsUnder5: isAccepting && form.partySize > 1 ? form.kidsUnder5 : 0,
      kids6to10: isAccepting && form.partySize > 1 ? form.kids6to10 : 0,
      dietary: isAccepting ? form.dietary.trim() : "",
      email: isAccepting ? form.email.trim() : "",
      phone: isAccepting ? form.phone : "",
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

.form-label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 650;
  font-size: 0.92rem;
  color: var(--ink);
}

.form-label--sub {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
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
  resize: none;
  overflow: hidden;
  min-height: 72px;
}

/* ── Toggle buttons ─────────────────────────────────── */

.toggle-group {
  display: flex;
  gap: 0.75rem;
  padding: 0 0.5rem;
}

@media (max-width: 860px) {
  .toggle-group {
    flex-direction: column;
    padding: 0;
  }
}

.toggle-btn {
  flex: 1;
  padding: 0.7rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink);
  font-weight: 650;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

.toggle-btn:hover {
  border-color: rgba(123, 143, 122, 0.4);
}

.toggle-btn--active {
  background: linear-gradient(145deg, rgba(123, 143, 122, 0.9), rgba(123, 143, 122, 0.72));
  color: white;
  border-color: rgba(123, 143, 122, 0.38);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

/* ── Expand/collapse sections ───────────────────────── */

.form-section {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 420ms cubic-bezier(0.33, 1, 0.68, 1);
}

.form-section__inner {
  overflow: clip;
  min-height: 0;
  padding: 0 8px;
  opacity: 0;
  transition: opacity 350ms ease;
}

.form-section--open {
  grid-template-rows: 1fr;
}

.form-section--open .form-section__inner {
  opacity: 1;
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
  width: 50%;
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
</style>
