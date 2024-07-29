<template>
  <div class="column no-wrap">
    <div id="timeline" ref="timeline" />
    <!-- 音频容器 -->
    <div id="waveform" ref="waveform"  />
    <!-- <q-spinner-orbit v-if="isLoading" color="blue" /> -->
    <div class="row no-wrap gap-sm items-center border-top q-pt-lg q-pb-sm q-mt-md">
        <div class="col-4 row no-wrap items-center gap-xs q-pr-xl">
            <q-btn
                flat dense round
                :icon="ismuted ? 'mdi-volume-off' : volume > 6 ? 'mdi-volume-high' : volume < 3 ? 'mdi-volume-low' : 'mdi-volume-medium'"
                @click="toggleMute()" />
            <q-slider
                v-model="volume"
                :min="0"
                :max="10"
                label
                dense
                @change="setVolume()"
            />
        </div>
      <q-space />
      <q-btn
        round
        dense
        color="primary"
        icon="mdi-rewind"
        @click="jump(-5)"
      />
      <q-btn
        round
        size="lg"
        color="primary"
        :icon="!play ? 'mdi-play' : 'mdi-pause'"
        @click="togglePlay()"
      />
      <q-btn
        round
        dense
        color="primary"
        icon="mdi-fast-forward"
        @click="jump(5)"
      />
      <q-space />
      <div class="row no-wrap gap-xs items-center col-4">
        <q-space />
        <q-btn round size="xs" flat icon="mdi-minus" @click="setSpeed(-1);" />
        <q-btn dense flat :label="`${$t('speed')}：${speed / 10}`" @click="resetSpeed()" style="width: 6rem;" />
        <q-btn round size="xs" flat icon="mdi-plus" @click="setSpeed(1);" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, toRef } from "vue";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js"; //Timeline插件
// import Regions from "wavesurfer.js/plugins/regions";

const props = defineProps({
    src: {
        type: String,
        default: "",
    },
    item: {
        type: Object,
        default () {
            return {}
        },
    }
});
const srcRef = toRef(props, "src");
const waveform = ref();
const timeline = ref();
const speed = ref(10);
const volume = ref(5);
const ismuted = ref(false);
const isLoading = ref(true);
let wavesurfer;
onMounted(() => {
  wavesurfer = WaveSurfer.create({
    container: "#waveform",
    audioRate: speed.value / 10, //控制播放速度
    url: srcRef.value,
    height: 128,
    splitChannels: false,
    normalize: false,
    waveColor: "#a3c9ff",
    progressColor: "#0058d9",
    cursorColor: "#002252",
    cursorWidth: 2,
    barWidth: null,
    barGap: null,
    barRadius: null,
    barHeight: null,
    barAlign: "",
    minPxPerSec: 1,
    fillParent: true,
    autoplay: false,
    interact: true,
    hideScrollbar: false,
    audioRate: 1,
    autoScroll: true,
    autoCenter: true,
    sampleRate: 8000,
    muted: ismuted.value,
  });

  // Initialize the Timeline plugin
  wavesurfer.setVolume(volume.value / 10);
  wavesurfer.registerPlugin(Timeline.create());
  wavesurfer.on('finish', function () {
    togglePlay();
  });
  wavesurfer.on('load', function () {
    isLoading.value = false;
  });
});
const play = ref(false);
const togglePlay = () => {
  play.value = !play.value;
  if (play.value) {
    wavesurfer.play();
  } else {
    wavesurfer.pause();
  }
};
const toggleMute = () => {
    ismuted.value = !ismuted.value
    wavesurfer.setMuted(ismuted.value);
}
const setSpeed = (val) => {
    speed.value = speed.value + val;
    wavesurfer.setPlaybackRate(speed.value / 10);
}
const resetSpeed = (val) => {
    speed.value = 10;
    wavesurfer.setPlaybackRate(speed.value / 10);
}
const jump = (val) => {
    const currentTime = wavesurfer.getCurrentTime();
    wavesurfer.setTime(currentTime + val);
}
const setVolume = () => {
  wavesurfer.setVolume(volume.value / 10);
}


</script>
