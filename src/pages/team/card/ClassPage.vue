<template>
  <q-card bordered class="fit q-space no-wrap row radius-sm shadow-focus">
    <q-layout
      v-if="teamStore?.card"
      view="lHh LpR lFf"
      container
      class="q-space inner-scroll-hidden"
    >
      <q-header class="transparent">
        <q-bar
          class="border-bottom"
          :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
          style="height: 2.3rem"
        >
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
                <template v-if="teamStore?.cards?.length > 1">
                  <q-tooltip class="no-padding">
                    <q-card bordered class="q-pa-sm"> 双击关闭 </q-card>
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
                        <q-item-section>关闭</q-item-section>
                      </q-item>
                    </q-list>
                  </q-popup-proxy>
                </template>
              </q-tab>
            </template>
          </q-tabs>
          <q-space />
          <q-btn
            flat
            dense
            size="sm"
            round
            :icon="classExtendIcon()"
            :class="rightDrawerOpen ? '' : 'op-5'"
            :color="rightDrawerOpen ? 'positive' : ''"
            @click="toggleRightDrawer()"
          />
          <q-btn
            dense
            round
            flat
            icon="push_pin"
            :color="drawerOverlay ? '' : 'positive'"
            :class="drawerOverlay ? 'op-5' : ''"
            size="sm"
            @click="drawerOverlay = !drawerOverlay"
          />
          <q-separator spaced inset vertical />
          <q-btn dense round flat icon="close" size="sm" v-close-popup />
        </q-bar>
      </q-header>
      <q-drawer
        v-model="rightDrawerOpen"
        side="right"
        :overlay="drawerOverlay"
        :width="760"
        class="border-left q-pa-xs column no-wrap"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
      >
        <q-toolbar class="transparent border-bottom">
          <q-tabs
            v-model="current_classExtend"
            inline-label
            dense
            no-caps
            shrink
            stretch
          >
            <template v-for="i in classExtends" :key="i.id">
              <q-tab :name="i.name" :icon="i.icon" :label="i.label" />
            </template>
          </q-tabs>
        </q-toolbar>
        <div class="q-space relative-position">
          <template
            v-if="
              teamStore.card.mm_thread && current_classExtend === 'card_forum'
            "
          >
            <KeepAlive>
              <ThreadContainer
                :showToolbar="false"
                :chatInfo
                :showRootpost="false"
              />
            </KeepAlive>
          </template>
          <TodoPage
            v-if="current_classExtend === 'card_note'"
            :kanban_id="teamStore.card?.card_kanban?.id"
            :isClassroom="true"
          />
          <template v-if="current_classExtend === 'card_kanban'">
            <KanbanContainer
              v-if="
                !teamStore.card?.private || useAuths('read', ['column'], members, roles)
              "
              :project_id="teamStore.project?.id"
              :kanban_id="teamStore.card?.card_kanban?.id"
              :hiddenToolbar="true"
            />
            <div v-else class="absolute-full flex flex-center op-3">
              {{ $t(no_premission_to_view) }}
            </div>
          </template>
          <template v-if="current_classExtend === 'card_documents'">
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
              您无权查看此内容
            </div>
          </template>
          <template
            v-if="
              current_classExtend === 'card_storage' &&
              teamStore.card?.storage?.id
            "
          >
            <StoragePage :storage_id="teamStore.card.storage.id" by="card" />
          </template>
        </div>
      </q-drawer>

      <q-page-container>
        <q-page :key="teamStore.card?.id">
          <KeepAlive>
            <OverView wasAttached_to="card" />
          </KeepAlive>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-card>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  watchEffect,
} from "vue";
import { useRoute } from "vue-router";
import { findCard, getOneProject } from "src/api/strapi/project.js";
import { useCardname } from "src/hooks/project/useCardname.js";

import OverView from "src/pages/team/components/OverView.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import KanbanContainer from "./KanbanContainer.vue";
import DocumentList from "src/pages/team/document/DocumentList.vue";
import DocumentBody from "src/pages/team/document/DocumentBody.vue";
import StoragePage from "src/pages/team/storage/StoragePage.vue";

import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import ThreadContainer from "../chat/ThreadContainer.vue";
import {
  teamStore,
  mm_wsStore,
  uiStore,
} from "src/hooks/global/useStore.js";

const emit = defineEmits(["closeCardList"]);
const route = useRoute();

const current_classExtend = ref("card_forum");
const classExtends = ref([
  { id: 0, label: "讨论", name: "card_forum", icon: "forum" },
  { id: 1, label: "延伸课", name: "card_kanban", icon: "view_kanban" },
  { id: 2, label: "文档", name: "card_documents", icon: "article" },
  { id: 3, label: "文件", name: "card_storage", icon: "storage" },
  {
    id: 6,
    label: "笔记",
    name: "card_note",
    icon: "mdi-checkbox-marked-outline",
  },
]);
const splitterModel = ref(260);
const limits = ref([160, 480]);
const drawerOverlay = ref(true);

const current_card_id = computed(() => teamStore.card?.id);
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


const getCard = async (card_id) => {
  let res = await findCard(card_id);

  if (res?.data) {
    card_members.value = res.data.card_members;
    teamStore.card = res.data;
    teamStore.cards = [res.data];
  }
};
const isIntro = ref(false);
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

const rightDrawerOpen = ref(false);
const classExtendIcon = () => {
  const _cur_extend = classExtends.value.find(
    (i) => i.name === current_classExtend.value
  );
  return _cur_extend.icon;
};
const toggleRightDrawer = (val) => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const activedCard_id = computed(() => Number(teamStore.activedCard_id));
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

const leftDrawerOpen = ref(true);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
const side_pannel = ref(teamStore.card?.mm_thread ? "chat" : "overview");

const toggleCardList = () => {
  uiStore.externalCardsDrawer = !uiStore.externalCardsDrawer;
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
          function isSameId(element) {
            return element.id === strapi.data.document_id;
          }
          const doc_index = teamStore.card.card_documents.findIndex(isSameId);
          if (doc_index !== -1) {
            teamStore.card.card_documents[doc_index].title = strapi.data.title;
          }

          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          function isSameCardId(element) {
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
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
