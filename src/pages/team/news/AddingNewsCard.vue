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
            />
            <q-card-section>
                <q-input v-model.lazy="teamStore.adding_news.title"
                    type="text" :label="$t('add_team_news_title')"
                />
            </q-card-section>
        </q-card>
        <q-btn v-if="teamStore.adding_news?.title" color="primary" :label="$t('add_team_news_confirm')" @click="addNews()" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {uiStore, teamStore} from "src/hooks/global/useStore.js";
import { createDocument } from 'src/api/strapi/project.js'
import StrapiUpload from 'src/components/Utilits/StrapiUpload.vue'

const emit = defineEmits(['newsCreated'])
const content = computed(() => teamStore.adding_news)
const params = ref({
    team_id: teamStore.team?.id,
    data: content.value
});
const cover = ref();
const changeCover = ref(false);
const fileUploaded = async (files) => {
    const file = files[0];
    teamStore.adding_news.cover = file.id;
    cover.value = file.attributes?.url;
}
const addNews = async () => {
    const { data } = await createDocument(params.value);
    if(data) {
        emit('newsCreated', data)
    }
}

</script>

<style scoped>
</style>