<template>
    <div class="absolute-full" :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'">
        {{all_menu_items}}
        <q-list class="column no-wrap gap-xs q-pa-sm">
            <template v-for="i in menu" :key="i.value">
                <div v-if="i.value === 'separator'" class="border-bottom q-mt-lg"></div>
                <q-expansion-item v-else-if="i.value === 'category' && i.children?.length > 0"
                    default-opened dense expand-icon-class="no-padding op-5"
                    header-class="no-hover-style">
                    <template #header>
                        <span class="q-space op-5">{{ $t(i.label) }}</span>
                    </template>
                    <q-item v-for="j in i.children" :key="j.value" clickable v-ripple class="radius-xs"
                        :class="{ 'border active-listitem': active === j.value }" @click="enter(j)">
                        <q-item-section avatar>
                            <q-icon :name="j.icon" />
                        </q-item-section>
                        <q-item-section>{{ $t(j.label) }}</q-item-section>
                        <div v-if="active === j.value"
                            class="bg-primary absolute-left"
                            style="width: 3px"
                        ></div>
                    </q-item>
                </q-expansion-item>
                <q-item v-else clickable v-ripple class="radius-xs"
                    :class="{ 'border active-listitem': active === i.value }" @click="enter(i)">
                    <q-item-section avatar>
                        <q-icon :name="i.icon" />
                    </q-item-section>
                    <q-item-section>{{ $t(i.label) }}</q-item-section>
                    <div v-if="active === i.value"
                        class="bg-primary absolute-left"
                        style="width: 3px"
                    ></div>
                </q-item>
            </template>
        </q-list>
    </div>
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { discoverStore } from 'src/hooks/global/useStore.js'
    
    const router = useRouter();
    const route = useRoute();
    const routeName = computed(() => {
        return route.name
    })

    const menu = [
        {
            icon: 'mdi-home',
            label: 'home',
            value: 'home',
            to: '/discover'
        },
        {
            value: 'separator',
        },
        {
            value: 'category',
            label: 'purchased',
            icon: 'mdi-cart',
            children: [
                {
                    icon: 'mdi-school',
                    label: 'tutorial',
                    value: 'tutorial',
                    element: 'card',
                    type: 'classroom',
                    to: '/discover/my/tutorial',
                }
            ]
        },
        {
            value: 'separator',
        },
        {
            value: 'category',
            label: 'favorite',
            icon: 'mdi-heart',
            children: [
                {
                    icon: 'mdi-school',
                    label: 'tutorial',
                    value: 'favorite',
                    element: 'card',
                    type: 'classroom',
                    to: '/discover/my/favorite',
                }
            ]
        },
        {
            value: 'separator',
        },
        {
            value: 'category',
            label: 'liked',
            icon: 'mdi-thumb-up',
            children: [
                {
                    icon: 'mdi-school',
                    label: 'tutorial',
                    value: 'liked',
                    element: 'card',
                    type: 'classroom',
                    to: '/discover/my/liked',
                }
            ]
        }
    ]

    const emit = defineEmits(['setList'])
    const active = ref();

    const enter = (val) => {
        discoverStore.actived = null
        active.value = val.value;
        discoverStore.list = val.value;
        if (val.type) {
            discoverStore.list_type = val.type;
        }
        if (val.element) {
            discoverStore.list_element = val.element;
        }
        router.push(val.to);
    }
    watch(active, (val) => {
        if (!val) {
            active.value = menu[0].value;
        }
    }, { immediate: true });
    watch(routeName, () => {
        if (routeName.value === 'home') return
        const all_menu_items = menu.reduce((acc, item) => {
          if (item.to) acc.push(item);
          if (item.children) acc.push(...item.children.filter(child => child.to));
          return acc;
        }, []);
        if (routeName.value === 'discover_my_tutorial') {
            const val = all_menu_items.find(i => i.value === 'tutorial')            
            enter(val)
        }
        if (routeName.value === 'discover_my_favorite') {
            const val = all_menu_items.find(i => i.value === 'favorite')
            enter(val)
        }
        if (routeName.value === 'discover_my_like') {
            const val = all_menu_items.find(i => i.value === 'liked')
            enter(val)
        }
    }, { immediate: true });
</script>