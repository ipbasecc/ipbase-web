<template>
  <span>{{ _time }}</span>
</template>

<script setup>
import { format } from "timeago.js";
import { computed, toRefs } from "vue";
const props = defineProps({
  time: {
    type: [Number, String],
    default: NaN,
    require: true,
  },
});
const { time } = toRefs(props);
const _time = computed(() => format(time.value, "zh_CN"));
</script>
