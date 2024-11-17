<template>
    <ClassPage v-if="teamStore.card" :card="teamStore.card" />
</template>

<script setup>
import ClassPage from '../card/ClassPage.vue'
import { teamStore } from 'src/hooks/global/useStore';

</script>