<template>
  <div
    v-if="axisData?.length > 0"
    v-bind="$attrs"
    class="absolute-full"
    ref="quadrantChartRef"
  >
    <q-toolbar class="absolute-top transparent z-fab">
      <q-space />
      <span class="row no-wrap gap-xs items-center q-mr-sm">
        相关：{{ cards?.length }} / {{ total_cards }}
        <q-icon
          name="mdi-autorenew"
          class="cursor-pointer"
          color="primary"
          @click="getMoreCardsFn()"
        />
      </span>
      <span class="row no-wrap gap-xs items-center q-mr-sm">
        关注：{{ followedCards?.length }} / {{ total_followedCards }}
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
              <q-item-section class="text-no-wrap">{{ i.name }}</q-item-section>
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
      :taskContainerSIze="taskContainerSIze"
      @QuadrantChange="QuadrantChange"
    />
  </div>
  <div v-else class="fit column flex-center">
    <BgBrand />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, computed } from "vue";
import { getCards, getFollowedCards } from "src/api/strapi/project.js";
import localforage from "localforage";

import { fetch_StrapiMe } from "src/hooks/global/useFetchme.js";
import { teamStore } from "src/hooks/global/useStore.js";

import QuadrantBackgroud from "src/pages/team/card/components/QuadrantBackgroud.vue";
import QuadrantChart from "src/pages/team/kanban/QuadrantChart.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import { calcCoordinate, uniqueById } from "src/hooks/utilits.js";

const taskContainerSIze = ref();
const quadrantChartRef = ref();
const onResize = (size) => {
  taskContainerSIze.value = size;
};

const me = ref();
fetch_StrapiMe().then((res) => {
  me.value = res;
});

let axisData = ref();

const cards = ref([]);
const cards_page = ref(1);
const cards_per_page = ref(5);
const total_cards = ref();
const cards_hasMore = computed(
  () =>
    total_cards.value &&
    total_cards.value > cards_page.value * cards_per_page.value
);
const team_id = computed(() => teamStore.team?.id);
const getCardsFn = async () => {
  const process = (_data) => {
    total_cards.value = _data.total;
    cards.value = [...cards.value, ..._data.cards];
  };
  const res = await getCards(
    team_id.value,
    cards_page.value,
    cards_per_page.value
  );
  if (res?.data) {
    process(res?.data);
    await localforage.setItem("cards", JSON.parse(JSON.stringify(res?.data)));
  }
};
const getMoreCardsFn = async () => {
  cards_page.value++;
  await getCardsFn(me.value.id);
};

const followedCards = ref([]);
const followedCards_page = ref(1);
const followedCards_per_page = ref(5);
const total_followedCards = ref();
const followedCards_hasMore = computed(
  () =>
    total_followedCards.value &&
    total_followedCards.value >
      followedCards_page.value * followedCards_per_page.value
);
const getFollowedCardsCardsFn = async () => {
  const process = (_data) => {
    total_followedCards.value = _data.total;
    followedCards.value = [...followedCards.value, ..._data.cards];
  };
  const res = await getFollowedCards(
    team_id.value,
    followedCards_page.value,
    followedCards_per_page.value
  );
  if (res?.data) {
    process(res?.data);
    await localforage.setItem(
      "followedCards",
      JSON.parse(JSON.stringify(res?.data))
    );
  }
};
const getMoreFollowedCardsFn = async () => {
  followedCards_page.value++;
  await getFollowedCardsCardsFn(me.value.id);
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
      (j) => j.subject === "executor" && j.by_user?.id === me.value?.id
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
  { val: "executor", icon: "", name: "我负责的" },
  { val: "related", icon: "", name: "与我相关" },
  { val: "followed", icon: "", name: "我关心的" },
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

const QuadrantChange = async (_id, _params) => {
  console.log("_params", _id, _params);
  cards.value.find((i) => i.id === _id).urgency = _params.data?.urgency;
  cards.value.find((i) => i.id === _id).importance = _params.data?.importance;
  await localforage.setItem("cards", JSON.parse(JSON.stringify(cards.value)));
};
</script>
