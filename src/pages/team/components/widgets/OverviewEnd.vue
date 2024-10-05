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
        :options="(date) => date >= quasarDate(activeVersion?.start)"
      />
    </q-popup-proxy>
  </div>
</template>

<script setup>
import { ref, toRefs, watchEffect } from "vue";

import { date } from "quasar";

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

const end = ref(activeVersion.value?.end);
watchEffect(() => {
  end.value = activeVersion.value?.end;
});

function quasarDate(val) {
  return date.formatDate(val, "YYYY/MM/DD");
}

const emit = defineEmits(["endChanged"]);
const updateVersionFn = async () => {
  if (end.value === activeVersion.value?.end) return;

  emit("endChanged", end.value);
};
</script>
