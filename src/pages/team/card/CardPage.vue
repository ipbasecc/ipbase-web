<template>
  <q-card
    v-if="$q.screen.gt.sm"
    :bordered="inDilg"
    :square="!inDilg"
    class="fit q-space no-wrap relative-position"
    :class="`${$q.dark.mode ? 'bg-dark' : 'bg-grey-1'} ${
      !inDilg
        ? 'column absolute-full no-shadow'
        : 'row radius-sm shadow-focus'
    }`"
  >
    <section
      class="no-wrap gap-xs items-center"
      :class="!inDilg ? 'q-px-sm row border-bottom' : 'column border-right'"
    >
      <div v-if="!inDilg" class="row no-wrap items-center gap-xs q-mr-sm">
        <q-btn
          flat
          dense
          size="sm"
          icon="mdi-view-list"
          @click="toggleCardList()"
        />
        <q-btn
          dense
          size="sm"
          flat
          :icon="side_pannel === 'chat' ? 'forum' : 'mdi-developer-board'"
          @click="toggleLeftDrawer"
        />
      </div>
      <q-tabs
        v-model="current_model"
        :dense="!inDilg"
        :vertical="inDilg"
        :inline-label="!inDilg"
        no-caps
        :style="!inDilg ? '' : 'width: 76px'"
        @update:model-value="setLastModel()"
      >
        <q-tab
          v-for="i in card_models"
          :key="i.id"
          :name="i.relation"
          :icon="i.icon"
          :label="$t(i.name)"
          class="q-px-md"
        />
      </q-tabs>
      <template v-if="inDilg">
        <q-space />
        <div
          v-if="useAuths('manageRole', ['card'], members, roles)"
          class="flex flex-center q-mb-md"
        >
          <q-btn
            flat
            dense
            padding="sm"
            icon="tune"
            @click="card_setting = true"
          />
        </div>
      </template>
      <template v-if="!inDilg">
        <q-space />
        <q-btn
          flat
          dense
          size="sm"
          round
          icon="task_alt"
          :class="rightDrawerOpen ? '' : 'op-5'"
          :color="rightDrawerOpen ? 'positive' : ''"
          @click="toggleRightDrawer('todo')"
        />
      </template>
    </section>
    <q-layout
      v-if="teamStore?.card"
      view="lHh LpR lFf"
      container
      class="q-space inner-scroll-hidden"
    >
      <q-header v-if="inDilg" class="transparent">
        <q-bar class="transparent border-bottom" style="height: 2.3rem">
          <q-btn dense flat icon="menu" @click="toggleLeftDrawer" />
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
                    <q-card bordered class="q-pa-sm"> {{ $t('double_click_to_close') }} </q-card>
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
                        <q-item-section>{{ $t('close') }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-popup-proxy>
                </template>
              </q-tab>
            </template>
          </q-tabs>
          <q-space />
          <MembersIndicator
            v-if="card_members"
            :members="card_members"
            @click="toggleRightDrawer('member_setting')"
          />
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="mdi-plus-circle-outline"
            :class="rightDrawerOpen && rightDrawer === 'member_setting' ? '' : 'op-5'"
            :color="rightDrawerOpen && rightDrawer === 'member_setting' ? 'positive' : $q.dark.mode ? 'grey-1' : 'grey-10'"
          >
            <q-menu v-if="project_members">
              <q-list bordered dense class="radius-sm q-pa-xs">
                <q-item
                  v-for="i in project_members"
                  :key="i.id"
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="addCardMember(i)"
                >
                  <q-item-section side>
                    <q-avatar size="sm">
                      <q-img
                        v-if="i.by_user?.profile?.avatar?.url"
                        :src="i.by_user?.profile?.avatar?.url"
                        :ratio="1"
                        spinner-color="primary"
                        spinner-size="82px"
                      />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>{{ i.by_user?.username }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            flat
            dense
            size="sm"
            round
            icon="task_alt"
            :class="rightDrawerOpen && rightDrawer === 'todo' ? '' : 'op-5'"
            :color="rightDrawerOpen && rightDrawer === 'todo' ? 'positive' : $q.dark.mode ? 'grey-1' : 'grey-10'"
            @click="toggleRightDrawer('todo')"
          />
          <q-separator spaced inset vertical />
          <q-btn dense round flat :color="$q.dark.mode ? 'grey-1' : 'grey-10'" icon="close" size="sm" v-close-popup />
        </q-bar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        side="left"
        :width="540"
        class="column no-wrap border-right"
      >
        <div
          class="full-width row no-wrap items-center border-bottom q-pr-sm"
          style="height: 2.3rem"
        >
          <q-tabs v-model="side_pannel" inline-label dense stretch shrind no-caps>
            <q-tab name="overview" :label="$t('overview')" />
            <q-tab v-if="teamStore.card.mm_thread" name="chat" :label="$t('chat')" />
            <q-tab v-if="teamStore.card.feedback" name="feedback" :label="$t('feedback')" />
          </q-tabs>
          <q-space />
        </div>
        <q-tab-panels v-model="side_pannel" class="q-space">
          <q-tab-panel name="overview" class="no-padding">
            <KeepAlive>
              <OverView wasAttached_to="card" class="absolute-full" />
            </KeepAlive>
          </q-tab-panel>
          <q-tab-panel
            v-if="teamStore.card.mm_thread"
            name="chat"
            class="no-padding"
          >
            <KeepAlive>
              <ThreadContainer
                :showToolbar="false"
                :chatInfo
                :showRootpost="false"
              />
            </KeepAlive>
          </q-tab-panel>
          <q-tab-panel name="feedback" class="no-padding">
            <TodoPage
              v-if="current_card_id"
              :assignData="[teamStore.card?.feedback]"
              :isFeedback="true"
              :hideToolbar="true"
              :byInfo>
              <template v-slot:header>
                <q-btn flat dense size="sm" round
                   icon="mdi-refresh"
                   class="q-ml-sm"
                   @click="refetchFeedback(teamStore.card?.id)"
                />
              </template>
            </TodoPage>
            <q-inner-loading :showing="loading">
              <q-spinner-orbit size="2em" color="primary" />
            </q-inner-loading>
          </q-tab-panel>
        </q-tab-panels>
      </q-drawer>
      <q-drawer
        v-model="rightDrawerOpen"
        side="right"
        :width="420"
        bordered
        class="border-left q-pa-xs"
        :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
      >
        <TodoPage
          v-if="rightDrawer === 'todo'"
          class="absolute-full"
          :kanban_id="teamStore.card?.card_kanban?.id"
        />
        <MemberManager
          v-if="rightDrawer === 'member_setting'"
          :byInfo
        >
          <template #tip>
            <div class="column no-wrap fit">
              <div class="col-4 flex flex-center">
                <q-card flat bordered>
                  <q-card-section class="q-px-lg q-py-sm">
                    {{ $t('assign_member') }}:
                    <q-btn
                        flat
                        dense
                        round
                        icon="mdi-plus-circle-outline"
                        color="positive"
                    >
                      <q-menu v-if="project_members">
                        <q-list bordered dense class="radius-sm q-pa-xs">
                          <q-item
                              v-for="i in project_members"
                              :key="i.id"
                              clickable
                              v-close-popup
                              class="radius-xs"
                              @click="addCardMember(i)"
                          >
                            <q-item-section side>
                              <q-avatar size="sm">
                                <q-img
                                    v-if="i.by_user?.profile?.avatar?.url"
                                    :src="i.by_user?.profile?.avatar?.url"
                                    :ratio="1"
                                    spinner-color="primary"
                                    spinner-size="82px"
                                />
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>{{ i.by_user?.username }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-card-section>
                </q-card>
              </div>
            </div>

          </template>
        </MemberManager>
      </q-drawer>

      <q-page-container>
        <q-page :style-fn="resetHeight">
          <template v-if="current_model === 'card_kanban'">
            <KanbanContainer
              v-if="
                !teamStore.card?.private || useAuths('read', ['column'], members, roles)
              "
              :project_id="teamStore.project?.id"
              :kanban_id="teamStore.card?.card_kanban?.id"
            />
            <div v-else class="absolute-full flex flex-center op-3">
              {{ $t('no_premission_to_view') }}
            </div>
          </template>
          <TodoPage
            v-if="current_model === 'card_todo'"
            :assignData="teamStore.card?.todogroups"
            _for="card_todo"
            layout="row"
            class="absolute-full"
            @todogroupSort="_todogroupSort"
            @todogroupUpdate="_todogroupUpdate"
            @deleteTodogroup="deleteTodogroup"
            @createTodogroup="_createTodogroup"
            @todoSort="_todoSort"
          />
          <template v-if="current_model === 'card_documents'">
            <q-splitter
              v-if="
                !teamStore.card.private ||
                useAuths('read', ['card_document'], members, roles)
              "
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
            <div v-else class="absolute-full flex flex-center op-3">
              {{ $t('no_premission_to_view') }}
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
    <!-- <div class="absolute z-max">{{ teamStore.card }}</div> -->
    <q-dialog v-model="card_setting" persistent>
      <q-card bordered style="min-width: 61dvw">
        <CardSettings
          :isCard="true" 
          :members="members"
          :roles="roles"
        />
      </q-card>
    </q-dialog>
  </q-card>
  <div v-else class="column no-wrap" :class="`${$q.dark.mode ? 'bg-dark' : 'bg-grey-1'}`">
    <q-toolbar dark class="transparent">
      <q-btn dense flat round icon="mdi-chevron-left" size="sm" v-close-popup />
      <q-tabs v-model="current_model" dense inline-label shrink>
        <q-tab
          v-for="i in card_models"
          :key="i.id"
          :name="i.relation"
          :label="$t(i.name)"
          class="q-px-xs"
        />
      </q-tabs>
      <q-btn dense flat round icon="task_alt" size="sm"
       :class="current_model === 'private_todo' ? '' : 'op-5'"
       :color="current_model === 'private_todo' ? 'positive' : $q.dark.mode ? 'grey-1' : 'grey-10'"
       @click="current_model = 'private_todo'"
      />
    </q-toolbar>
    <q-tab-panels v-if="teamStore?.card" v-model="current_model" animated class="q-space">
        <q-tab-panel name="card_overview" class="no-padding">
          <OverView wasAttached_to="card" class="absolute-full" />
        </q-tab-panel>
        <q-tab-panel name="card_chat" class="no-padding">
          <ThreadContainer
            v-if="teamStore.card.mm_thread"
            :showToolbar="false"
            :chatInfo
            :showRootpost="false"
          />
        </q-tab-panel>
        <q-tab-panel name="card_feedback" class="no-padding">
          <TodoPage v-if="current_card_id" :assignData="[teamStore.card?.feedback]" :isFeedback="true" :hideToolbar="true" :byInfo>
            <template v-slot:header>
              <q-btn flat dense size="sm" round
                 icon="mdi-refresh"
                 class="q-ml-sm"
                 @click="refetchFeedback(teamStore.card?.id)"
              />
            </template>
          </TodoPage>
          <q-inner-loading :showing="loading">
            <q-spinner-orbit size="2em" color="primary" />
          </q-inner-loading>
        </q-tab-panel>
        <q-tab-panel name="card_kanban" class="no-padding">
          <KanbanContainer
              v-if="
                !teamStore.card?.private || useAuths('read', ['column'], members, roles)
              "
              :project_id="teamStore.project?.id"
              :kanban_id="teamStore.card?.card_kanban?.id"
              :hiddenToolbar="true"
          />
          <div v-else class="absolute-full flex flex-center op-3">
            {{ $t('no_premission_to_view') }}
          </div>
        </q-tab-panel>
        <q-tab-panel name="card_todo" class="no-padding">
          <TodoPage
              v-if="current_model === 'card_todo'"
              :assignData="teamStore.card?.todogroups"
              _for="card_todo"
              layout="column"
              class="absolute-full"
              @todogroupSort="todogroupSort"
              @todogroupUpdate="todogroupUpdate"
              @deleteTodogroup="deleteTodogroup"
              @createTodogroup="createTodogroup"
              @todoSort="todoSort"
          />
        </q-tab-panel>
        <q-tab-panel name="card_documents" class="no-padding">
          <template v-if="!teamStore.card.private || useAuths('read', ['card_document'], members, roles)">
            <DocumentList
                v-if="!document_id"
                :documents="teamStore.card.card_documents"
                :by_info="byInfo"
                @enterDocument="enterDocument"
            />
            <q-scroll-area v-if="document_id" class="fit">
              <DocumentBody
                  :document_id="document_id.toString()"
                  :by_info="byInfo"
              />
            </q-scroll-area>
          </template>
          <div v-else class="absolute-full flex flex-center op-3">
            {{ $t('no_premission_to_view') }}
          </div>
        </q-tab-panel>
        <q-tab-panel name="card_storage" class="no-padding">
          <StoragePage v-if="teamStore.card?.storage?.id" :storage_id="teamStore.card.storage.id" by="card" />
        </q-tab-panel>
        <q-tab-panel name="card_schedule" class="no-padding">
          <SchedulePage v-if="teamStore.card?.schedule?.id" by="card" :schedule_id="teamStore.card.schedule.id" />
        </q-tab-panel>
        <q-tab-panel name="private_todo" class="no-padding">
          <TodoPage
            class="absolute-full"
            :kanban_id="teamStore.card?.card_kanban?.id"
          />
        </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup>
import {
  ref,
  toRefs,
  computed,
  watch,
  onBeforeMount,
  onBeforeUnmount,
  watchEffect,
  provide,
  nextTick
} from "vue";
import { useRoute } from "vue-router";
import { findCard, findCardByShare, findCardFeedback, updateCard, getOneProject } from "src/api/strapi/project.js";
import {_deleteTodogroup, createTodogroup, todogroupSort, todogroupUpdate, todoSort} from "src/hooks/team/useCard";

import OverView from "src/pages/team/components/OverView.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import CardSettings from "./components/CardSettings.vue";
import MemberManager from "src/pages/team/settings/MemberManager.vue";
import MembersIndicator from "src/pages/team/components/MembersIndicator.vue";
import KanbanContainer from "./KanbanContainer.vue";
import DocumentList from "src/pages/team/document/DocumentList.vue";
import DocumentBody from "src/pages/team/document/DocumentBody.vue";
import StoragePage from "src/pages/team/storage/StoragePage.vue";
import SchedulePage from "src/pages/team/schedule/SchedulePage.vue";

import { useCardname } from "src/hooks/project/useCardname.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import ThreadContainer from "../chat/ThreadContainer.vue";
import {
  userStore,
  teamStore,
  mm_wsStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import localforage from "localforage";
import {useQuasar} from 'quasar';

const props = defineProps({
  isExternal: {
    type: Boolean,
    default: false,
  },
  shareInfo: {
    type: Object,
    default: null,
  },
});
const { isExternal, shareInfo } = toRefs(props);
provide("isExternal", isExternal.value);
const inDilg = ref(true);
watchEffect(() => {
  inDilg.value = !isExternal.value && !uiStore.isFocusMode;
})
const emit = defineEmits([
  "closeCardList","todogroupSort","todogroupUpdate",
  "deleteTodogroup","createTodogroup","todoSort",
]);

const resetHeight = (offset, height) => {
  return { minHeight: `calc(${height - offset - 2}px)` }
}

const route = useRoute();
const loading = ref(false);

const card_setting = ref(false);
const splitterModel = ref(260);
const limits = ref([160, 480]);

const current_card_id = computed(() => teamStore?.card?.id);
const byInfo = computed(() => ({
  by: "card",
  card_id: current_card_id.value,
}));
const chatInfo = computed(() => ({
  mm_channel_id: teamStore.project?.mm_channel?.id,
  post_id: teamStore.card?.mm_thread?.id,
}));

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

const project_members = computed(() => teamStore.project?.project_members);
const card_members = ref();
const getCard = async (card_id) => {
  if(loading.value) return
  loading.value = true
  let res
  if(shareInfo.value){
    res = await findCardByShare(shareInfo.value.card_id,shareInfo.value.code,shareInfo.value.by);
  } else {
    res = await findCard(card_id);
  }

  if (res?.data) {
    loading.value = false
    card_members.value = res.data.card_members;
    teamStore.card = res.data;
    teamStore.cards = [res.data];
  }
};
const refetchFeedback = async (card_id) => {
  if(loading.value) return
  loading.value = true
  const res = await findCardFeedback(card_id);
  if(res.data){
    teamStore.card.feedback = res.data
    loading.value = false
  }
}
const isIntro = ref(false);

const members = ref();
const roles = ref();
watchEffect(async () => {
  if (route.name === "teams") {
    isIntro.value = true;
  }
  if (teamStore.card?.belongedInfo?.belonged_project && !teamStore.project) {
    const _project_id = teamStore.card.belongedInfo.belonged_project.id;
    const res = await getOneProject(_project_id);
    if (res?.data) {
      teamStore.project = res.data;
      teamStore.project_id = res.data.id;
    }
  }
  if(uiStore.showMainContentList){
    document_id.value = void 0
  }

  const _cardMembers = cardRef.value?.card_members || [];
  members.value = uniqueById([...project_members.value, ..._cardMembers]);
  const _projectRoles = teamStore?.project?.member_roles || [];
  const _cardRoles = cardRef.value?.member_roles || [];
  // 卡片鉴权需要从project、card判定两个主体，这里直接合并以便UI中判断
  roles.value = [..._projectRoles, ..._cardRoles];
});

const closeCard = (id, index) => {
  teamStore.card = teamStore.cards[index - 1];
  current_card_id.value = teamStore.cards[index - 1].id;
  teamStore.cards = teamStore.cards.filter((i) => i.id !== id);
};

const document_id = ref();
const enterDocument = (_document_id) => {
  document_id.value = _document_id;
};

const addCardMember = async (member) => {
  if (!member.by_user?.id) return;
  const params = {
    new_member: {
      user_id: member.by_user?.id,
    },
  };
  const res = await updateCard(current_card_id.value, params);
  if (res?.data) {
    // teamStore.card = res.data;
    let chat_Msg = {
      body: `${userStore.me?.username}向卡片：${useCardname(
        teamStore.card
      )}新增了成员：${member.by_user?.username}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: teamStore.card?.id,
            action: "card_member_updated",
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
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
const side_pannel = ref(teamStore.card?.mm_thread ? "chat" : "overview");
onBeforeMount(async () => {
  let leftDrawerCache = await localforage.getItem("cardPage_leftDrawer");
  if (leftDrawerCache) {
    leftDrawerOpen.value = leftDrawerCache.leftDrawerOpen;
    side_pannel.value =
      leftDrawerCache.side_pannel && teamStore.card?.mm_thread
        ? "chat"
        : "overview";
  }
  console.log(
    "leftDrawerOpen.value",
    leftDrawerOpen.value,
    "side_pannel.value",
    side_pannel.value
  );
});

const rightDrawerOpen = ref(false);
const rightDrawer = ref(null);
const toggleRightDrawer = async (val) => {
  if (!rightDrawerOpen.value) {
    rightDrawer.value = val;
    rightDrawerOpen.value = true;
  } else if (val === rightDrawer.value) {
    rightDrawerOpen.value = !rightDrawerOpen.value;
  } else {
    rightDrawer.value = val;
  }
  const _cache = {
    rightDrawer: rightDrawer.value,
    rightDrawerOpen: rightDrawerOpen.value,
  };
  const _key = `cardPage_rightDrawer_${activedCard_id.value}`
  await localforage.setItem(_key, _cache);
};
watchEffect(() => {
  if(rightDrawerOpen.value && rightDrawer.value === 'todo' && current_model.value !== 'card_todo'){
    // rightDrawerOpen.value = false
  }
})
const activedCard_id = computed(() => Number(teamStore.activedCard_id));
onBeforeMount(async () => {
  const _key = `cardPage_rightDrawer_${activedCard_id.value}`
  let rightDrawerCache = await localforage.getItem(_key);
  if (rightDrawerCache?.rightDrawer) {
    rightDrawerOpen.value = rightDrawerCache.rightDrawerOpen;
    rightDrawer.value = rightDrawerCache.rightDrawer;
  } else if (isExternal.value) {
    rightDrawerOpen.value = false;
    rightDrawer.value = null;
  } else {
    rightDrawerOpen.value = true;
    rightDrawer.value = "todo";
  }
});

const card_models = ref([
  { id: 1, name: "task", relation: "card_kanban", icon: "view_kanban" },
  { id: 2, name: "todo", relation: "card_todo", icon: "task_alt" },
  { id: 3, name: "document", relation: "card_documents", icon: "article" },
  { id: 4, name: "file", relation: "card_storage", icon: "storage" },
  { id: 5, name: "schedule", relation: "card_schedule", icon: "schedule" },
]);
const $q = useQuasar();
onBeforeMount(() => {
  if(!$q.screen.gt.sm){
    const _attach = [
      { id: 10, name: "overview", relation: "card_overview", icon: "view_kanban" },
      { id: 11, name: "chat", relation: "card_chat", icon: "view_kanban" }
    ]
    if(teamStore.card?.feedback){
      _attach.push({ id: 12, name: "feedback", relation: "card_feedback", icon: "view_kanban" })
    }
    card_models.value = [..._attach, ...card_models.value];
  }
})
const current_model = ref("card_kanban");
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
watch(
  activedCard_id,
  () => {
    if (activedCard_id.value) {
      if (teamStore.cards?.map((i) => i.id).includes(activedCard_id.value)) {
        teamStore.card = teamStore.cards.find(
          (i) => i.id === activedCard_id.value
        );
        card_members.value = teamStore.card.card_members;
      } else {
        getCard(activedCard_id.value);
      }
      autoSetModel();
    }
  },
  { immediate: true, deep: false }
);

const current_document = ref();
onBeforeUnmount(() => {
  current_document.value = null;
  if (isIntro.value) {
    teamStore.project = null;
    teamStore.project_id = NaN;
  }
});

const toggleCardList = () => {
  uiStore.externalCardsDrawer = !uiStore.externalCardsDrawer;
};

const _todogroupSort = async (sort) => {
  console.log('top _todogroupSort', sort)
  await todogroupSort(teamStore.card, sort);
};
const _todogroupUpdate = async (old_group, group) => {
  await todogroupUpdate(teamStore.card, old_group, group);
};
const deleteTodogroup = async (group) => {
  await _deleteTodogroup(teamStore.card, group);
};
const _createTodogroup = async (group) => {
  // console.log('get emit createTodogroup cardItem')
  await createTodogroup(teamStore.card, group);
};
const _todoSort = async (group, sort) => {
  // console.log('_todoSort carditem')
  await todoSort(teamStore.card, group, sort);
};

const syncCardInList = () => {
  emit("syncCardInList", teamStore.card);
};

watch(
  mm_wsStore,
  async () => {
    // console.log(mm_wsStore.event);
    if (mm_wsStore.event?.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      // console.log(mm_wsStore?.clientId, post?.props?.clientId);
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_documentCreated"
        ) {
          // console.log('card_documentCreated');
          teamStore.card.card_documents.push(strapi.data.body);
          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          const isSameCardId = (element) => {
            return element.id === teamStore.card.id;
          }
          const card_index = teamStore.cards.findIndex(isSameCardId);
          if (card_index !== -1) {
            teamStore.cards[card_index] = teamStore.card;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_documentDeleted"
        ) {
          // 修改当前card的文档
          const isSameId = (element) => {
            return element.id === strapi.data.document_id;
          }
          const doc_index = teamStore.card.card_documents.findIndex(isSameId);
          if (doc_index !== -1) {
            teamStore.card.card_documents.splice(doc_index, 1);
          }

          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          const isSameCardId = (element) => {
            return element.id === teamStore.card.id;
          }
          const card_index = teamStore.cards.findIndex(isSameCardId);
          if (card_index !== -1) {
            teamStore.cards[card_index] = teamStore.card;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_motifyDocumentTitle"
        ) {
          // 修改当前card的文档
          const isSameId = (element) => {
            return element.id === strapi.data.document_id;
          }
          const doc_index = teamStore.card.card_documents.findIndex(isSameId);
          if (doc_index !== -1) {
            teamStore.card.card_documents[doc_index].title = strapi.data.title;
          }

          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          const isSameCardId = (element) => {
            return element.id === teamStore.card.id;
          }
          const card_index = teamStore.cards.findIndex(isSameCardId);
          if (card_index !== -1) {
            teamStore.cards[card_index] = teamStore.card;
          }

          motify_document.value = null;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_motifyDocumentContent"
        ) {
          // console.log("get document update event");
          teamStore.card.card_documents.find(
            (i) => i.id === strapi.data.document_id
          ).jsonContent = strapi.data.jsonContent;
          current_document.value = teamStore.card.card_documents.find(
            (i) => i.id === strapi.data.document_id
          );
          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          teamStore.cards
            .find((i) => i.id === teamStore.card.id)
            .card_documents.find(
              (i) => i.id === strapi.data.document_id
            ).jsonContent = strapi.data.jsonContent;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "role_updated"
        ) {
          const res = await getCard(strapi.data.card_id);
          if (res?.data) {
            teamStore.card.member_roles = res.data.member_roles;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_member_updated"
        ) {
          const res = await getCard(strapi.data.card_id);
          if (res?.data) {
            teamStore.card.card_members = res.data.card_members;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_member_removed"
        ) {
          teamStore.card.card_members = teamStore.card.card_members.filter(
            (i) => i.id !== strapi.data.member_id
          );
          card_members.value = teamStore.card.card_members;
        }

        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todogroup_deleted"
        ) {
          teamStore.card.todogroups = teamStore.card.todogroups.filter(
            (i) => i.id !== strapi.data.id
          );
          syncCardInList();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_todogroup_created"
        ) {
          if (teamStore.card.todogroups?.length > 0) {
            teamStore.card.todogroups = [
              ...teamStore.card.todogroups,
              strapi.data.body,
            ];
          } else {
            teamStore.card.todogroups = [strapi.data.body];
          }
          syncCardInList();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todogroup_order"
        ) {
          // console.log('ws card_todogroup_order', all_todogroups.value)
          const all_todogroups = teamStore.card.todogroups
          if (all_todogroups?.length > 0) {
            const order = strapi.data.order;
            if (!order || order.length === 0) {
              teamStore.card.todogroups = [];
            } else {
              // 检查当前内容是否包含新的order中的所有元素
              // 如果包含，说明是内部移动
              // 否则，说明是从别处移入的，聚焦模式、外部协作模式不允许初始化所有元素集合，因此只能从新请求数据
              const _tmp = strapi.data.order.map((i) =>
                all_todogroups.find((t) => t.id === i)
              );

              if (_tmp.includes(undefined)) {
                await getCard(teamStore.card?.id)
              } else {
                teamStore.card.todogroups = _tmp
              }
            }
          }
          syncCardInList();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todogroup_update"
        ) {
          // console.log("todogroupUpdate");
          const isSameId = (element) => {
            return element.id === strapi.data.body.id;
          };
          const index = teamStore.card.todogroups.findIndex(isSameId);
          if (index !== -1) {
            let todos = teamStore.card.todogroups[index].todos;
            teamStore.card.todogroups[index] = {
              ...strapi.data.body,
              todos: todos,
            };
          }
          syncCardInList();
        }
        if (
          strapi.data?.is === "todogroup" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todo_sort" &&
          teamStore.card?.todogroups
            ?.map((i) => i.id)
            ?.includes(strapi.data.group_id)
        ) {
          const all_todos = teamStore.card.todogroups?.filter(i => i.todos.length > 0)?.map(j => j.todos).flat(2)
          const sort = strapi.data.sort;
          const _todos = sort.map((order) =>
            all_todos.find((todo) => todo.id === order)
          );
          // 检查当前内容是否包含新的order中的所有元素
          // 如果包含，说明是内部移动
          // 否则，说明是从别处移入的，聚焦模式、外部协作模式不允许初始化所有元素集合，因此只能从新请求数据
          if (_todos.includes(undefined)) {
            await getCard(teamStore.card?.id)
          }
          teamStore.card.todogroups = teamStore.card.todogroups.map((g) => ({
            ...g,
            todos: g.id === strapi.data.group_id ? _todos : g.todos,
          }));
          syncCardInList();
        }

        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todo_created"
        ) {
          // console.log("card_todo_created ws", strapi.data);
          teamStore.card.todogroups = teamStore.card.todogroups.map((g) => ({
            ...g,
            todos:
              (g.id === Number(strapi.data.group_id) &&
                (g.todos?.length > 0 &&
                !g.todos.map((todo) => todo.id).includes(strapi.data.body.id)
                  ? [...g.todos, strapi.data.body]
                  : [strapi.data.body])) ||
              g.todos,
          }));
          syncCardInList();
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "card_todo_updated"
        ) {
          // console.log("card_todo_updated ws");
          teamStore.card.todogroups = teamStore.card.todogroups.map((g) => ({
            ...g,
            todos: g.todos.map((t) =>
              t.id === strapi.data.todo_id ? strapi.data.body : t
            ),
          }));
          syncCardInList();
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === teamStore.card.id &&
          strapi.data.action === "card_todo_deleted"
        ) {
          teamStore.card.todogroups = teamStore.card.todogroups?.map((g) => ({
            ...g,
            todos: g.todos?.filter((t) => t.id !== Number(strapi.data.todo_id)),
          }));
          syncCardInList();
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
