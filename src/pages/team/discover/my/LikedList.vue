<template>
    <q-infinite-scroll @load="onLoad" :offset="250" :disable="!hasMore" class="column gap-xl items-center q-py-md">
        LikedList
        <template v-for="i in cards" :key="i.id">
            <ItemCard :card="i" @enterCardDetail="enterCardDetail" />
        </template>
        <q-btn v-if="hasMore" flat :label="$t('get_more')" class="q-mt-lg" @click="getMoreCardsFn" />
        <span v-else class="text-grey-6 q-mt-lg">{{ $t('no_more') }}</span>
        <template v-slot:loading>
            <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
            </div>
        </template>
    </q-infinite-scroll>
</template>
<script setup>
    import { ref, computed, onMounted, watch, nextTick } from 'vue'
    import { queryLikedCards } from "src/api/strapi/project.js";
    import { useRouter, useRoute } from "vue-router";
    import ItemCard from '../ItemCard.vue'
    import { discoverStore } from 'src/hooks/global/useStore';

    const emit = defineEmits(['enterCardDetail'])
    const router = useRouter();
    const route = useRoute();
    const cards = ref([]);
    const page = ref(1);
    const start = computed(() => (page.value - 1) * limit.value);
    const limit = ref(10);
    const total_cards = ref(0);
    const hasMore = computed(() => total_cards.value > cards.value.length);
    const alt_image = ref('https://cdn.quasar.dev/img/mountains.jpg')

    const queryLikedCardsFn = async () => {
        const process = (_data) => {
            total_cards.value = _data.total;
            cards.value = [...cards.value, ..._data.cards];
        };
        const res = await queryLikedCards(discoverStore.list_element, discoverStore.list_type, start.value, limit.value);
        if (res?.data) {
            process(res?.data);
        }
    };
    const getMoreCardsFn = async () => {
        page.value++
        await queryLikedCardsFn();
    };
    async function onLoad(index, done) {
        await getMoreCardsFn();
        done()
    }
    onMounted(async () => {
        await queryLikedCardsFn();
    })
    const active_id = computed(() => Number(route.params?.card_id));
    watch([active_id, cards], async () => {
        await nextTick()
        if (active_id.value && cards.value?.length > 0) {
            const _card = cards.value?.find(i => i.id === active_id.value)
            emit('enterCardDetail', _card)
        }
    }, { immediate: true });

    const enterCardDetail = (card) => {
        emit('enterCardDetail', card)
        router.push(`/discover/my/liked/${card.id}`)
    }
</script>