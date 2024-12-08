<template>
    <NavigatorContainer>
        <RouterView v-if="discoverStore.actived" :activeCard="discoverStore.actived" @close="close" style="margin: 0 auto;" />
        <q-scroll-area v-else :key="discoverStore.list" class="absolute-full">
            <q-resize-observer @resize="onResize" />
            <CardsList v-if="discoverStore.list === 'home'" :bodySize @enterCardDetail="enterCardDetail" />
            <PurchasedList v-if="discoverStore.list === 'purchased'" :bodySize @enterCardDetail="enterCardDetail" />
            <FavoriteList v-if="discoverStore.list === 'favorite'" :bodySize @enterCardDetail="enterCardDetail" />
            <LikedList v-if="discoverStore.list === 'liked'" :bodySize @enterCardDetail="enterCardDetail" />
        </q-scroll-area>
    </NavigatorContainer>
</template>
<script setup>
import { ref } from 'vue'
import NavigatorContainer from '../NavigatorContainer.vue'
import CardsList from './CardsList.vue'
import { useRouter } from 'vue-router'
import { discoverStore } from 'src/hooks/global/useStore.js'
import PurchasedList from './my/PurchasedList.vue'
import FavoriteList from './my/FavoriteList.vue'
import LikedList from './my/LikedList.vue'

const router = useRouter()
const enterCardDetail = (card) => {
    discoverStore.actived = card
}

const close = () => {
    discoverStore.actived = null
    router.push('/discover')
}

const bodySize = ref({
    width: 0,
    height: 0
})
const onResize = (size) => {
    bodySize.value = size
}
</script>