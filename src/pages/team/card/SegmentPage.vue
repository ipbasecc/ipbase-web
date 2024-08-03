<template>
  <q-layout
    v-if="teamStore?.card"
    view="hHh lpR fFf"
    container
    class="q-space inner-scroll-hidden"
    @mousemove="handleMouseMove" @mouseup="handleMouseUp"
  >
    <q-drawer
      v-model="uiStore.segmentDrawer"
      side="right"
      :width="rightDrawerWidth"
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
            <q-tab :name="i.name" :icon="i.icon" :label="$t(i.label)" />
          </template>
        </q-tabs>
      </q-toolbar>
      <div class="q-space relative-position">
        <OverView
          v-if="teamStore.card.mm_thread && current_classExtend === 'overview'"
          wasAttached_to="card"
          :hideMedia="true"
        />
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
          :hideToolbar="true"
          _for="segment"
          class="fit"
        />
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
            {{ $t('no_premission_to_view') }}
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
      <div v-if="dragRightDrawerWidth" class="absolute-full"></div>
      <div
        class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
        :class="dragRightDrawerWidth ? 'bg-primary ' : ''"
        :style="dragRightDrawerWidth ? 'width: 3px' : 'width: 10px'"
        @mousedown="handleMouseDown"
      >
      </div>
    </q-drawer>

    <q-page-container>
      <q-page :key="teamStore.card?.id" class="flex flex-center bg-black">
        <div class="absolute-top-right items-center no-wrap q-pa-md row z-max">
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
          <q-separator spaced inset vertical />
          <q-btn dense round flat icon="close" size="sm" @click="close()" />
        </div>
        <KeepAlive>
          <OverView wasAttached_to="card" :onlyMedia="true" />
        </KeepAlive>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {ref, computed, watch, onBeforeUnmount, watchEffect, reactive} from "vue";
import { useRoute } from "vue-router";
import { findCard, getOneProject } from "src/api/strapi/project.js";
import {onKeyStroke, useMouse} from '@vueuse/core';

import OverView from "src/pages/team/components/OverView.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import DocumentList from "src/pages/team/document/DocumentList.vue";
import DocumentBody from "src/pages/team/document/DocumentBody.vue";
import StoragePage from "src/pages/team/storage/StoragePage.vue";

import ThreadContainer from "../chat/ThreadContainer.vue";
import { teamStore, mm_wsStore, uiStore } from "src/hooks/global/useStore.js";

const emit = defineEmits(["closeCardList"]);
const route = useRoute();

const rightDrawerWidth = ref(540);
const dragRightDrawerWidth = ref(false);
const { x } = useMouse({ touch: false })
const rightDrawerMinWidth = ref(506);
const rightDrawerMaxWidth = ref(860);
const _ori_width = ref()
const position = reactive({
  x: NaN,
  y: NaN
})
const handleMouseDown = () => {
  position.x = x.value;
  dragRightDrawerWidth.value = true
  _ori_width.value = rightDrawerWidth.value
  uiStore.draging = true
}
const handleMouseUp = () => {
  dragRightDrawerWidth.value = false
  uiStore.draging = false
}
const handleMouseMove = () => {
  if(!position.x || !dragRightDrawerWidth.value || !_ori_width.value) return

  const deltaX = position.x - x.value;
  if(_ori_width.value + deltaX >= rightDrawerMinWidth.value && _ori_width.value + deltaX <= rightDrawerMaxWidth.value){
    rightDrawerWidth.value = _ori_width.value + deltaX
  } else if(_ori_width.value + deltaX > rightDrawerMaxWidth.value) {
    rightDrawerWidth.value = rightDrawerMaxWidth.value
  } else if(_ori_width.value + deltaX === rightDrawerMaxWidth.value) {
    rightDrawerWidth.value = rightDrawerMinWidth.value
  } else if(_ori_width.value + deltaX < 50) {
    rightDrawerOpen.value = false
  }
}

const current_classExtend = ref("card_forum");
const classExtends = ref([
  { id: 0, label: "overview", name: "overview", icon: "mdi-developer-board" },
  { id: 1, label: "chat", name: "card_forum", icon: "forum" },
  {
    id: 2,
    label: "todo",
    name: "card_note",
    icon: "mdi-checkbox-marked-outline",
  },
  { id: 3, label: "document", name: "card_documents", icon: "article" },
  { id: 4, label: "file", name: "card_storage", icon: "storage" },
]);
const splitterModel = ref(260);
const limits = ref([160, 480]);

const current_card_id = computed(() => teamStore.card?.id);
const byInfo = computed(() => ({
  by: "card",
  card_id: current_card_id.value,
}));
const chatInfo = computed(() => ({
  mm_channel_id: teamStore.project?.mm_channel?.id,
  post_id: teamStore.card?.mm_thread?.id,
}));

const card_members = ref();
const getCard = async (card_id) => {
  let res = await findCard(card_id);

  if (res?.data) {
    card_members.value = res.data.card_members;
    teamStore.card = res.data;
    teamStore.cards = [res.data];
  }
};
const isIntro = ref(false);
const members = ref();
const roles = ref();
const project_members = computed(() => teamStore.project?.project_members);
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
  // if(uiStore.showMainContentList){
  //   document_id.value = void 0
  // }

  const _cardMembers = cardRef.value?.card_members || [];
  members.value = uniqueById([...project_members.value, ..._cardMembers]);
  const _projectRoles = teamStore?.project?.member_roles || [];
  const _cardRoles = cardRef.value?.member_roles || [];
  // 卡片鉴权需要从project、card判定两个主体，这里直接合并以便UI中判断
  roles.value = [..._projectRoles, ..._cardRoles];
});

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
const toggleRightDrawer = () => {
  uiStore.segmentDrawer = !uiStore.segmentDrawer;
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

const close = () => {
  uiStore.activeReel = NaN;
  uiStore.reelHeight = uiStore.reelHeight_SC;
};
onKeyStroke(['Escape'], (e) => {
  e.preventDefault();
  close()
});

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
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
