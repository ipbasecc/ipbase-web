<template>
    <div class="absolute-full column no-wrap">
        <q-toolbar class="transparent border-bottom">
            <q-btn flat round icon="mdi-chevron-left" @click="router.push('/studio/works')" />
            <q-toolbar-title>
                添加作品
            </q-toolbar-title>
            <q-btn color="primary" label="添加" @click="addWorkFn" />
        </q-toolbar>
        <q-scroll-area class="q-space">
            <div class="column no-wrap items-center q-py-md">
                <q-list style="min-width: 640px; max-width: 1440px; width: 59vw;">
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.title" type="text" outlined label="作品名称" />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.description" type="textarea" outlined label="作品描述" />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section v-if="cover">
                            <q-img
                                :src="cover"
                                :ratio="16/9"
                                spinner-color="primary"
                                spinner-size="82px"
                            />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <DrapUpload :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                :allowedFormats="['image/jpg','image/jpeg','image/png','video/mp4','video/mov','video/m4v']"
                                @uploaded="setCover" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_work_cover')" :maxFileSize="2 * 1024 * 1024"
                            />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section v-if="media">
                            <q-img
                                :src="media"
                                :ratio="16/9"
                                spinner-color="primary"
                                spinner-size="82px"
                            />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <DrapUpload :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                :allowedFormats="['image/jpg','image/jpeg','image/png','video/mp4','video/mov','video/m4v']"
                                @uploaded="setMedia" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_work_media')" :maxFileSize="300 * 1024 * 1024"
                            />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </q-scroll-area>
    </div>
</template>
<script setup>
import { ref } from "vue";
import { addWork } from "src/api/strapi.js";
import { useRouter } from 'vue-router'
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
const router = useRouter()
const params = ref({
    data: {
        title: '',
        description: ''
    }
});
const media = ref(null)
const setMedia = (val) => {
    if(val?.id){
        params.value.data.media = val.id
        media.value = val.attributes?.url
    }
}
const cover = ref(null)
const setCover = (val) => {
    if(val?.id){
        params.value.data.cover = val.id
        cover.value = val.attributes?.url
    }
}
const addWorkFn = async () => {
    const {data} = await addWork(params.value)
    if(data) {
        $q.notify({
            type: 'positive',
            message: '作品已添加',
            position: 'top',
        })
        setTimeout(() => {
            router.push(`/studio/works/${data.id}`)
        }, 1000);
    }
}
</script>