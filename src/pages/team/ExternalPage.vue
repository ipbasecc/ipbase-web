<template>
  <q-layout view="hHh LpR lfr" container class="absolute-full"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <NavigatorHeader />
    <q-drawer
      v-model="uiStore.navigatorDrawer"
      side="left"
      :width="navDrawerWidth"
      :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
    >
      <q-scroll-area v-if="cards" class="absolute-full q-pa-sm"
      :class="$q.dark.mode ? '' : 'bg-primary-9 text-grey-1'">
        <q-infinite-scroll
          @load="onLoad"
          :offset="20"
          :disable="!cards_hasMore"
        >
          <div v-if="cards?.length > 0" class="column no-wrap gap-sm">
            <CardItem
              v-for="i in cards" :key="i.id" :card="i"
              :viewType="'card'"
              :uiOptions="uiOptions"
            />
            <div v-if="cards_hasMore" class="flex flex-center">
              <q-chip
                v-if="!cards_hasMore && done"
                :label="$t('all_cards_loaded')"
                class="op-5"
              />
              <q-spinner-dots v-else color="primary" size="2em" />
            </div>
          </div>
          <q-responsive v-else-if="!cards_hasMore" :ratio="16/9">
            <div class="flex flex-center">
              {{ $t('no_tasks') }}
            </div>
          </q-responsive>
        </q-infinite-scroll>
      </q-scroll-area>
    </q-drawer>
    <RightPannel />
    <q-page-container>
      <q-page
        class="border-left"
        :class="`${$q.dark.mode ? 'bg-dark' : 'bg-grey-1'} ${
          teamStore.card ? '' : 'flex flex-center'
        }`"
      >
        <div
          v-if="uiStore.navigatorDrawer"
          class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
          :class="dragWidth ? 'bg-primary ' : ''"
          :style="dragWidth ? 'width: 3px' : 'width: 10px'"
          @mousedown="handleMouseDown"
        >
          <q-icon
            :name="`mdi-chevron-${uiStore.navigatorDrawer ? 'left' : 'right'}`"
            color="primary"
            size="sm"
            @click="toggleNavDrawer()"
            class="cursor-pointer toggle-btn transition z-max"
            :style="`transform: translateX(${
              uiStore.navigatorDrawer ? -16 : 12
            }px)`"
          >
            <q-tooltip class="border" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
              shift + {{ uiStore.navigatorDrawer ? '<' : '>' }}
            </q-tooltip>
          </q-icon>
        </div>
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
import {onMounted, reactive, onUnmounted, ref, toRefs, watch, computed, onBeforeMount} from "vue";
import { useRouter, useRoute } from "vue-router";
import NavigatorHeader from './components/NavigatorHeader.vue'
import localforage from "localforage";

import {
  getProjectCache,
  putProjectCache,
} from "src/hooks/project/useProcess.js";
import { getOneProject, getCards } from "src/api/strapi/project.js";

import {
  teamStore,
  userStore,
  uiStore,
} from "src/hooks/global/useStore.js";

import CardPage from "./card/CardPage.vue";
import CardItem from "./card/CardItem.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import { useI18n } from "vue-i18n";
import {useMouse} from "@vueuse/core";
import RightPannel from './components/RightPannel.vue'
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
  const externalArr = ['team_projects_external_page', 'team_projects_external_homepage'];
  const focusArr = ['team_projects_focus_homepage', 'team_projects_focus_page'];
  if(externalArr.includes(route.name)){
    teamStore.isExternal = true
  }
  if(focusArr.includes(route.name)){
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
  if (project_id.value && !isFocusMode.value) {
    console.log('project_id', project_id.value);
    
    const id = Number(project_id.value);
    await getProject(id);
  }
});
watch(
  [project_id, isFocusMode],
  async () => {
    if (project_id.value && !isFocusMode.value) {
      console.log('project_id', project_id.value);
      
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

const navDrawerWidth = ref(260);
const { x } = useMouse({ touch: false });
const navDrawerMinWidth = ref(180);
const navDrawerMaxWidth = ref(340);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});

const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true;
  _ori_width.value = navDrawerWidth.value;
  uiStore.dragging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.dragging = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = x.value - position.x;
  if (
    _ori_width.value + deltaX >= navDrawerMinWidth.value &&
    _ori_width.value + deltaX <= navDrawerMaxWidth.value
  ) {
    navDrawerWidth.value = _ori_width.value + deltaX;
  } else if (_ori_width.value + deltaX > navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMaxWidth.value;
  } else if (_ori_width.value + deltaX === navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMinWidth.value;
  } else if (_ori_width.value + deltaX < 50) {
    uiStore.navigatorDrawer = false;
  }
};

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
