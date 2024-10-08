import { computed } from "vue";
import { useQuasar } from "quasar";
const $q = useQuasar();
const isElectron = computed(() => $q.platform.is.electron);
export function logout() {
    if (isElectron.value) {
      window.windowAPI?.logout();
    }
  }