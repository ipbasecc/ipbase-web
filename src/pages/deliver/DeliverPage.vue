<template>
    <NavigatorContainer>
        <q-scroll-area v-if="pageName === 'DeliverPage'" class="absolute-full">
            <div class="column no-wrap gap-lg">
                <NeedsContainer :deals />
                <WorkersContainer :deals />
            </div>
        </q-scroll-area>
        <template v-else>
            <RouterView />
        </template>
    </NavigatorContainer>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { findDeals } from 'src/api/strapi'
import NavigatorContainer from '../team/NavigatorContainer.vue'
import WorkersContainer from './components/WorkersContainer.vue'
import NeedsContainer from './components/NeedsContainer.vue'

const route = useRoute();
const pageName = computed(() => route.name);

const deals = ref([])
const offset = ref(0)
const limit = ref(10)
const sort = ref('desc')
onMounted(async () => {
    const res = await findDeals(offset.value, limit.value, sort.value)
    deals.value = res.data
})

</script>
