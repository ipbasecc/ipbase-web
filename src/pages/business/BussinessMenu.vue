<template>
    <q-list class="q-pa-xs column gap-xs">
        <q-item v-for="i in menu" :key="i.name"
            clickable v-ripple class="radius-xs"
            :class="[actived_item_name, route.path].includes(i.route) ? 'bg-primary' : ''"
            @click="i.handler(i)"
        >
            <q-item-section side>
                <q-icon :name="i.icon" color="white" />
            </q-item-section>
            <q-item-section>{{ $t(i.name) }}</q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import {ref} from 'vue'
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
const actived_item_name = ref();
const menu = [
    {
        name: 'business_overview',
        icon: 'mdi-chart-areaspline',
        route: '/business/main',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push(i.route)
        }
    },
    {
        name: 'deal_page',
        icon: 'handshake',
        route: '/business/deal',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push(i.route)
        }
    },
    {
        name: 'business_account_info',
        icon: 'mdi-account-card-details',
        route: '/business/info',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push(i.route)
        }
    },
    {
        name: 'business_certificate_info',
        icon: 'mdi-certificate',
        route: '/business/certificate',
        handler: (i) => {
            actived_item_name.value = i.name
            router.push(i.route)
        }
    }
]
</script>