<template>
    <div class="column no-wrap absolute-full">
        <q-toolbar v-if="is_page" class="transparent">
            <q-space />
            <q-btn flat round dense icon="mdi-plus" @click="addWork" />
        </q-toolbar>
        <q-scroll-area class="q-space">
            <div class="column no-wrap q-pa-md" :class="works.length > 0 ? 'items-center' : 'absolute-full flex-center'">
                <div v-if="works.length > 0" class="grid grid-gap-md" :class="is_page ? 'grid-4' : 'grid-2'"
                    :style="`min-width: 640px; max-width: 1440px; width: ${is_page ? '82vw' : '100%'};`">
                    <template v-for="work in works" :key="work.id">
                        <WorkCard :work="work" :is_page="is_page" />
                    </template>
                </div>
                <template v-else>
                    <div class="text-center op-5 column flex-center gap-lg">
                        <q-icon name="mdi-image" size="xl" />
                        <q-btn flat icon="mdi-plus" label="暂无作品, 点击添加" @click="addWork" />
                    </div>
                </template>
            </div>
        </q-scroll-area>
    </div>
</template>
<script setup>
import { findWorks } from "src/api/strapi.js";
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import WorkCard from './components/WorkCard.vue'
import { teamStore } from "src/hooks/global/useStore";

const { user_id, is_page = true } = defineProps(['user_id', 'is_page'])
const router = useRouter()
const works = ref([])
const count = ref(0)
const findWorksFn = async () => {
    const params = {
        owner_id: user_id || teamStore.init?.id
    }
    const {data} = await findWorks(params)
    if(data) {
        works.value = data.works
        count.value = data.count
    }
}
onMounted(() => {
    findWorksFn()
})

const addWork = () => {
    router.push('/studio/add-work')
}
</script>