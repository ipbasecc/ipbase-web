<template>
    <TutoriaDetial v-bind="$attrs" v-if="activeCard?.type === 'classroom'" :activeCard />
    <ResourcePage v-else-if="activeCard?.type === 'resource'" :card_id="activeCard.id" class="absolute-full">
        <template #backbtn>
            <q-item-section top avatar>
                <q-btn flat round icon="mdi-arrow-left" @click="$emit('close')" />
            </q-item-section>
        </template>
    </ResourcePage>
</template>
<script setup>
import TutoriaDetial from './TutoriaDetial.vue'
import ResourcePage from '../card/ResourcePage.vue'

const {activeCard} = defineProps(['activeCard']);
</script>
