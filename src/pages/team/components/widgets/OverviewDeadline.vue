<template>
  <div class="q-pa-xs radius-xs border q-space font-small">
    <q-icon size="xs" name="mdi-calendar-clock" />
    {{ $t('examine') }}：{{ date.formatDate(deadline, "MM/DD - HH:mm") }}
    <q-popup-proxy v-if="auth">
      <q-date
        v-model="deadline"
        minimal
        bordered
        mask="YYYY-MM-DDTHH:mm:ss.SSSZ"
        :options="(date) => date >= quasarDate(activeVersion?.end)"
      />
      <q-time
        v-model="deadline"
        mask="YYYY-MM-DDTHH:mm:ss.SSSZ"
        @update:model-value="updateVersionFn"
      />
    </q-popup-proxy>
  </div>
</template>

<script setup>
import { ref, toRefs, watchEffect } from "vue";

import { date } from "quasar";

function quasarDate(val) {
  return date.formatDate(val, "YYYY/MM/DD");
}

const props = defineProps({
  activeVersion: {
    type: Object,
    default() {
      return {};
    },
  },
  wasAttached_to: {
    type: String,
    default: "project",
  },
  auth: {
    type: Boolean,
    default: false,
  },
});
const {activeVersion} = toRefs(props);
const deadline = ref(activeVersion.value?.deadline);
watchEffect(() => {
  deadline.value = activeVersion.value?.deadline;
});

const emit = defineEmits(["deadlineChanged"]);
const updateVersionFn = async () => {
  if (deadline.value === activeVersion.value?.deadline) return;

  emit("deadlineChanged", deadline.value);
};
</script>
