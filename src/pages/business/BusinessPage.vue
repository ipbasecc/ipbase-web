<template>
    <div class="absolute-full q-pa-sm">
        <SaleCards />
        <SaleTable v-if="filteredSales && partner_info && platform" :sales="filteredSales" :pageInfo :partner_info :platform @filterBy="filterBy" />
    </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {findSales} from 'src/api/strapi/project.js'

import SaleTable from 'src/components/business/SaleTable.vue'
import SaleCards from 'src/components/business/SaleCards.vue'

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);

const sales = ref([]);
const partner_info = ref({});
const platform = ref({});
const getSales = async() => {
    const { data } = await findSales(offset.value,limit.value);
    if(data) {
        sales.value = data.orders
        partner_info.value = data.partner_info
        platform.value = data.platform
    }
}
const pageInfo = computed(() => {
    return {
        page: page.value,
        per_page: limit.value,
        count: sales.value.length
    }
})

const filteredSales = ref();
const filterSales = (filter) => {
    if(filter === 'can_withdraw') {
        filteredSales.value = sales.value.filter(sale => !sale.order_transfer)
    } else {
        filteredSales.value = sales.value
    }
}
const filterBy = (filter) => {
    filterSales(filter)
}

onMounted(async() => {
    await getSales();
    filterSales('all')
})
</script>