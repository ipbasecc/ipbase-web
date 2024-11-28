<template>
    <div class="column gap-sm items-center q-py-md">
        <q-infinite-scroll @load="onLoad" :offset="250" :disable="!hasMore">
            <template v-for="i in cards" :key="i.id">
                <q-card bordered style="max-width: 540px;" class="shadow-0">
                    <img :src="i.cover?.url || alt_image">
                    <q-item>
                        <q-item-section v-if="i.creator?.profile?.avatar?.url" top avatar>
                            <q-avatar>
                                <q-img
                                    :src="i.creator.profile.avatar.url"
                                    :ratio="1"
                                    spinner-color="primary"
                                    spinner-size="22px"
                                />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section @click="enterCardDetail(i)">
                            <q-item-label>{{ i.name }}</q-item-label>
                            <q-item-label v-if="i.description" caption lines="2">{{ i.description }}</q-item-label>
                        </q-item-section>
                        <q-item-section side top>
                            <q-item-label caption>5 min ago</q-item-label>
                            <q-icon name="star" color="yellow" />
                        </q-item-section>
                    </q-item>
                </q-card>
            </template>
            <q-btn v-if="hasMore" flat :label="$t('get_more')" class="q-mt-lg" @click="getMoreCardsFn" />
            <span v-else class="text-grey-6 q-mt-lg">{{ $t('no_more') }}</span>
        <template v-slot:loading>
            <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
            </div>
        </template>
        </q-infinite-scroll>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { queryDiscover } from "src/api/strapi/project.js";
import { useRouter, useRoute } from "vue-router";

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

const queryDiscoverFn = async () => {
  const process = (_data) => {
    total_cards.value = _data.total;
    cards.value = [...cards.value, ..._data.cards];
  };
  const res = await queryDiscover(start.value, limit.value);
  if (res?.data) {
    process(res?.data);
  }
};
const getMoreCardsFn = async () => {
    page.value++
    await queryDiscoverFn();
};
async function onLoad (index, done) {
    await getMoreCardsFn();
    done()
}
onMounted(async () => {
    await queryDiscoverFn();
})
const active_id = computed(() => Number(route.params?.card_id));
watch([active_id, cards], async () => {
    await nextTick()
    if(active_id.value && cards.value?.length > 0){
        const _card = cards.value?.find(i => i.id === active_id.value)
        emit('enterCardDetail', _card)
    }
},{immediate: true});

const enterCardDetail = (card) => {
    emit('enterCardDetail', card)
    router.push(`/discover/${card.id}`)
}
</script>