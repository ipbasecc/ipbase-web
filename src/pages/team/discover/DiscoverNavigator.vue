<template>
    <div class="absolute-full" :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'">
        <q-list class="column no-wrap gap-xs q-pa-sm">
            <template v-for="i in menu" :key="i.value">
                <q-separator v-if="i.value === 'separator'" spaced class="op-5" />
                <q-item v-else
                    clickable v-ripple class="radius-xs"
                    :class="{'bg-primary text-white': active === i.value}"
                    @click="enter(i.value)"
                >
                    <q-item-section avatar>
                        <q-icon :name="i.icon" />
                    </q-item-section>
                    <q-item-section>{{ i.label }}</q-item-section>
                </q-item>
            </template>
        </q-list>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const menu = [
    {
        icon: 'mdi-home',
        label: '首页',
        value: 'home',
        to: '/discover'
    },
    {
        value: 'separator',
    }
]

const active = ref();
watch(active, (val) => {
    if(!val) {
        active.value = menu[0].value;
    }
},{immediate: true});

const enter = (val) => {
    active.value = val;
    router.push(menu.find(i => i.value === val).to);
}
</script>