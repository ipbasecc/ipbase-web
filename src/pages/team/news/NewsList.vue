<template>
  <q-card v-for="i in teamStore.news" :key="i.id"
    flat bordered
    class="q-mb-sm"
    :class="teamStore.active_news?.id === i.id ? 'bg-primary transition shadow-24' : ''"
  >
    <q-img
      v-if="i.cover?.url"
      :src="i.cover?.url"
      :ratio="20/9"
      spinner-color="primary"
      spinner-size="2rem"
    >
    </q-img>
    <q-card-section class="row no-wrap gap-sm q-pa-sm">
      <div class="font-larger font-bold-600 cursor-pointer q-space" @click="openNews(i)">{{ i.title }}</div>
      <div v-if="useAuths('modify', ['news']) || useAuths('remove', ['news'])">
        <q-btn flat dense round size="sm" icon="more_vert">
          <q-menu class="radius-sm shadow-24">
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item v-if="useAuths('modify', ['news'])"
                class="radius-xs" clickable v-close-popup
                @click="editNews(i)"
              >
                <q-item-section side>
                  <q-icon name="mdi-pencil" size="sm" />
                </q-item-section>
                <q-item-section class="q-pr-md">{{ $t('edit') }}</q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item v-if="useAuths('delete', ['news'])"
                class="radius-xs bg-negative" clickable v-close-popup
                @click="deleteNews(i)"
              >
                <q-item-section side>
                  <q-icon name="mdi-delete" size="sm" />
                </q-item-section>
                <q-item-section class="q-pr-md">{{ $t('delete') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref,watch, computed } from 'vue'
import { useRouter } from 'vue-router';
import { getTeamDocuments } from 'src/api/strapi/team.js'
import { deleteDocument } from 'src/api/strapi/project.js'
import {teamStore} from "src/hooks/global/useStore.js";
import { useNews } from './useNews.js'

const { openNews } = useNews();
const router = useRouter();
const team_id = computed(() => teamStore.team?.id);
const page = ref(1);
const PER_PAGE = 15;
watch(team_id, async () => {
  if(team_id.value){
    const {data} = await getTeamDocuments(team_id.value, page.value, PER_PAGE)
    if(data){
      teamStore.news = data
    }
  }
},{immediate:true, deep:false});

const editNews = (news) => {
  teamStore.edit_news = news;
}
const deleteNews = async (news) => {
  const {data} = await deleteDocument(news.id);
  if(data){
    teamStore.news = teamStore.news.filter(i => i.id !== data.removed)
  }
}
</script>

<style scoped>
</style>