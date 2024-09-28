<template>
  <q-infinite-scroll @load="onLoad" :offset="50" :disable="!hasMore || uiStore.axiosStauts === 'pending'">
      <div class="relative-position">
        <q-pull-to-refresh
          @refresh="refresh"
        >
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
        </q-pull-to-refresh>
      </div>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
  </q-infinite-scroll>
</template>

<script setup>
import { ref,watch, computed } from 'vue'
import { useRouter } from 'vue-router';
import { getTeamDocuments } from 'src/api/strapi/team.js'
import { deleteDocument } from 'src/api/strapi/project.js'
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import { useNews } from './useNews.js'

const { openNews } = useNews();
const router = useRouter();
const team_id = computed(() => teamStore.team?.id);
const page = ref(1);
const PER_PAGE = 15;
const hasMore = ref(true);
const loading = ref(false);
const fetchNews = async () => {
  if(loading.value) return;
    loading.value = true;
    const {data} = await getTeamDocuments(team_id.value, page.value, PER_PAGE)
    if(data){
      if(data.documents?.length > 0){
        data.documents.map(i => {
          const exitsIDs = teamStore.news.map(j => j.id);
          if(!exitsIDs.includes(i.id)){
            if(!i.jsonContent){
              i.jsonContent = {
                "type": "doc", "content": [ { "type": "paragraph" } ]
              }
            }
            teamStore.news.push(i);
          }
        });
        hasMore.value = data.total > teamStore.news?.length;
      } else {
        hasMore.value = false;
      }
      loading.value = false;
    }
}
watch(team_id, async () => {
  if(team_id.value){
    teamStore.news = [];
    await fetchNews();
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
const fecthMore = async () => {
  page.value++;
  await fetchNews();
}
async function onLoad(index, done) {
  done();
  await fecthMore();
}
async function refresh(done) {
  page.value = 1
  teamStore.news = [];
  await fetchNews();
  done();
}
</script>

<style>
.q-pull-to-refresh__puller-container {
  left: 0 !important;
}
</style>