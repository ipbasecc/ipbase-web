<template>
  <iframe
    :src="`https://view.officeapps.live.com/op/embed.aspx?src=${srcRef}`"
    width="100%"
    height="100%"
    frameborder="0"
  ></iframe>
</template>

<script setup>
import { toRef } from "vue";
const props = defineProps({
  src: {
    type: String,
    default: "",
  },
});
const srcRef = toRef(props, "src");
</script>
