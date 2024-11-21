<template>
  <div
    v-if="!errMsg"
    class="absolute-full q-space no-wrap radius-sm shadow-focus"
    v-bind="$attrs"
    :class="`${$q.dark.mode ? 'bg-dark' : 'bg-grey-1'} ${$q.screen.gt.xs ? 'row' : 'column reverse'}`"
  >
    <section
      class="no-wrap gap-xs items-center border-right q-py-sm"
      :class="$q.screen.gt.xs ? 'column' : 'row'"
    >
      <q-tabs
        v-model="current_model"
        :vertical="$q.screen.gt.xs"
        :style="$q.screen.gt.xs ? 'width: 76px' : ''"
        @update:model-value="setLastModel()"
      >
        <q-tab
            v-if="!$q.screen.gt.xs"
            name="overview"
            icon="mdi-developer-board"
            :label="$t('overview')"
            class="q-px-md"
        />
        <template v-for="i in enabled_byShare" :key="i.id">
          <q-tab
            :name="i.relation"
            :icon="i.icon"
            :label="$t(i.name)"
            class="q-px-md"
            @click="!$q.screen.gt.xs && toggleDocumentList()"
          />
        </template>
      </q-tabs>
    </section>
    <q-layout
      v-if="teamStore?.card"
      view="lHh LpR lFf"
      container
      class="q-space inner-scroll-hidden"
    >
      <q-header class="transparent column no-wrap">
        <q-bar v-if="enabled_byShare.includes('card_kanban')" class="transparent border-bottom" style="height: 2.3rem">
          <q-btn v-if="$q.screen.gt.xs" dense flat icon="menu" @click="toggleLeftDrawer" />
          <q-tabs
            v-if="teamStore?.card && teamStore?.cards"
            v-model="current_card_id"
            no-caps
            dense
            class="q-ml-sm"
          >
            <template v-for="(i, index) in teamStore.cards" :key="i.id">
              <q-tab
                :name="i.id"
                :label="useCardname(i, 12)"
                @click="teamStore.card = i"
                @dblclick="closeCard(i.id, index)"
              >
                <template v-if="teamStore.cards.length > 1">
                  <q-tooltip class="no-padding">
                    <q-card bordered class="q-pa-sm"> {{$t('double_click_to_close')}} </q-card>
                  </q-tooltip>
                  <q-popup-proxy context-menu class="radius-sm">
                    <q-list bordered dense class="q-pa-xs radius-sm">
                      <q-item
                        clickable
                        v-close-popup
                        class="radius-xs"
                        @click="closeCard(i.id, index)"
                      >
                        <q-item-section side
                        ><q-icon name="close" size="sm"
                        /></q-item-section>
                        <q-item-section> {{$t('close')}} </q-item-section>
                      </q-item>
                    </q-list>
                  </q-popup-proxy>
                </template>
              </q-tab>
            </template>
          </q-tabs>
          <q-space />
        </q-bar>

        <q-responsive :ratio="16/9">
          <OverView v-if="!$q.screen.gt.xs" wasAttached_to="card" :current_versionRef="current_version" :onlyMedia="true" />
        </q-responsive>
      </q-header>

      <q-drawer
        v-if="$q.screen.gt.xs"
        v-model="leftDrawerOpen"
        side="left"
        :width="540"
        class="column no-wrap border-right"
      >
        <OverView wasAttached_to="card" class="absolute-full" />
      </q-drawer>

      <q-page-container>
        <q-page>
          <template v-if="current_model === 'overview'">
            <OverView wasAttached_to="card" :hideMedia="true" @current_version="set_current_version" class="absolute-full" />
          </template>
          <template v-if="current_model === 'card_kanban'">
            <KanbanContainer
              v-if="teamStore.card?.card_kanban?.columns?.length > 0"
              :kanban_id="teamStore.card?.card_kanban?.id"
            />
            <div v-else class="absolute-full column flex-center">{{ $t('no_subtask') }}...</div>
          </template>
          <template v-if="current_model === 'card_todo'">
            <AffairsContainer
              v-if="teamStore.card?.todogroups?.length > 0"
              :todogroups="teamStore.card?.todogroups"
              :card="teamStore.card"
              _for="card"
              layout="row"
              class="absolute-full"
            />
            <div v-else class="absolute-full column flex-center">{{ $t('no_todos') }}...</div>
          </template>
          <template v-if="current_model === 'card_feedback'" >
            <div v-if="teamStore.card?.feedback" class="absolute-full column items-center">
              <AffairsContainer v-if="teamStore.card.feedback"
                :todogroups="[teamStore.card.feedback]"
                :card="teamStore.card"
                :hideToolbar="true"
                _for="personal_kanbanTodo"
                layout="column"
                class="fit"
              >
                <template v-slot:header>
                  <q-bar dark class="transparent">
                    <q-space />
                    <q-btn flat dense size="sm" round
                      icon="mdi-refresh"
                      class="q-ml-sm"
                      @click="refetchFeedback(teamStore.card?.id)"
                    />
                  </q-bar>
                </template>
              </AffairsContainer>
              <q-inner-loading :showing="loading">
                <q-spinner-orbit size="2em" color="primary" />
              </q-inner-loading>
            </div>
            <div v-else class="absolute-full column flex-center">
              No Feedback Found!
            </div>
          </template>
          <template v-if="current_model === 'card_documents'">
            <q-splitter
                v-if="$q.screen.gt.xs"
              v-model="splitterModel"
              :limits
              unit="px"
              class="absolute-full"
            >
              <template v-slot:before>
                <DocumentList
                  :documents="teamStore.card.card_documents"
                  :by_info="byInfo"
                  @enterDocument="enterDocument"
                />
              </template>

              <template v-slot:after>
                <q-scroll-area class="fit">
                  <DocumentBody
                    v-if="document_id"
                    :document_id="document_id.toString()"
                    :by_info="byInfo"
                  />
                </q-scroll-area>
              </template>
            </q-splitter>
            <div v-else class="absolute-full column no-wrap">
              <DocumentBody
                  v-if="document_id"
                  :document_id="document_id.toString()"
                  :by_info="byInfo"
              />
              <DocumentList
                  v-else
                  :documents="teamStore.card.card_documents"
                  :by_info="byInfo"
                  @enterDocument="enterDocument"
              />
            </div>
          </template>
          <template
            v-if="
              current_model === 'card_schedule' && teamStore.card?.schedule?.id
            "
          >
            <SchedulePage by="card" :schedule_id="teamStore.card.schedule.id" />
          </template>
          <template
            v-if="
              current_model === 'card_storage' && teamStore.card?.storage?.id
            "
          >
            <StoragePage :storage_id="teamStore.card.storage.id" by="card" />
          </template>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
  <div v-else class="absolute-full flex flex-center font-x-large">
    {{ errMsg }}
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  computed,
  watch,
  nextTick,
  watchEffect,
  onBeforeMount
} from "vue";
import {findCardByShare, findCardFeedbackByShare} from 'src/api/strapi/project.js';

import OverView from "src/pages/team/components/OverView.vue";
import KanbanContainer from "../../KanbanContainer.vue";
import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
import DocumentList from "src/pages/team/document/DocumentList.vue";
import DocumentBody from "src/pages/team/document/DocumentBody.vue";
import StoragePage from "src/pages/team/storage/StoragePage.vue";
import SchedulePage from "src/pages/team/schedule/SchedulePage.vue";

import { useCardname } from "src/hooks/project/useCardname.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import localforage from "localforage";

const props = defineProps({
  shareInfo: {
    type: Object,
    default: null,
  },
});
const { shareInfo } = toRefs(props);

const splitterModel = ref(260);
const limits = ref([160, 480]);

const current_card_id = computed(() => teamStore?.card?.id);
const byInfo = computed(() => ({
  by: "card",
  card_id: current_card_id.value,
}));
const loading = ref(false);
const errMsg = ref();
const getCard = async () => {
  if(loading.value) return
  loading.value = true
  let res
  if(shareInfo.value){
    res = await findCardByShare(shareInfo.value.props.card_id,shareInfo.value.code,shareInfo.value.by);
  }

  console.log('res', res);
  
  if (res?.data) {
    loading.value = false
    teamStore.card = res.data;
    teamStore.cards = [res.data];
  } else {
    errMsg.value = res?.response?.data?.error?.message
  }
};
const refetchFeedback = async (card_id) => {
  if(loading.value) return
  loading.value = true
  const res = await findCardFeedbackByShare(card_id,shareInfo.value.code,shareInfo.value.by);
  if(res.data){
    loading.value = false
    teamStore.card.feedback = res.data
  }
}

const current_version = ref();
const set_current_version = (val) => {
  console.log('set_current_version', val);
  current_version.value = val
}

const document_id = ref();
const enterDocument = (_document_id) => {
  document_id.value = _document_id;
};

const leftDrawerOpen = ref(true);
async function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
  const _cache = {
    leftDrawerOpen: leftDrawerOpen.value,
    side_pannel: side_pannel.value,
  };
  await localforage.setItem("cardPage_leftDrawer", _cache);
}
const side_pannel = ref('overview');

const activedCard_id = computed(() => Number(shareInfo.value?.props.card_id));
const card_models = ref([
  { id: 1, name: "task", relation: "card_kanban", icon: "view_kanban" },
  { id: 2, name: "todo", relation: "card_todo", icon: "task_alt" },
  { id: 3, name: "document", relation: "card_documents", icon: "article" },
  { id: 4, name: "file", relation: "card_storage", icon: "storage" },
  { id: 5, name: "schedule", relation: "card_schedule", icon: "schedule" },
  { id: 6, name: "feedback", relation: "card_feedback", icon: "feedback" },
]);
const enabled_byShare = computed(() => {
  let _enables = teamStore.card?.props?.filter((i) => i.enable).map((i) => i.val) || [];
  return _enables?.map((i) => card_models.value.find(j => j.relation === i))
})
const current_model = ref("");
onBeforeMount(() => {
  current_model.value = enabled_byShare.value[0]?.relation || 'overview'
})
const modelKey = computed(() => `__card_${activedCard_id.value}_lastModel`);
const setLastModel = async () => {
  await localforage.setItem(modelKey.value, current_model.value);
};
const autoSetModel = async () => {
  if (!current_card_id.value) {
    await nextTick();
  }
  const _model = await localforage.getItem(modelKey.value);
  if (_model) {
    current_model.value = _model;
  }
};
const toggleDocumentList = () => {
  document_id.value = document_id.value && current_model.value === 'card_documents' ? null : document_id.value;
}
const closeCard = (id, index) => {
  teamStore.card = teamStore.cards[index - 1];
  current_card_id.value = teamStore.cards[index - 1].id;
  teamStore.cards = teamStore.cards.filter((i) => i.id !== id);
};
watch(
  activedCard_id,
  () => {
    if (activedCard_id.value) {
      if (teamStore.cards?.map((i) => i.id).includes(activedCard_id.value)) {
        teamStore.card = teamStore.cards.find(
          (i) => i.id === activedCard_id.value
        );
      } else {
        getCard(activedCard_id.value);
      }
      autoSetModel();
    }
  },
  { immediate: true, deep: false }
);
watchEffect(async () => {
  if(teamStore.card){
    uiStore.pageTitle = useCardname(teamStore.card);
  }
})

</script>

<style lang="scss" scoped></style>
