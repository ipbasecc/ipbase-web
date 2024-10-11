<template>
    <NavigatorContainer>
        <RouterView v-if="notebook_id" />
        <div v-else class="absolute-full flex flex-center">
            <BgBrand />
        </div>
    </NavigatorContainer>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavigatorContainer from '../NavigatorContainer.vue'
import BgBrand from 'src/components/VIewComponents/BgBrand.vue'

const route = useRoute();
const notebook_id = computed(() => route.params.notebook_id)
</script>

<style scoped>
</style>