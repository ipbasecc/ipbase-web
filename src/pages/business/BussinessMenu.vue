<template>
    <q-list class="q-pa-xs">
        <q-item v-for="i in menu" :key="i.name"
            clickable v-ripple class="radius-xs"
            :class="actived_item_name === i.name ? 'bg-primary' : ''"
            @click="i.handler(i)"
        >
            <q-item-section side>
                <q-icon name="mdi-chart-areaspline" />
            </q-item-section>
            <q-item-section>{{ $t(i.name) }}</q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import {ref} from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter();
const actived_item_name = ref();
const menu = [
    {
        name: 'business_overview',
        icon: 'mdi-chart-areaspline',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push('/business/main')
        }
    },
    {
        name: 'business_account_info',
        icon: 'mdi-account-box',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push('/business/info')
        }
    }
]
</script>