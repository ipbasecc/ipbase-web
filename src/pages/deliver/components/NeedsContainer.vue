<template>
    <div class="column no-wrap gap-sm">
        <div class="row items-center q-px-md q-pt-sm">
            <span>待对接</span>
            <q-space />
            <q-btn dense padding="xs md" flat label="查看全部" @click="router.push('/deliver/party_a')" />
        </div>
        <div class="row gap-md q-px-md q-py-xs">
            <q-card v-for="i in deals" :key=i.id bordered
                :flat="!$q.dark.mode" style="width: 22rem;"
            >
                <q-card-section class="cursor-pointer" @click="router.push(`/deliver/deal/${i.id}`)">
                    <div class="text-h6">{{ i.name }}</div>
                    <div class="text-subtitle2">{{ i.description }}</div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const { deals } = defineProps(['deals'])

</script>