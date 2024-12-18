<template>
    <div class="column no-wrap gap-sm q-px-lg">
        <div class="row items-center q-pt-sm">
            <span>待对接</span>
            <q-space />
            <q-btn dense padding="xs md" flat color="primary" label="查看全部" @click="router.push('/deliver/party_a')" />
        </div>
        <div class="grid grid-3 grid-gap-sm">
            <template v-for="i in deals" :key=i.id>
                <PartyaCard :deal="i" />
            </template>
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import PartyaCard from './PartyaCard.vue'
const router = useRouter()
const { deals } = defineProps(['deals'])

</script>