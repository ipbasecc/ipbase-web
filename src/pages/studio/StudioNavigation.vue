<template>
    <q-list :dense="!$q.screen.gt.sm" class="q-pa-sm column gap-xs">
        <q-item v-for="item in menuItems" :key="item.val" clickable v-ripple
            :class="`${
                studioStore.nav === item.val
                ? 'border active-listitem'
                : 'border-placeholder op-7'
            }`"
            class="radius-xs"
            @click="nav(item)"
            :style="`width: ${uiStore.navDrawerWidth - 16}px;`"
        >
            <q-item-section avatar>
                <q-icon color="white" :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ $t(item.name) }}</q-item-section>
        </q-item>
    </q-list>
</template>
<script setup>
    import { ref } from 'vue';
    import {uiStore, studioStore} from "src/hooks/global/useStore.js";
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const menuItems = ref([
        {
            name: 'works',
            icon: 'mdi-folder',
            val: 'works',
            to: '/studio/works'
        },
        {
            name: 'cv',
            icon: 'mdi-account-card-details',
            val: 'cv',
            to: '/studio/cv'
        },
    ])
    const nav = (val) => {
        studioStore.nav = val.val;
        router.push(val.to);
    }
</script>