<template>
    <q-img v-if="url && type === 'image'"
        :src="url"
        :ratio="ratio"
        spinner-color="primary"
        spinner-size="82px"
        :class="contentClass"
    />
    <q-responsive v-if="url && type === 'video'" :ratio="ratio" class="full-width">
        <Artplayer ref="artPlayerRef" :key="url"
            :option="{
                url: url,
                ...player_options
            }"
            :class="contentClass"
        />
    </q-responsive>
</template>
<script setup>
import { computed } from 'vue';
import { mediaType } from 'src/hooks/utilits';
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";

const { url, ratio = 16/9, contentClass, fullscreen = true, fullscreenWeb = true } = defineProps(['url', 'ratio', 'contentClass', 'fullscreen', 'fullscreenWeb']);
const type = computed(() => {
    return mediaType(url)
})

const player_options = {
    muted: false,
    autoplay: false,
    loop: false,
    mutex: true,
    fullscreen: fullscreen,
    fullscreenWeb: fullscreenWeb,
}

</script>