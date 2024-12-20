<template>
    <q-scroll-area class="absolute-full q-pa-sm">
        <DealTable v-if="completed_deals && partner_info && platform" :deals="completed_deals" :pageInfo :platform :partner_info @filterBy="filterBy" />
    </q-scroll-area>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { findCompletedDeals } from 'src/api/strapi';
import DealTable from 'src/components/business/DealTable.vue'

const completed_deals = ref([]);

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);
const partner_info = ref();
const platform = ref();
const pageInfo = computed(() => {
    return {
        page: page.value,
        per_page: limit.value,
        count: completed_deals.value.length
    }
})

const count = ref(0);
const filterStatus = ref('all');
const getCompletedDeals = async () => {
    const {data} = await findCompletedDeals({ offset: offset.value, limit: limit.value, filter: filterStatus.value });
    console.log('data', data);
    completed_deals.value = data.deals;
    count.value = data.count;
    partner_info.value = data.partner_info;
    platform.value = data.platform;
}
const filterBy = (filter) => {
    filterStatus.value = filter;
    getCompletedDeals();
}

onMounted(async () => {
    await getCompletedDeals();
})
</script>