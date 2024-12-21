<template>
    <q-card v-if="_party" bordered class="fit column" :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
        <div class="absolute-full bg-image-fill op-2"
            :style="_party.profile?.cover?.url ? `background-image: url(${_party.profile?.cover?.url})` : ''"
        ></div>
        <q-card-section class="row flex-center q-space">
            <q-avatar size="100px">
                <q-img
                    :src="_party.profile?.avatar?.url"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="82px"
                />
            </q-avatar>
        </q-card-section>
        <q-card-section class="column flex-center cursor-pointer" @click="goToStudio">
            <div class="text-h6">{{ _party.username }}</div>
            <div class="text-subtitle2">{{ _party.profile?.title }}</div>
        </q-card-section>
        <slot />
    </q-card>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { teamStore } from 'src/hooks/global/useStore';
const { party } = defineProps(['party'])
const _party = computed(() => teamStore.init?.id === party?.id ? teamStore.init : party)
const router = useRouter()
const goToStudio = () => {
    router.push(`/studio/${party.id}/works`)
}
</script>