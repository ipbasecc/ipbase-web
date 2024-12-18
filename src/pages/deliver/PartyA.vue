<template>
    <div v-if="noData" class="absolute-full flex flex-center op-5">
        {{ $t('deal_no_listdata') }}
    </div>
    <q-scroll-area v-else class="absolute-full">
        <q-infinite-scroll @load="onLoad" :offset="250" :disable="!hasMore">
            <div class="column no-wrap q-px-lg">
                <keep-alive>
                    <div class="grid grid-3 grid-gap-sm q-pa-md">
                        <template v-for="i in deals" :key=i.id>
                            <PartyaCard :deal="i" />
                        </template>
                    </div>
                </keep-alive>
                <q-btn v-if="hasMore" color="primary" icon="check" :label="$t('load_more')" @click="findMore" />
            </div>
            <template v-slot:loading>
                <div class="row justify-center q-my-md">
                <q-spinner-dots color="primary" size="40px" />
                </div>
            </template>
        </q-infinite-scroll>
    </q-scroll-area>
</template>
<script setup>
import { watch, ref, computed } from 'vue'
import { findDeals } from 'src/api/strapi'
import { dealStore, uiStore } from 'src/hooks/global/useStore.js'
import PartyaCard from './components/PartyaCard.vue'

const deals = computed(() => dealStore.deals)
const offset = ref(0)
const limit = ref(10)
const sort = ref('desc')
const hasMore = ref(false)
const noData = ref(false)
const findParams = computed(() => {
    let res = {
        offset: offset.value,
        limit: limit.value,
        sort: sort.value
    }
    if(uiStore.deal_active_item === 'my_party_a_list') {
        res.me = 'party_a';
    }
    if(uiStore.deal_active_item === 'my_party_b_list') {
        res.me = 'party_b';
    }
    return res;
})
const findDealsFn = async () => {
    console.log('params', findParams.value);
    const {data} = await findDeals(findParams.value)
    dealStore.deals.push(...data.deals)
    dealStore.count = data.count
    hasMore.value = data.count > offset.value + limit.value
    noData.value = data.count === 0
}
const findMore = async () => {
    offset.value = deals.value.length;
    await findDealsFn();
}
async function onLoad(index, done) {
    if(!hasMore.value) {
        done();
        return;
    }
    await findMore();
    done();
}
const activeNav = computed(() => uiStore.deal_active_item)
watch(activeNav, async () => {
    const refind = ['party_a_list', 'my_party_a_list','my_party_b_list']
    if(refind.includes(activeNav.value)) {
        dealStore.deals = []
        offset.value = 0
        await findDealsFn();
    }
},{immediate: true})
</script>
