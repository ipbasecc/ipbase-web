<template>
  IntroductionVideo
  <Artplayer
    :option="{
      ...videoOption,
      url: url,
    }"
    class="fit"
  />
</template>
<script setup>
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";

const props = defineProps({
  videoOption: {
    type: Object,
    default() {
      return {
        muted: false,
        autoplay: false,
        loop: false,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
      };
    },
  },
});
const url = "";
</script>
