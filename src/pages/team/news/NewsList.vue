<template>
  <q-card v-for="i in teamStore.news" :key="i.id"
    flat bordered
    class="cursor-pointer q-mb-sm"
    @click="openNews(i)"
  >
    <q-img
      v-if="i.cover?.url"
      :src="i.cover?.url"
      :ratio="20/9"
      spinner-color="primary"
      spinner-size="2rem"
    />
    <q-card-section>
      <div class="text-h6">{{ i.title }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref,watch, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router';
import { getTeamDocuments } from 'src/api/strapi/team.js'
import {teamStore} from "src/hooks/global/useStore.js";

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

const openNews = (news) => {
  if(teamStore.active_news?.id === news.id) return;
  teamStore.active_news = news;
  router.push(`/teams/${teamStore.team?.id}/news/${news.id}`)
}
</script>

<style scoped>
</style>