<template>
  <div class="q-pa-xs radius-xs border q-space font-small">
    <q-icon size="xs" name="event" />
    {{ $t('end') }} ：{{ date.formatDate(end, "MM/DD") }}
    <q-popup-proxy v-if="auth">
      <q-date
        v-model="end"
        minimal
        bordered
        @update:model-value="updateVersionFn"
        mask="YYYY-MM-DD"
        :options="(date) => date >= quasarDate(current_versionRef?.start)"
      />
    </q-popup-proxy>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect, inject } from "vue";

import { date } from "quasar";

const props = defineProps({
  current_version: {
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
const current_versionRef = toRef(props, "current_version");
const wasAttached_toRef = toRef(props, "wasAttached_to");
const authBase = inject("authBase");

const end = ref(current_versionRef.value?.end);
watchEffect(() => {
  end.value = current_versionRef.value?.end;
});

function quasarDate(val) {
  return date.formatDate(val, "YYYY/MM/DD");
}

const emit = defineEmits(["endChanged"]);
const updateVersionFn = async () => {
  if (end.value === current_versionRef.value?.end) return;

  emit("endChanged", end.value);
};
</script>
