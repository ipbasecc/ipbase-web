<template>
    <div v-if="work?.media && mediaOnly"  class="absolute-full flex flex-center">
        <FileViewer :file="work.media" :cover="work.cover.url" />
    </div>
    <q-scroll-area v-else-if="work" v-bind="$attrs" class="absolute-full">
        <div class="column no-wrap items-center q-py-md">
            <div class="column no-wrap" style="min-width: 640px; max-width: 1440px; width: 82vw;">
                <q-list>
                    <q-item>
                        <q-item-section>
                            <FileViewer v-if="work.media" :file="work.media" :cover="work.cover.url" />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-h6">{{ work.title }}</q-item-label>
                            <q-item-label caption lines="2">{{ work.description }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section side>
                            <q-avatar v-if="work.creator.profile.avatar" size="32px">
                                <q-img
                                    :src="work.creator.profile.avatar.url"
                                :ratio="1"
                                spinner-color="primary"
                                spinner-size="22px"
                                />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            {{ work.creator.username }}
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </q-scroll-area>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { findWork } from 'src/api/strapi.js'
import FileViewer from 'src/components/VIewComponents/FileViewer.vue'
const route = useRoute()
const { work_id, mediaOnly } = defineProps(['work_id', 'mediaOnly'])
const work = ref(null)
const findWorkFn = async () => {
    const {data} = await findWork(work_id)
    if(data) {
        work.value = data
    }
}
onMounted(() => {
    findWorkFn()
})
</script>