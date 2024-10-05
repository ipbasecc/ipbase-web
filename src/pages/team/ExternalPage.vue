<template>
  <q-layout view="lHr lpR lFr" container>
    <q-drawer
      v-model="uiStore.externalCardsDrawer"
      side="left"
      :width="338"
      :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
    >
      <q-scroll-area v-if="cards" class="absolute-full q-pa-sm">
        <q-infinite-scroll
          @load="onLoad"
          :offset="20"
          :disable="!cards_hasMore"
        >
          <div class="column no-wrap gap-sm">
            <CardItem
              v-for="i in cards" :key="i.id" :card="i"
              :viewType="'card'"
              :uiOptions="uiOptions"
            />
            <div class="flex flex-center">
              <q-chip
                v-if="!cards_hasMore && done"
                :label="$t('all_cards_loaded')"
                class="op-5"
              />
              <q-spinner-dots v-else color="primary" size="2em" />
            </div>
          </div>
        </q-infinite-scroll>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page
        class="border-left"
        :class="`${$q.dark.mode ? 'bg-dark' : 'bg-grey-1'} ${
          teamStore.card ? '' : 'flex flex-center'
        }`"
      >
        <!-- 这里的isExternal用来调整UI、当前模式下，要么是“外部成员”、要么是“专注模式”，都要用到此种UI，因此isExternal一定是true -->
        <CardPage
          v-if="teamStore.card"
          :isExternal="teamStore.isExternal"
          @syncCardInList="syncCardInList"
        />
        <BgBrand v-else />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {onMounted, onUnmounted, ref, toRefs, watch, computed, onBeforeMount} from "vue";
import { useRouter, useRoute } from "vue-router";

import localforage from "localforage";

import {
  getProjectCache,
  putProjectCache,
} from "src/hooks/project/useProcess.js";
import { getOneProject, getCards } from "src/api/strapi/project.js";

import {
  teamStore,
  userStore,
  mm_wsStore,
  uiStore,
} from "src/hooks/global/useStore.js";

import CardPage from "./card/CardPage.vue";
import CardItem from "./card/CardItem.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  team_id: {
    type: String,
    default: null,
  },
  project_id: {
    type: String,
    default: null,
  },
});
const { team_id, project_id } = toRefs(props);

const emit = defineEmits(["openLeftDrawer"]);
const router = useRouter();
const route = useRoute();
onBeforeMount(() => {
  uiStore.showMainContentList = false;
  if(route.name === 'team_projects_external_page'){
    teamStore.isExternal = true
  }
  if(route.name === 'team_projects_focus_page'){
    uiStore.isFocusMode = true
  }
})

const cards = ref([]);
const cards_page = ref(1);
const cards_per_page = ref(15);
const total_cards = ref();
const cards_hasMore = ref();

const loading = ref(false);
const done = ref(false)
const getCardsFn = async () => {
  const process = (_data) => {
    total_cards.value = _data.total;
    cards.value = [...cards.value, ..._data.cards];
    cards_hasMore.value = cards.value?.length <= _data.total && _data.cards?.length > 0;
  };
  const res = await getCards(
    team_id.value,
    cards_page.value,
    cards_per_page.value
  );
  if (res?.data) {
    done.value = true;
    process(res?.data);
    await localforage.setItem("cards", JSON.parse(JSON.stringify(res?.data)));
  }
};
const loadMore = async () => {
  if(!cards_hasMore.value) return
  cards_page.value++;
  await getCardsFn(userStore.userId);
};

const project = ref();
const isExternal = computed(() => teamStore.team?.isExternal || false);
const getProject = async (_id) => {
  if (loading.value) return;
  loading.value = true;
  const cache = await getProjectCache(_id);
  if (cache) {
    project.value = cache;
    teamStore.project = cache;
  }
  const fetch = await getOneProject(_id);
  if (fetch?.data) {
    project.value = fetch.data;
    teamStore.project = fetch.data;
    if (isExternal.value) {
      cards.value = project.value?.cards;
    } else {
      await getCardsFn();
    }
    await putProjectCache(fetch.data);
  } else {
    projectRemoved.value = true;
    projectRemovedFn();
  }
  loading.value = false;
};
async function onLoad(index, done) {
  await loadMore();
  done();
}

const syncCardInList = (val) => {
  const isSameId = (element) => {
    return element.id === val.id;
  };
  const index = cards.value.findIndex(isSameId);
  if (index !== -1) {
    Object.keys(cards.value[index]).forEach((key) => {
      cards.value[key] = val[key];
    });
  }
};

const isFocusMode = computed(() => uiStore.isFocusMode);
onMounted(async () => {
  emit("openLeftDrawer");
  if (route?.name !== "team_projects_page") {
    const id = Number(project_id.value);
    await getProject(id);
  }
});
watch(
  [project_id, isFocusMode],
  async () => {
    if (project_id.value && !isFocusMode.value) {
      const id = Number(project_id.value);
      await getProject(id);
    }
  },
  { immediate: false, deep: false }
);

const projectRemoved = ref(false);
const projectRemovedFn = () => {
  setTimeout(async () => {
    teamStore.need_refecth_projects = true;
    projectRemoved.value = false;
    teamStore.project = null;
    await router.push("/teams");
  }, 3000);
};


const uiOptions = ref([
  {
    val: "hidecompletedTodo",
    label: t('hide_completed_todo'),
    enable: true,
    icon: "mdi-checkbox-marked-circle",
  },
]);
const update_uiOptions = async (i) => {
  i.enable = !i.enable;
  uiOptions.value = uiOptions.value.map((ui) => (ui.val === i.val && i) || ui);
  let res = JSON.stringify(uiOptions.value);
  await localforage
    .setItem(`___dilgMode_uiOptions`, res)
    .catch(function (err) {
      console.log(err);
    });
};
const sync_uiOptions = async () => {
  let res = await localforage.getItem(
    `___dilgMode_uiOptions`
  );
  if (res) {
    uiOptions.value = JSON.parse(res);
  }
};
onBeforeMount(() => {
  sync_uiOptions();
});

const val = computed(() => teamStore.income);
watch(val, async(newVal, oldVal) => {
  if(!newVal || newVal === oldVal) return;
  const { team_id, card_id, data } = val.value.data;
  if(teamStore.team?.id === Number(team_id)){

    const isMine = data.card_members?.map(i => i.by_user.id).includes(teamStore.init?.id);
    if(val.value.event === 'card:created'){
      if(isMine){
        cards.value.push(data)
      }
    }
    if(val.value.event === 'card:deleted'){
      const index = cards.value.findIndex(i => i.id === Number(card_id));
      if(index !== -1){
        cards.value.splice(index, 1)
    }
    if(val.value.event === 'card:updated'){
      if(isMine){
        const index = cards.value.findIndex(i => i.id === Number(card_id));
        if(index !== -1){
          cards.value[index] = data;
        }
      }
    }
  }}
})
onUnmounted(() => {
  teamStore.project = null;
});
</script>
