<template>
    <NavigatorContainer>
        <RouterView v-if="activeCard" :activeCard @close="close" />
        <q-scroll-area v-else class="absolute-full">
            <CardsList @enterCardDetail="enterCardDetail" />
        </q-scroll-area>
    </NavigatorContainer>
</template>
<script setup>
import { ref } from 'vue'
import NavigatorContainer from '../NavigatorContainer.vue'
import CardsList from './CardsList.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCard = ref(null)
const enterCardDetail = (card) => {
    activeCard.value = card
}

const close = () => {
    activeCard.value = null
    router.back()
}

</script>