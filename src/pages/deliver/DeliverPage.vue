<template>
    <NavigatorContainer>
        <q-scroll-area v-if="pageName === 'DeliverPage'" class="absolute-full">
            <div class="column no-wrap gap-lg">
                <NeedsContainer :deals />
                <!-- <WorkersContainer :deals /> -->
            </div>
        </q-scroll-area>
        <template v-else>
            <RouterView />
        </template>
    </NavigatorContainer>
</template>
<script setup>
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { findDeals } from 'src/api/strapi'
import NavigatorContainer from '../team/NavigatorContainer.vue'
import WorkersContainer from './components/WorkersContainer.vue'
import NeedsContainer from './components/NeedsContainer.vue'
import localforage from 'localforage'
import { dealStore, uiStore } from 'src/hooks/global/useStore'

const route = useRoute();
const pageName = computed(() => route.name);

const deals = ref([])
const offset = ref(0)
const limit = ref(6)
const sort = ref('desc')

const talkers = async () => {
    const talkers = await localforage.getItem('talkers')
    return talkers
}
onMounted(async () => {
    dealStore.talkers = await talkers()
    const params = {
        offset: offset.value,
        limit: limit.value,
        sort: sort.value
    }
    const {data} = await findDeals(params)
    deals.value = data.deals
})
watchEffect(() => {
    uiStore.app = 'deliver'
})

</script>
