<template>
    <div>
        {{ orders }}
    </div>
</template>

<script setup>
import {ref,onMounted} from 'vue'
import { findOrders } from 'src/api/strapi.js'

const orders = ref([]);

onMounted(async () => {
    const res = await findOrders();
    if(res?.data){
        orders.value = res.data;
    }
})
</script>