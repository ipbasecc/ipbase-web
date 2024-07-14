import { ref, onMounted, onUnmounted } from "vue";
import { date } from "quasar";

let timer = null;
const curTime = ref();

onMounted(() => {
  curTime.value = date.formatDate(Date.now(), "HH:mm");
});

onUnmounted(() => {
  clearInterval(timer);
});

export function getCurTime() {
  timer = setInterval(() => {
    curTime.value = date.formatDate(Date.now(), "HH:mm:ss");
  }, 1000);
  return curTime.value;
}
