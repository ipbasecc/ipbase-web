<template>
    <q-list class="q-pa-sm column no-wrap fit">
        <q-item clickable v-ripple
            v-for="item in menu" :key="item.name"
            :class="`${
                uiStore.deal_active_item === item.name
                ? 'border active-listitem'
                : 'border-placeholder op-7'
            }`"
            class="radius-xs text-white"
            :style="`width: ${uiStore.navDrawerWidth - 16}px;`"
            @click="enter(item)"
        >
            <q-item-section>
                <q-item-label>{{ $t(`deal_${item.name}`) }}</q-item-label>
            </q-item-section>
        </q-item>
        <q-space />
        <q-item clickable v-ripple class="border bg-primary text-white radius-xs" @click="createDeal">
            <q-item-section class="text-center">发布需求</q-item-section>
        </q-item>
    </q-list>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { uiStore } from 'src/hooks/global/useStore';

const router = useRouter();

const enter = (item) => {
    uiStore.deal_active_item = item.name;
    router.push(item.path);
}
const createDeal = () => {
    uiStore.deal_active_item = 'create_deal';
    router.push('/deliver/create');
}

const menu = [
    {
        name: 'party_a_list',
        icon: 'print',
        path: '/deliver/party_a',
    },
    {
        name: 'party_b_list',
        icon: 'print',
        path: '/deliver/party_b',
    },
    {
        name: 'my_party_a_list',
        icon: 'print',
        path: '/deliver/party_a',
    },
    {
        name: 'my_party_b_list',
        icon: 'print',
        path: '/deliver/party_b',
    }
]

</script>