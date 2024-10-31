<template>
  <Artplayer
    :option="{
      ...videoOption,
      url: url,
    }"
    class="absolute-full"
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
const url = "https://blob.ipbase.cc/IPBase-Introduction.mp4";
</script>
