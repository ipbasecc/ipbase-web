<template>
    <q-scroll-area class="absolute-full">
        <q-infinite-scroll @load="onLoad" :offset="250" :disable="!hasMore || loading || !init">
            <div class="column no-wrap q-px-lg">
                <keep-alive>
                    <div class="grid grid-gap-sm q-pa-md" :class="$q.screen.gt.md ? 'grid-4' : 'grid-3'">
                        <template v-for="i in workers" :key=i.id>
                            <q-responsive :ratio="3/4">
                                <PartybCard :party="i.user">
                                    <q-card-section class="column flex-center q-pa-sm border-top">
                                        <TalkBtn :worker="i" />
                                    </q-card-section>
                                </PartybCard>
                            </q-responsive>
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
import { ref, onMounted, computed } from 'vue'
import { findCertifications } from 'src/api/strapi.js'
import PartybCard from './components/PartybCard.vue'
import { dealStore } from 'src/hooks/global/useStore';
import TalkBtn from './components/TalkBtn.vue'

const offset = ref(0)
const limit = ref(10)
const hasMore = computed(() => dealStore.workers.length < dealStore.worker_count)
const workers = computed(() => dealStore.workers)

const init = ref(false)
const loading = ref(false)
const findWorkers = async () => {
    loading.value = true
    const {data} = await findCertifications({ offset: offset.value, limit: limit.value })
    if (data) {
        init.value = true
        dealStore.workers.push(...data.certifications)
        dealStore.worker_count = data.count
    }
    loading.value = false
}
const findMore = async () => {
    offset.value += limit.value
    await findWorkers()
}
async function onLoad(index, done) {
    if(loading.value || !init.value) {
        done()
        return
    }
    await findMore()
    done()
}
onMounted(async() => {
    if(dealStore.worker_count === null) {
        await findWorkers()
    }
})

</script>
