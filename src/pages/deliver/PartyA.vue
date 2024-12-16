<template>
    <div class="column no-wrap gap-sm">
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { findDeals } from 'src/api/strapi'

const router = useRouter()
const deals = ref([])
const offset = ref(0)
const limit = ref(10)
const sort = ref('desc')
const findDealsFn = async () => {
    const res = await findDeals(offset.value, limit.value, sort.value)
    deals.value = res.data
}
const findMore = async () => {
    offset.value += limit.value;
    await findDealsFn();
}
onMounted(async () => {
    await findDealsFn();
})

</script>