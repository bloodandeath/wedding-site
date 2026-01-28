import { computed, onMounted, onUnmounted, ref } from "vue";

export function useCountdown(weddingDateISO) {
    const targetMs = new Date(weddingDateISO).getTime();
    const nowMs = ref(Date.now());
    let timerId;

    onMounted(() => {
        timerId = window.setInterval(() => {
            nowMs.value = Date.now();
        }, 1000);
    });

    onUnmounted(() => {
        if (timerId) window.clearInterval(timerId);
    });

    const countdown = computed(() => {
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
