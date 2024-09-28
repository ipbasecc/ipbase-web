<template>
    <div class="full-width column no-wrap gap-sm">
        <q-card class="full-width" bordered>
            <StrapiUpload
                v-if="!cover || changeCover"
                class="full-width"
                @uploaded="fileUploaded"
            />
            <q-img
                v-else-if="cover"
                :src="cover"
                :ratio="16/9"
                spinner-color="primary"
                spinner-size="82px"
            >
                <div class="absolute-full flex flex-center">
                    <q-btn color="primary" rounede :label="$t('update')" @click="changeCover = true" />
                </div>
            </q-img>
            <q-card-section>
                <q-input v-model.lazy="teamStore.edit_news.title"
                    type="text" :label="$t('team_news_title')"
                />
            </q-card-section>
            <q-card-section class="row no-wrap q-pa-sm border-top">
                <q-btn v-if="teamStore.edit_news?.title" flat
                    :label="$t('cancel')"
                    @click="teamStore.edit_news = null"
                />
                <q-space />
                <q-btn v-if="teamStore.edit_news?.title" color="primary"
                    :label="$t('confirm')"
                    @click="updateNews()"
                />
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import {teamStore} from "src/hooks/global/useStore.js";
import { updateDocument } from 'src/api/strapi/project.js'
import StrapiUpload from 'src/components/Utilits/StrapiUpload.vue'

const emit = defineEmits(['newsUpdated'])
const content = computed(() => teamStore.edit_news)
const params = ref({
    team_id: teamStore.team?.id,
    data: content.value
});
const cover = ref();
onBeforeMount(() => {
    cover.value = teamStore.edit_news?.cover?.url;
})
const changeCover = ref(false);
const fileUploaded = async (files) => {
    const file = files[0];
    teamStore.edit_news.cover = file.id;
    cover.value = file.attributes?.url;
    changeCover.value = false;
}
const updateNews = async () => {
    const { data } = await updateDocument(teamStore.edit_news?.id, params.value);
    if(data) {
        emit('newsUpdated', data)
    }
}

</script>

<style scoped>
</style>