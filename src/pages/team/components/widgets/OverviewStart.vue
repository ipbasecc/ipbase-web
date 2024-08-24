<template>
  <div class="q-pa-xs radius-xs border q-space font-small">
    <q-icon size="xs" name="event" />
    {{ $t('start') }} ：{{ start }}
    <q-popup-proxy v-if="auth">
      <q-date
        v-model="start"
        minimal
        bordered
        @update:model-value="updateVersionFn"
        mask="YYYY-MM-DD"
      />
    </q-popup-proxy>
  </div>
</template>

<script setup>
import { ref, toRef, watchEffect } from "vue";

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
const start = ref(current_versionRef.value?.start);

watchEffect(() => {
  start.value = current_versionRef.value?.start;
});

const emit = defineEmits(["startChanged"]);
const updateVersionFn = async () => {
  if (start.value === current_versionRef.value?.start) return;

  emit("startChanged", start.value);
};
</script>
