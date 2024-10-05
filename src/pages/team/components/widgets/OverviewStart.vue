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
import { ref, toRefs, watchEffect } from "vue";

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
const { activeVersion } = toRefs(props);
const start = ref(activeVersion.value?.start);

watchEffect(() => {
  start.value = activeVersion.value?.start;
});

const emit = defineEmits(["startChanged"]);
const updateVersionFn = async () => {
  if (start.value === activeVersion.value?.start) return;

  emit("startChanged", start.value);
};
</script>
