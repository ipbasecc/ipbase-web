import { ref } from 'vue';

const logging = ref(false);
export function useMinistore() {
  return {
    logging
  }
}