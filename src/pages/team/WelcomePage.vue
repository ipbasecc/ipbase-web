<template>
  <div v-if="axisData"
    v-bind="$attrs"
    class="absolute-full"
    ref="quadrantChartRef"
  >
    <q-toolbar class="absolute-top transparent z-fab">
      <q-space />
      <span class="row no-wrap gap-xs items-center q-mr-sm">
        {{ $t('related')}}：{{ cards?.length }} / {{ total_cards }}
        <q-icon
          name="mdi-autorenew"
          class="cursor-pointer"
          color="primary"
          @click="getMoreCardsFn()"
        />
      </span>
      <span class="row no-wrap gap-xs items-center q-mr-sm">
        {{ $t('followed')}}：{{ followedCards?.length }} / {{ total_followedCards }}
        <q-icon
          name="mdi-autorenew"
          class="cursor-pointer"
          color="primary"
          @click="getMoreFollowedCardsFn()"
        />
      </span>
      <q-btn flat round dense icon="filter_list">
        <q-menu class="radius-sm">
          <q-list dense bordered class="radius-sm q-pa-xs">
            <q-item
              v-for="i in filterClasses"
              :key="i.val"
              clickable
              v-close-popup
              class="radius-xs"
              @click="toggleClass(i.val)"
            >
              <q-item-section side>
                <q-icon
                  name="check_circle"
                  color="green"
                  size="sm"
                  :class="cardClass?.includes(i.val) ? '' : 'op-0'"
                />
              </q-item-section>
              <q-item-section class="text-no-wrap">{{ $t(i.name) }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
    <QuadrantBackgroud />
    <q-resize-observer @resize="onResize" />
    <QuadrantChart
      v-if="taskContainerSIze"
      :axisData="axisData"
      :auth="{
        read: true,
        modify: false,
        delete: false,
      }"
      :taskContainerSIze="taskContainerSIze"
      @itemChanged="itemChanged"
    />
  </div>
  <div v-else class="fit column flex-center">
    <BgBrand />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, computed, onBeforeUnmount } from "vue";
import { getCards, getFollowedCards } from "src/api/strapi/project.js";
import localforage from "localforage";

import { teamStore, uiStore } from "src/hooks/global/useStore.js";

import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import { calcCoordinate, uniqueById } from "src/hooks/utilits.js";

const taskContainerSIze = ref();
const quadrantChartRef = ref();
const onResize = (size) => {
  taskContainerSIze.value = size;
};

let axisData = ref([]);

const cards = ref([]);
const start = ref(0);
const limit = ref(5);
const total_cards = ref();
const cards_hasMore = computed(() => total_cards.value < cards.value?.length);

const team_id = computed(() => teamStore.team?.id);
const getCardsFn = async () => {
  const process = (_data) => {
    total_cards.value = _data.total;
    cards.value = [...cards.value, ..._data];
  };

  const cacheKey = `team_${team_id.value}cards`
  const _cache = await localforage.getItem(cacheKey);
  if(_cache){
    process(_cache)
  }
  const res = await getCards(
    team_id.value,
    start.value,
    limit.value
  );
  if (res?.data) {
    // 删掉缓存中已有的卡片
    cards.value = cards.value.filter(i => !_cache?.map(j => j.id).includes(i.id))
    process(res?.data?.cards);
    // 时删除缓存，这样调用getMoreCardsFn时就不会删除已存在的cards了,组件卸载时再保存缓存
    await localforage.setItem(cacheKey, []);
  }
};
onBeforeUnmount(() => {
  localforage.setItem(`team_${team_id.value}cards`, JSON.parse(JSON.stringify(cards.value)));
})
const getMoreCardsFn = async () => {
  start.value = cards.value?.length || 0;
  await getCardsFn(teamStore.init?.id);
};

const followedCards = ref([]);
const followedCards_start = ref(0);
const followedCards_limit = ref(5);
const total_followedCards = ref();
const followedCards_hasMore = computed(() => total_followedCards.value < followedCards.value?.length);
const getFollowedCardsCardsFn = async () => {
  const process = (_data) => {
    total_followedCards.value = _data.total;
    followedCards.value = [...followedCards.value, ..._data];
  };
  const cacheKey = `team_${team_id.value}followedCards`
  const _cache = await localforage.getItem(cacheKey);
  if(_cache){
    process(_cache)
  }
  const res = await getFollowedCards(
    team_id.value,
    followedCards_start.value,
    followedCards_limit.value
  );
  if (res?.data) {
    followedCards.value = followedCards.value.filter(i => !_cache?.map(j => j.id).includes(i.id))
    process(res?.data?.cards);
    await localforage.setItem(
      cacheKey,
      []
    );
  }
};
onBeforeUnmount(() => {
  localforage.setItem(`team_${team_id.value}followedCards`, JSON.parse(JSON.stringify(followedCards.value)));
})
const getMoreFollowedCardsFn = async () => {
  followedCards_start.value = followedCards.value?.length || 0;
  await getFollowedCardsCardsFn(teamStore.init?.id);
};

const team = computed(() => teamStore.team);
watch(
  team_id,
  () => {
    if (team_id.value) {
      cards.value = [];
      followedCards.value = [];
      getCardsFn();
      getFollowedCardsCardsFn();
    }
  },
  { immediate: true, deep: false }
);

const allCards = ref();
const _allCards = ref();
const _cards = computed(() => cards.value);
const _followedCards = computed(() => followedCards.value);
const _executorCards = computed(() =>
  cards.value?.filter((i) =>
    i.member_roles?.filter(
      (j) => j.subject === "executor" && j.by_user?.id === teamStore.init?.id
    )
  )
);

const clac_allCards = () => {
  allCards.value = uniqueById([..._cards.value, ..._followedCards.value]);
  _allCards.value = allCards.value;
};
watch(
  [_cards, _followedCards],
  () => {
    if (_cards.value || _followedCards.value) {
      clac_allCards();
    }
  },
  { immediate: true, deep: false }
);

const _cardClassBase = ["related", "followed", "executor"];
const cardClass = ref(_cardClassBase);
const filterClasses = [
  { val: "executor", icon: "", name: "my_executed" },
  { val: "related", icon: "", name: "my_related" },
  { val: "followed", icon: "", name: "my_followed" },
];
const filterCards = () => {
  if (!cardClass.value?.includes("related")) {
    allCards.value = _allCards.value.filter(
      (i) => !_cards.value?.map((j) => j.id).includes(i.id)
    );
  } else if (!cardClass.value?.includes("followed")) {
    allCards.value = _allCards.value.filter(
      (i) => !_followedCards.value?.map((j) => j.id).includes(i.id)
    );
  } else if (!cardClass.value?.includes("executor")) {
    allCards.value = _allCards.value.filter(
      (i) => !_executorCards.value?.map((j) => j.id).includes(i.id)
    );
  } else {
    allCards.value = _allCards.value;
  }
};
localforage.getItem("__project_homeCardClesses").then((res) => {
  if (res) {
    cardClass.value = res;
    filterCards();
  }
});
watch(
  cardClass,
  () => {
    if (cardClass.value) {
      filterCards();
    }
  },
  { immediate: true, deep: false }
);
const toggleClass = (val) => {
  const old = cardClass.value;
  cardClass.value = cardClass.value?.includes(val)
    ? cardClass.value.filter((i) => i !== val)
    : [...cardClass.value, val];
  if (cardClass.value?.length === 0) {
    cardClass.value = old;
  }
  filterCards();
  localforage.setItem(
    "__project_homeCardClesses",
    JSON.parse(JSON.stringify(cardClass.value))
  );
};
const updatedCard_for_userTeamAffairs = computed(() => uiStore.updatedCard_for_userTeamAffairs);
watch([updatedCard_for_userTeamAffairs, axisData], async() => {
  if(updatedCard_for_userTeamAffairs.value && Object.keys(axisData.value || {}).length > 0){    
    const index = allCards.value.findIndex(i => i.id === updatedCard_for_userTeamAffairs.value.id);
    if(index !== -1){
      allCards.value[index] = updatedCard_for_userTeamAffairs.value;
    }
  }
},{immediate: true,deep: 2});

watchEffect(() => {
  axisData.value =
    allCards.value?.length > 0 ? calcCoordinate(allCards.value) : [];
});
watch(
  axisData,
  () => {
    if (axisData.value?.length > 0) {
      const rclone = JSON.parse(JSON.stringify(axisData.value));
      localforage.setItem("projectWelcomeData", rclone);
    }
  },
  { immediate: false, deep: true }
);

const itemChanged = async (_id, _params) => {
  console.log("_params", _id, _params);
  cards.value.find((i) => i.id === _id).urgency = _params.data?.urgency;
  cards.value.find((i) => i.id === _id).importance = _params.data?.importance;
  await localforage.setItem("cards", JSON.parse(JSON.stringify(cards.value)));
};
</script>
