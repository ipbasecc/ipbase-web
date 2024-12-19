<template>
    <q-list class="q-pa-sm column no-wrap gap-xs fit">
        <template v-for="item in menu" :key="item.name">
            <div v-if="item.type === 'divider'" class="op-5 border-bottom q-my-xs" />
            <q-item v-else clickable v-ripple
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
        </template>
    </q-list>
</template>
<script setup>
import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { uiStore } from 'src/hooks/global/useStore';

const router = useRouter();

const enter = (item) => {
    uiStore.deal_active_item = item.name;
    router.push(item.path);
}

const menu = [
    {
        name: 'homepage',
        icon: 'print',
        path: '/deliver',
    },
    {
        type: 'divider',
    },
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
        type: 'divider',
    },
    {
        name: 'my_party_a_list',
        icon: 'print',
        path: '/deliver/party_a',
    },
    {
        name: 'my_party_b_list',
        icon: 'print',
        path: '/deliver/party_a',
    }
]
watchEffect(() => {
    if(!uiStore.deal_active_item) {
        uiStore.deal_active_item = 'homepage';
    }
})

</script>