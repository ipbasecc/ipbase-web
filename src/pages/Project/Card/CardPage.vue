<template>
  <div
    class="fit q-space row no-wrap radius-sm border shadow-focus"
    :class="$q.dark.mode ? 'bg-grey-10' : 'bg-grey-1'"
  >
    <section class="column no-wrap gap-xs border-right">
      <q-tabs v-model="current_model" vertical style="width: 76px">
        <q-tab
          v-for="i in card_models"
          :key="i.id"
          :name="i.relation"
          :icon="i.icon"
          :label="i.name"
          class="q-px-md"
        />
      </q-tabs>
      <q-space />
      <div
        v-if="calc_auth('card', 'manageRole', 'card')"
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
    </section>
    <q-layout v-if="projectStore?.card" view="lHh LpR lFf" container>
      <q-header class="transparent">
        <div class="full-width row no-wrap q-px-sm items-center border-bottom">
          <q-btn dense flat icon="menu" @click="toggleLeftDrawer" />
          <q-tabs
            v-if="projectStore?.card && projectStore?.cards"
            v-model="current_card_id"
            no-caps
            dense
            class="q-ml-sm"
          >
            <template v-for="(i, index) in projectStore.cards" :key="i.id">
              <q-tab
                :name="i.id"
                :label="useCardname(i, 12)"
                @click="projectStore.card = i"
                @dblclick="closeCard(i.id, index)"
              >
                <q-tooltip class="no-padding">
                  <q-card bordered class="q-pa-sm"> 双击关闭 </q-card>
                </q-tooltip>
              </q-tab>
            </template>
          </q-tabs>
          <q-space />
          <MembersIndicator
            :isCard="true"
            @click="toggleRightDrawer('member_setting')"
          />
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="add"
            :class="rightDrawerOpen ? '' : 'op-5'"
            :color="rightDrawerOpen ? 'positive' : ''"
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
            :class="rightDrawerOpen ? '' : 'op-5'"
            :color="rightDrawerOpen ? 'positive' : ''"
            @click="toggleRightDrawer('todo')"
          />
          <q-separator spaced inset vertical />
          <q-btn dense round flat icon="close" size="sm" v-close-popup />
        </div>
      </q-header>

      <q-drawer
        show-if-above
        v-model="leftDrawerOpen"
        side="left"
        :width="540"
        class="column no-wrap border-right"
      >
        <div class="full-width row no-wrap items-center border-bottom">
          <q-tabs v-model="side_pannel" inline-label dense stretch shrind>
            <q-tab name="overview" label="概览" />
            <q-tab
              v-if="projectStore.card.chat_service"
              name="chat"
              label="讨论"
            />
          </q-tabs>
          <q-space />
        </div>
        <q-tab-panels v-model="side_pannel" class="q-space">
          <q-tab-panel name="overview" class="no-padding">
            <KeepAlive>
              <OverView wasAttached_to="card" />
            </KeepAlive>
          </q-tab-panel>
          <q-tab-panel
            v-if="projectStore.card.chat_service"
            name="chat"
            class="no-padding"
          >
            <KeepAlive>
              <ChatPage
                :thread_post_id="
                  projectStore.card.chat_service.chatService_postId
                "
                :thread_channel_id="projectStore.card.chat_service.mmChannelId"
              />
            </KeepAlive>
          </q-tab-panel>
        </q-tab-panels>
      </q-drawer>
      <q-drawer
        show-if-above
        v-model="rightDrawerOpen"
        side="right"
        :width="420"
        class="border-right q-pa-xs"
        :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
      >
        <TodoPage
          v-if="rightDrawer === 'todo'"
          :kanban_id="projectStore.card?.card_kanban?.id"
        />
        <MemberManager v-if="rightDrawer === 'member_setting'" :byInfo />
      </q-drawer>

      <q-page-container>
        <q-page>
          <template v-if="current_model === 'card_kanban'">
            <KanbanContainer
              v-if="
                !projectStore.card.private ||
                calc_auth('column', 'read', 'card')
              "
              :project_id="projectStore.project.id"
              :kanban_id="projectStore.card.card_kanban.id"
            />
            <div v-else class="absolute-full flex flex-center op-3">
              您无权查看此内容
            </div>
          </template>
          <template v-if="current_model === 'card_documents'">
            <q-splitter
              v-if="
                !projectStore.card.private ||
                calc_auth('card_document', 'read', 'card')
              "
              v-model="splitterModel"
              :limits
              unit="px"
              class="absolute-full"
            >
              <template v-slot:before>
                <DocumentList
                  :documents="projectStore.card.card_documents"
                  :by_info="byInfo"
                  @enterDocument="enterDocument"
                />
              </template>

              <template v-slot:after>
                <q-scroll-area class="fit">
                  <DocumentBody
                    v-if="document_id"
                    :document_id
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
              current_model === 'card_schedule' &&
              projectStore.card?.schedule?.id
            "
          >
            <SchedulePage
              by="card"
              :schedule_id="projectStore.card.schedule.id"
            />
          </template>
          <template
            v-if="
              current_model === 'card_storage' && projectStore.card?.storage?.id
            "
          >
            <StoragePage :storage_id="projectStore.card.storage.id" by="card" />
          </template>
        </q-page>
      </q-page-container>
    </q-layout>
    <q-dialog v-model="card_setting" persistent>
      <q-card bordered style="min-width: 61dvw">
        <CardSettings :isCard="true" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, watchEffect } from "vue";
import { findCard, updateCard } from "src/api/strapi/project.js";
import OverView from "src/pages/Project/components/project/OverView.vue";
import ChatPage from "src/pages/Project/chat/CardChat.vue";
import TodoPage from "src/pages/Project/todo/TodoPage.vue";
import CardSettings from "src/pages/Project/Card/components/CardSettings.vue";
import MemberManager from "src/pages/Project/components/settings/MemberManager.vue";
import MembersIndicator from "src/pages/Project/components/widgets/MembersIndicator.vue";
import KanbanContainer from "src/pages/Project/Card/KanbanContainer.vue";
import DocumentList from "src/pages/Project/components/project/DocumentList.vue";
import DocumentBody from "src/pages/Project/document/DocumentBody.vue";
import StoragePage from "src/pages/Project/storage/StoragePage.vue";
import SchedulePage from "src/pages/Project/schedule/SchedulePage.vue";

import { useCardname } from "src/hooks/project/useCardname.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useProjectStore from "src/stores/project.js";
import useMmws from "src/stores/mmws.js";
import useUserStore from "src/stores/user.js";
const mm_wsStore = useMmws();
const userStore = useUserStore();

const card_setting = ref(false);
const current_model = ref("card_kanban");
const card_models = ref([
  { id: 1, name: "任务", relation: "card_kanban", icon: "view_kanban" },
  { id: 2, name: "文档", relation: "card_documents", icon: "article" },
  { id: 3, name: "文件", relation: "card_storage", icon: "storage" },
  { id: 4, name: "规划", relation: "card_schedule", icon: "schedule" },
]);
const splitterModel = ref(260);
const limits = ref([160, 480]);

const projectStore = useProjectStore();

const current_card_id = computed(() => projectStore.card?.id);
const byInfo = computed(() => ({
  by: "card",
  card_id: current_card_id.value,
}));

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

const project_members = computed(() => projectStore.project?.project_members);
const card_members = ref();
const getCard = async (card_id) => {
  let res = await findCard(card_id);

  if (res?.data) {
    card_members.value = res.data.card_members;
    projectStore.card = res.data;
    projectStore.cards = [res.data];
    projectStore.all_cards_of_card =
      res.data.card_kanban?.columns?.map((c) => c.cards).flat(2) || [];
  }
};

const closeCard = (id, index) => {
  projectStore.cards = projectStore.cards.filter((i) => i.id !== id);
  projectStore.card = projectStore.cards[index - 1];
  current_card_id.value = projectStore.cards[index - 1].id;
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
    // projectStore.card = res.data;
    let chat_Msg = {
      body: `${userStore.me?.username}向卡片：${useCardname(
        projectStore.card
      )}新增了成员：${member.by_user?.username}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: projectStore.card?.id,
            action: "card_members_update",
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const rightDrawerOpen = ref(false);
const rightDrawer = ref("todo");
const toggleRightDrawer = (val) => {
  if (!rightDrawerOpen.value) {
    rightDrawer.value = val;
    rightDrawerOpen.value = true;
  } else if (val === rightDrawer.value) {
    rightDrawerOpen.value = !rightDrawerOpen.value;
  } else {
    rightDrawer.value = val;
  }
};

const activedCard_id = ref();
watchEffect(() => {
  activedCard_id.value = Number(projectStore.activedCard_id);
});
watch(
  activedCard_id,
  () => {
    if (activedCard_id.value) {
      getCard(activedCard_id.value);
    }
  },
  { immediate: true, deep: false }
);

watch(
  current_model,
  () => {
    if (current_model.value != "card_kanban") {
      leftDrawerOpen.value = false;
      rightDrawerOpen.value = false;
    }
  },
  { immediate: true, deep: false }
);

const current_document = ref();

onBeforeUnmount(() => {
  current_document.value = null;
});

const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
const side_pannel = ref(projectStore.card?.chat_service ? "chat" : "overview");

watch(
  mm_wsStore,
  async () => {
    // console.log(mm_wsStore.event);
    if (mm_wsStore.event?.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "card_documentCreated"
        ) {
          // console.log('card_documentCreated');
          projectStore.card.card_documents.push(strapi.data.body);
          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          function isSameCardId(element) {
            return element.id == projectStore.card.id;
          }
          const card_index = projectStore.cards.findIndex(isSameCardId);
          if (card_index != -1) {
            projectStore.cards[card_index] = projectStore.card;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "card_documentDeleted"
        ) {
          // 修改当前card的文档
          function isSameId(element) {
            return element.id == strapi.data.document_id;
          }
          const doc_index = projectStore.card.card_documents.findIndex(isSameId);
          if (doc_index != -1) {
            projectStore.card.card_documents.splice(doc_index, 1);
          }

          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          function isSameCardId(element) {
            return element.id == projectStore.card.id;
          }
          const card_index = projectStore.cards.findIndex(isSameCardId);
          if (card_index != -1) {
            projectStore.cards[card_index] = projectStore.card;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "card_motifyDocumentTitle"
        ) {
          // 修改当前card的文档
          function isSameId(element) {
            return element.id == strapi.data.document_id;
          }
          var doc_index = projectStore.card.card_documents.findIndex(isSameId);
          if (doc_index != -1) {
            projectStore.card.card_documents[doc_index].title =
              strapi.data.title;
          }

          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          function isSameCardId(element) {
            return element.id == projectStore.card.id;
          }
          var card_index = projectStore.cards.findIndex(isSameCardId);
          if (card_index != -1) {
            projectStore.cards[card_index] = projectStore.card;
          }

          motify_document.value = null;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "card_motifyDocumentContent"
        ) {
          console.log("get document update event");
          projectStore.card.card_documents.find(
            (i) => i.id === strapi.data.document_id
          ).jsonContent = strapi.data.jsonContent;
          current_document.value = projectStore.card.card_documents.find(
            (i) => i.id === strapi.data.document_id
          );
          // 修改当前cards里的对应card，防止下次通过顶部tab切换时还是旧数据
          projectStore.cards
            .find((i) => i.id === projectStore.card.id)
            .card_documents.find(
              (i) => i.id === strapi.data.document_id
            ).jsonContent = strapi.data.jsonContent;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "role_updated"
        ) {
          const res = await getCard(strapi.data.card_id);
          if (res?.data) {
            projectStore.card.member_roles = res.data.member_roles;
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id == projectStore.card?.id &&
          strapi.data.action === "card_members_update"
        ) {
          const res = await getCard(strapi.data.card_id);
          if (res?.data) {
            projectStore.card.card_members = res.data.card_members;
          }
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
