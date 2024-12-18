<template>
<q-card v-if="deal" bordered
    :flat="!$q.dark.mode" style="min-width: 22rem;"
>
    <q-img
        :src="deal.cover?.url || uiStore.no_image_url"
        :ratio="16/9"
        spinner-color="primary"
        spinner-size="82px"
        :class="deal.cover?.url ? '' : 'op-5'"
    >
    <div v-if="deal.description" class="absolute-bottom">
        <div class="text-subtitle2 cursor-pointer q-pa-md" @click="toDeal">{{ deal.description }}</div>
    </div>
    </q-img>
    <q-card-section class="cursor-pointer" >
        <div class="text-h6 cursor-pointer" @click="toDeal">{{ deal.name }}</div>
        <div v-if="deal.tags?.length > 0" class="row items-center">
            <q-chip v-for="(tag, index) in deal.tags" :key="index"
            square color="primary" :label="tag"
            :class="index === 0 ? 'q-ml-none' : index === deal.tags.length - 1 ? 'q-mr-none' : ''"
            />
        </div>
        <div class="row items-center">
            <span>￥：</span>
            <span class="text-h4">{{ deal.amount / 100 }}</span>
        </div>
    </q-card-section>
</q-card>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { uiStore } from 'src/hooks/global/useStore.js'

const router = useRouter()
const {deal} = defineProps(['deal'])
const toDeal = () => {
    router.push(`/deliver/deal/${deal.id}`)
}
</script>
