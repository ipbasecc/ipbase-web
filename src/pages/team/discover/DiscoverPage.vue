<template>
    <NavigatorContainer>
        <RouterView v-if="discoverStore.actived" :activeCard="discoverStore.actived" @close="close" />
        <q-scroll-area v-else :key="discoverStore.list" class="absolute-full">
            <CardsList v-if="discoverStore.list === 'home'" @enterCardDetail="enterCardDetail" />
            <TutorialList v-if="discoverStore.list === 'tutorial'" @enterCardDetail="enterCardDetail" />
            <FavoriteList v-if="discoverStore.list === 'favorite'" @enterCardDetail="enterCardDetail" />
            <LikedList v-if="discoverStore.list === 'liked'" @enterCardDetail="enterCardDetail" />
        </q-scroll-area>
    </NavigatorContainer>
</template>
<script setup>
import NavigatorContainer from '../NavigatorContainer.vue'
import CardsList from './CardsList.vue'
import { useRouter } from 'vue-router'
import { discoverStore } from 'src/hooks/global/useStore.js'
import TutorialList from './my/TutorialList.vue'
import FavoriteList from './my/FavoriteList.vue'
import LikedList from './my/LikedList.vue'

const router = useRouter()
const enterCardDetail = (card) => {
    discoverStore.actived = card
}

const close = () => {
    discoverStore.actived = null
    router.back()
}
</script>