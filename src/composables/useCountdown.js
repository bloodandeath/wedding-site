import { computed, onMounted, onUnmounted, ref } from "vue";

function normalizeIso(iso) {
    if (!iso || typeof iso !== "string") return "";

    // Fix common offset typo: -4:00 -> -04:00, +4:00 -> +04:00
    // (also handles -5:00, etc.)
    const fixed = iso.replace(/([+-])(\d):(\d\d)$/, (_, sign, h, mm) => `${sign}0${h}:${mm}`);

    return fixed;
}

function parseTargetMs(iso) {
    const s = normalizeIso(iso);

    // Try native parse first
    const ms = Date.parse(s);
    if (Number.isFinite(ms)) return ms;

    // Fallback: try without timezone (treat as local)
    // e.g. "2026-05-23T11:00:00"
    const noTz = s.replace(/([+-]\d\d:\d\d|Z)$/, "");
    const ms2 = Date.parse(noTz);
    if (Number.isFinite(ms2)) return ms2;

    return NaN;
}

export function useCountdown(weddingDateISO) {
    const targetMs = parseTargetMs(weddingDateISO);
    const nowMs = ref(Date.now());
    let timerId = null;

    onMounted(() => {
        timerId = window.setInterval(() => {
            nowMs.value = Date.now();
        }, 1000);
    });

    onUnmounted(() => {
        if (timerId) window.clearInterval(timerId);
    });

    const countdown = computed(() => {
        if (!Number.isFinite(targetMs)) {
            return { days: "0", hours: "00", minutes: "00", seconds: "00" };
        }

        const diff = Math.max(0, targetMs - nowMs.value);
        const totalSeconds = Math.floor(diff / 1000);

        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        const pad2 = (n) => String(n).padStart(2, "0");

        return {
            days: String(days),
            hours: pad2(hours),
            minutes: pad2(minutes),
            seconds: pad2(seconds),
        };
    });

    return { countdown };
}
