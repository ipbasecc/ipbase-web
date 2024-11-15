<template>
    <NavigatorContainer>
        <div class="absolute-full q-pa-sm">
            <SaleCards />
            <SaleTable v-if="sales" :sales :pageInfo />
        </div>
    </NavigatorContainer>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {findSales} from 'src/api/strapi/project.js'

import NavigatorContainer from '../team/NavigatorContainer.vue'
import SaleTable from 'src/components/business/SaleTable.vue'
import SaleCards from 'src/components/business/SaleCards.vue'

const page = ref(1);
const limit = ref(20);
const offset = computed(() => (page.value - 1) * limit.value);

const sales = ref([]);
const getSales = async() => {
    const { data } = await findSales(offset.value,limit.value);
    if(data) {
        sales.value = data
    }
}
const pageInfo = computed(() => {
    return {
        page: page.value,
        per_page: limit.value,
        count: sales.value.length
    }
})

onMounted(async() => {
    await getSales();
})
</script>