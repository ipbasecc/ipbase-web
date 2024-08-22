<template>
  <tr class="hovered-item relative-position">
    <td v-if="!teamStore.shareInfo">
      <div class="fit flex flex-center hover-show dragBar">
        <q-icon name="drag_indicator" />
      </div>
    </td>
    <!-- 状态 -->
    <td class="status">
      <StatusMenu
        v-if="show_byPreference?.status?.value || teamStore.shareInfo"
        :modify="useAuths('status', ['card']) || isCreator"
        :status="cardRef.status"
        @statusChange="_card_statusChange"
        class="undrag"
      />
    </td>
    <!-- 预览图 -->
    <td class="thumbnial">
      <FileViewer
        v-if="default_version?.media"
        :file="default_version?.media"
        :videoOption="videoOption"
        :clean="true"
        by="table"
        style="width: 200px"
        mainStyle="no-padding"
      />
    </td>
    <!-- 名称 -->
    <td class="name">
      {{ cardRef.name }}
      <q-popup-proxy cover ref="renamePopup">
        <q-card bordered class="q-pa-xs">
          <q-input
            v-model="updateParmars.data.name"
            dense
            square
            filled
            hide-bottom-space
            type="text"
            :placeholder="cardRef.name"
            @keyup.enter="_updateCardName(cardRef, updateParmars.data.name)"
          >
            <template #append v-if="updateParmars.data.name">
              <q-btn
                round
                dense
                size="sm"
                flat
                icon="check"
                @click="_updateCardName(cardRef, updateParmars.data.name)"
              />
            </template>
          </q-input>
        </q-card>
      </q-popup-proxy>
    </td>
    <!-- 内容 -->
    <td class="content">
      <TipTap
        :jsonContent="cardRef.jsonContent"
        :editable="
          content_channging &&
          (useAuths('jsonContent', ['card']) || isCreator) &&
          !teamStore.shareInfo
        "
        :need="'json'"
        :clickOutsideSave="true"
        :autofocus="true"
        :square="true"
        :show_toolbar="false"
        :toolbarHeight="34"
        styleClass="q-py-sm q-px-md"
        class="undrag"
        @tiptapBlur="tiptapBlur"
        @click.stop="content_channging = true"
        @keydown.esc="content_channging = false"
      />
    </td>
    <!-- 清单 -->
    <td class="todos">
      <q-btn
        v-if="cardRef.type === 'todo'"
        :color="cardRef.todogroups?.length > 0 ? 'primary' : ''"
        flat
        icon="checklist"
        dense
        @click="todoDlg = true"
      >
        <q-dialog v-model="todoDlg" persistent @hide="todoDlg = false">
          <q-card
            bordered
            style="min-width: 360px; min-height: 240px"
            class="column"
          >
            <q-toolbar class="transparent border-bottom">
              <q-space />
              <q-btn flat dense round icon="close" v-close-popup />
            </q-toolbar>
            <q-card-section class="q-space">
              <TodoPage
                :card="cardRef"
                :card_id="cardRef.id"
                :isCreator="isCreator"
                :isPrivate="cardRef.private"
                :uiOptions="uiOptions"
                @todogroupSort="_todogroupSort"
                @todogroupUpdate="_todogroupUpdate"
                @deleteTodogroup="deleteTodogroup"
                @createTodogroup="_createTodogroup"
                @todoSort="_todoSort"
                @disableAction="disableAction"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-btn>
    </td>
    <!-- 分值 -->
    <td class="score">
      <q-chip
        v-if="show_byPreference?.score?.value"
        dense
        square
        outline
        color="teal"
        icon="score"
        class="font-small"
        :class="
          useAuths('score', ['card']) || isCreator
            ? 'cursor-pointer'
            : ''
        "
      >
        {{ $t('score') }}：{{ cardRef.score }}
        <q-popup-proxy
          cover
          v-if="useAuths('score', ['card']) || isCreator"
          class="shadow-24"
        >
          <q-card bordered flat class="row no-wrap gap-xs items-center q-pa-xs">
            <q-btn
              v-for="i in scores"
              :key="i"
              no-caps
              :color="
                (updateParmars.data.score === i || cardRef.score === i) &&
                'primary'
              "
              :label="i"
              v-close-popup
              @click="_setScore(i)"
            />
          </q-card>
        </q-popup-proxy>
      </q-chip>
    </td>
    <!-- 进度 -->
    <td class="progress">
      <span v-if="cardRef.type === 'todo'">{{ todo_process }}%</span>
    </td>
    <!-- 关注者 -->
    <td v-if="!teamStore.shareInfo" class="follow">
      <div
        v-if="show_byPreference?.follow?.value"
        class="row no-wrap items-center gap-xs"
      >
        <overlappingAvatar
          v-if="cardRef.followed_bies?.length > 0"
          :members="cardRef.followed_bies"
          :size="22"
          @click="unfollowCard(cardRef)"
          class="undrag cursor-pointer"
        >
          <template #tooltip>
            <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
              {{ $t('followed_card') }}
            </q-tooltip>
          </template>
        </overlappingAvatar>
        <q-btn
          v-if="
            !is_followed &&
            (useAuths('followed_bies', ['card']) || isCreator)
          "
          dense
          round
          flat
          size="sm"
          class="hover-show transition undrag cursor-pointer"
          icon="bookmark_add"
          @click="followCard(cardRef)"
        >
          <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
            {{ $t('followed_card') }}
          </q-tooltip>
        </q-btn>
      </div>
    </td>
    <!-- 操作 -->
    <td v-if="!teamStore.shareInfo" class="more">
      <q-icon
        :name="
          color_marker && show_byPreference?.color_marker?.value
            ? 'mdi-checkbox-blank-circle'
            : 'more_vert'
        "
        :color="
          color_marker && show_byPreference?.color_marker?.value
            ? color_marker
            : 'grey'
        "
        class="cursor-pointer undrag"
      >
        <q-menu class="shadow-24">
          <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
            <template v-if="!content_channging">
              <q-item class="radius-xs">
                <q-item-section>
                  <div class="row no-wrap gap-sm">
                    <q-btn
                      v-if="cardRef.type === 'task'"
                      flat
                      dense
                      size="sm"
                      stack
                      icon="mdi-arrow-expand"
                      class="op-5"
                      padding="sm"
                      @click="
                        _enterCard(
                          useAuths('read', ['card']) || isCreator
                        )
                      "
                    >
                      <q-tooltip>
                        <span class="font-medium">{{ $t('task_detial') }}</span>
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="useAuths('name', ['card']) || isCreator"
                      flat
                      dense
                      size="sm"
                      stack
                      icon="title"
                      class="op-5"
                      padding="sm"
                      @click="name_changing = true"
                    >
                      <q-tooltip>
                        <span class="font-medium">{{ $t('rename_card') }}</span>
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
              <q-separator spaced class="op-5" />
            </template>
            <q-item
              v-if="
                show_byPreference?.color_marker?.value &&
                (useAuths('color_marker', ['card']) || isCreator)
              "
            >
              <q-item-section>
                <div class="row no-wrap gap-sm">
                  <q-icon
                    v-for="marker in colorMarks"
                    :key="marker"
                    dense
                    :size="cardRef?.color_marker === marker ? '24px' : '16px'"
                    flat
                    round
                    padding="none"
                    :color="marker"
                    :name="
                      cardRef?.color_marker === marker
                        ? 'mdi-checkbox-marked-circle'
                        : 'mdi-checkbox-blank-circle'
                    "
                    class="cursor-pointer"
                    v-close-popup
                    @click="setCardColor(cardRef, marker)"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator
              v-if="
                useAuths('type', ['card']) ||
                useAuths('status', ['card']) ||
                isCreator
              "
              spaced
              class="op-5"
            />
            <q-item
              v-if="useAuths('type', ['card']) || isCreator"
              class="radius-xs"
              clickable
            >
              <q-item-section>{{ $t('change_to') }}：</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start">
                <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                  <q-item
                    v-for="i in cardTypes"
                    :key="i.val"
                    dense
                    clickable
                    class="radius-xs"
                    :class="i.val === cardRef.type ? 'bg-primary' : ''"
                    @click="setCardType(cardRef, i.val)"
                  >
                    <q-item-section side
                      ><q-icon :name="i.icon" size="xs"
                    /></q-item-section>
                    <q-item-section
                      ><span class="q-pr-md">{{
                        i.label
                      }}</span></q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-item
              v-if="
                (useAuths('status', ['card']) || isCreator) &&
                cardRef.type === 'task' &&
                show_byPreference?.status?.value
              "
              class="radius-xs"
              clickable
            >
              <q-item-section>{{ $t('status') }}：</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start">
                <StatusMenu
                  :status="cardRef.status"
                  :modify="true"
                  @statusChange="_card_statusChange"
                  :isList="true"
                />
              </q-menu>
            </q-item>
            <template
              v-if="useAuths('delete', ['card']) || isCreator"
            >
              <q-separator spaced class="op-5" />
              <q-item
                class="radius-xs"
                clickable
                v-close-popup
                @click="removeCard(cardRef, belong_card)"
              >
                <q-item-section>{{ $t('delete_card') }}</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
        <!-- 对话框中，需要使用esc来取消输入框的聚焦状态，这里关闭组件的esc事件 -->
        <q-dialog
          v-model="show_cardDetial"
          full-height
          full-width
          persistent
          no-shake
          transition-show="slide-down"
          transition-hide="slide-up"
          transition-duration="300"
          @show="teamStore.showCards = true"
          @hide="leaveCard()"
          class="blur-sm transition"
        >
          <CardPage />
        </q-dialog>
      </q-icon>
    </td>
    <q-popup-proxy v-if="!teamStore.shareInfo" context-menu>
      <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
        <template v-if="!content_channging">
          <q-item class="radius-xs">
            <q-item-section>
              <div class="row no-wrap gap-sm">
                <q-btn
                  v-if="cardRef.type === 'task'"
                  flat
                  dense
                  size="sm"
                  stack
                  icon="mdi-arrow-expand"
                  class="op-5"
                  padding="sm"
                  @click="
                    _enterCard(
                      useAuths('read', ['card']) || isCreator
                    )
                  "
                >
                  <q-tooltip>
                    <span class="font-medium">{{ $t('task_detial') }}</span>
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-if="useAuths('name', ['card']) || isCreator"
                  flat
                  dense
                  size="sm"
                  stack
                  icon="title"
                  class="op-5"
                  padding="sm"
                  @click="name_changing = true"
                >
                  <q-tooltip>
                    <span class="font-medium">{{ $t('rename_card') }}</span>
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced class="op-5" />
        </template>
        <q-item
          v-if="
            show_byPreference?.color_marker?.value &&
            (useAuths('color_marker', ['card']) || isCreator)
          "
        >
          <q-item-section>
            <div class="row no-wrap gap-sm">
              <q-icon
                v-for="marker in colorMarks"
                :key="marker"
                dense
                :size="cardRef?.color_marker === marker ? '24px' : '16px'"
                flat
                round
                padding="none"
                :color="marker"
                :name="
                  cardRef?.color_marker === marker
                    ? 'mdi-checkbox-marked-circle'
                    : 'mdi-checkbox-blank-circle'
                "
                class="cursor-pointer"
                v-close-popup
                @click="setCardColor(cardRef, marker)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-separator
          v-if="
            useAuths('type', ['card']) ||
            useAuths('status', ['card']) ||
            isCreator
          "
          spaced
          class="op-5"
        />
        <q-item
          v-if="useAuths('type', ['card']) || isCreator"
          class="radius-xs"
          clickable
        >
          <q-item-section>{{ $t('change_to') }}：</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu auto-close anchor="top end" self="top start">
            <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
              <q-item
                v-for="i in cardTypes"
                :key="i.val"
                dense
                clickable
                class="radius-xs"
                :class="i.val === cardRef.type ? 'bg-primary' : ''"
                @click="setCardType(cardRef, i.val)"
              >
                <q-item-section side
                  ><q-icon :name="i.icon" size="xs"
                /></q-item-section>
                <q-item-section
                  ><span class="q-pr-md">{{ $t(i.label) }}</span></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-item
          v-if="
            (useAuths('status', ['card']) || isCreator) &&
            cardRef.type === 'task' &&
            show_byPreference?.status?.value
          "
          class="radius-xs"
          clickable
        >
          <q-item-section>{{ $t('status') }}：</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu auto-close anchor="top end" self="top start">
            <StatusMenu
              :status="cardRef.status"
              :modify="true"
              @statusChange="_card_statusChange"
              :isList="true"
            />
          </q-menu>
        </q-item>
        <template v-if="useAuths('delete', ['card']) || isCreator">
          <q-separator spaced class="op-5" />
          <q-item
            class="radius-xs"
            clickable
            v-close-popup
            @click="removeCard(cardRef, belong_card)"
          >
            <q-item-section>{{ $t('delete_card') }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-popup-proxy>
    <!-- 重要度、紧急度 左边框颜色标记 -->
    <div class="absolute-left full-height z-fab"
      :class="`${highlight ? 'highlight transition' : ''}`"
      :style="`${style}`"
    ></div>
  </tr>
</template>

<script setup>
import {
  reactive,
  ref,
  toRef,
  toRefs,
  watch,
  watchEffect,
  computed,
} from "vue";
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import CardPage from "./CardPage.vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import overlappingAvatar from "src/pages/team/components/widgets/overlappingAvatar.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import {
  attachExecutor,
  unfollowCard,
  followCard,
  clac_cardEdgeStyle,
  clac_todoData,
  updateCardName,
  setCardType,
  setCardColor,
  todogroupSort,
  todogroupUpdate,
  _deleteTodogroup,
  createTodogroup,
  todoSort,
  todoItemUpdate,
  todoCreated,
  todoDeleted,
  setScore,
  updateJsonContent,
  removeCard,
  enterCard,
  leaveCard,
  setStatus,
} from "src/hooks/team/useCard.js";
import { isEqual } from "lodash-es";
import { useProjectCardPreference } from "src/pages/team/hooks/useSettingTemplate.js";
import { userStore, teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
import FileViewer from "components/VIewComponents/FileViewer.vue";

const project_card_preference = computed(
  () =>
    teamStore.project?.preferences?.card_settings || useProjectCardPreference()
);
const show_inPreference = (val) => {
  return project_card_preference.value.find((item) => item.val === val);
};
const preferences = {
  status: "status",
  score: "score",
  percent: "percent",
  executor: "executor",
  follow: "follow",
  color_marker: "color_marker",
};
const videoOption = {
  muted: true,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: false,
  fullscreenWeb: false,
};

const show_byPreference = {};
for (const key in preferences) {
  show_byPreference[key] = computed(
    () => show_inPreference(preferences[key])?.enable
  );
}
const $q = useQuasar();
const route = useRoute();

const props = defineProps({
  card: {
    type: Object,
    default() {
      return {};
    },
  },
  viewType: {
    type: String,
    default: "card",
  },
  isCreator_column: {
    type: Boolean,
    default: false,
  },
  uiOptions: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { card: cardRef } = toRefs(props);
const viewTypeRef = toRef(props, "viewType");
const todoDlg = ref(false);
// Card的创建身份不能继承分栏的创建者身份
const isCreator = computed(
  () => cardRef.value.creator?.id === userStore.userId
);
const isInCard = ref(false);
const default_version = computed(
  () =>
    (cardRef.value?.overviews?.length > 0 &&
      cardRef.value?.overviews?.find(
        (i) =>
          i.version === cardRef.value.default_version ||
          cardRef.value?.overviews[0]
      )) ||
    null
);
const media = ref();
const belong_card = ref();
watch(cardRef, () => {
  if (cardRef.value && cardRef.value.overviews?.length > 0) {
    media.value =
      cardRef.value.overviews?.find(
        (i) => i.version === cardRef.value.default_version
      )?.media?.url || cardRef.value.overviews[0]?.media?.url;
  }
  belong_card.value = teamStore.card || null;
});

const executor = ref();
const { style, highlight } = clac_cardEdgeStyle(cardRef.value);

const { todo_process } = clac_todoData(cardRef.value);

const is_followed = computed(() =>
  cardRef.value?.followed_bies
    ?.map((i) => i.id)
    .includes(Number(userStore.userId))
);
const color_marker = computed(
  () =>
    (cardRef.value?.color_marker &&
      cardRef.value.color_marker !== "clear" &&
      cardRef.value.color_marker) ||
    null
);
watchEffect(() => {
  isInCard.value = teamStore.card != null;
  const executorRole = cardRef.value?.member_roles?.find(
    (i) => i.subject === "executor"
  );
  // 一个卡片只能有一个负责人，因此这里可以使用 find 方法
  executor.value = cardRef.value?.card_members?.find((i) =>
    i.member_roles.map((j) => j.id)?.includes(executorRole.id)
  );
});

const updateParmars = reactive({
  project_id: route.params.project_id,
  data: {},
});

const name_changing = ref(false);
const emit = defineEmits(["cardChange", "cardDelete"]);
const _card_statusChange = async (val) => {
  await setStatus(cardRef.value, val);
  if (val === "completed") {
    collapseCard();
  }
};

const renamePopup = ref();
const _updateCardName = async (card, name) => {
  renamePopup.value.hide();
  await updateCardName(card, name);
  name_changing.value = false;
};
const updateContent = (event) => {
  updateParmars.data.name = event.target.innerHTML;
};

const _todogroupSort = async (val) => {
  await todogroupSort(cardRef.value, val);
};
const _todogroupUpdate = async (groups, group) => {
  await todogroupUpdate(cardRef.value, groups, group);
};
const deleteTodogroup = async (groups, group) => {
  await _deleteTodogroup(cardRef.value, groups, group);
};
const _createTodogroup = async (group) => {
  await createTodogroup(cardRef.value, group);
};
const _todoSort = async (group, sort) => {
  await todoSort(cardRef.value, group, sort);
};
const _todoItemUpdate = async (group_id, todo) => {
  await todoItemUpdate(cardRef.value, group_id, todo);
};
const _todoCreated = async (group_id, todo) => {
  await todoCreated(cardRef.value, group_id, todo);
};
const _todoDeleted = async (group_id, todo_id) => {
  await todoDeleted(cardRef.value, group_id, todo_id);
};

const attachExecutorFn = (member) => {
  attachExecutor(cardRef.value, member);
};

const scores = [1, 2, 3, 5, 8, 13, 21];
const _setScore = async (val) => {
  await setScore(cardRef.value, val);
};

const content_channging = ref(false);
const loading = ref(false);
const tiptapBlur = async (val) => {
  if (loading.value) return;
  const isChanged = !isEqual(cardRef.value.jsonContent, val);

  if (!isChanged) {
    content_channging.value = false;
    return;
  }
  content_channging.value = false;
  loading.value = true;

  const res = await updateJsonContent(cardRef.value, val);
  if (res) {
    loading.value = true;
  }
};

const show_cardDetial = ref(false);
const _enterCard = async (auth) => {
  if (!auth) {
    return;
  }
  const res = await enterCard(cardRef.value, viewTypeRef.value);
  if (res) {
    show_cardDetial.value = res;
  }
};
const cardTypes = ref([
  { val: "task", label: "task", icon: "task_alt" },
  { val: "note", label: "note", icon: "event_note" },
  { val: "todo", label: "todo", icon: "checklist" },
]);

const colorMarks = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "red",
  "info",
  "warning",
  "clear",
];
const disableActionbtn = ref(false);
const disableAction = (val) => {
  disableActionbtn.value = val;
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      let project_users = teamStore.project?.project_members.map(
        (i) => i.by_user
      );
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.body?.id === cardRef.value.id &&
          strapi.data.action === "delete"
        ) {
          emit("cardDelete", cardRef.value.id);
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_executor"
        ) {
          let _executor_member;
          if (strapi.data.executor) {
            _executor_member = cardRef.value?.card_members.find(
              (i) => i.id === strapi.data.executor
            );
          }
          cardRef.value.member_roles.find(
            (i) => i.subject === "executor"
          ).members = [_executor_member] || [];
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_type"
        ) {
          cardRef.value.type = strapi.data.card_type;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_color"
        ) {
          cardRef.value.color_marker = strapi.data.card_color;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_name"
        ) {
          cardRef.value.name = strapi.data.card_name;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_status"
        ) {
          cardRef.value.status = strapi.data.card_status;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_jsonContent"
        ) {
          cardRef.value.jsonContent = strapi.data.jsonContent;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value?.id &&
          strapi.data.action === "new_card_followed"
        ) {
          console.log("触发followCard WS", strapi.data);
          let __ = project_users.find((u) => u.id === strapi.data.new_followed);
          cardRef.value.followed_bies.push(__);
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "remove_card_followed"
        ) {
          cardRef.value.followed_bies = cardRef.value.followed_bies.filter(
            (u) => u.id !== strapi.data.remove_followed
          );
        }
        // 其他用户在卡片详情中修改卡片jsonContent内容时同步数据
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === cardRef.value.id &&
          strapi.data.action === "change_card_content"
        ) {
          // console.log("ws detial changed");
          cardRef.value.jsonContent = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_order"
        ) {
          // console.log(strapi.data);
          cardRef.value.todogroups = strapi.data.order.map((i) =>
            cardRef.value.todogroups.find((t) => t.id === i)
          );
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_update"
        ) {
          // console.log("todogroupUpdate");
          const isSameId = (element) => {
            return element.id === strapi.data.body.id;
          };
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index !== -1) {
            cardRef.value.todogroups[index] = strapi.data.body
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_deleted"
        ) {
          const isSameId = (element) => {
            return element.id === strapi.data.id;
          };
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index !== -1) {
            cardRef.value.todogroups.splice(index, 1);
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_created"
        ) {
          if (cardRef.value.todogroups?.length > 0) {
            cardRef.value.todogroups.push(strapi.data.body);
          } else {
            cardRef.value.todogroups = [strapi.data.body];
          }
        }
        if (
          strapi.data?.is === "todogroup" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_sort"
        ) {
          // console.log(all_todos.length);
          const isSameId = (element) => {
            return element.id === strapi.data.group_id;
          };
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index !== -1) {
            cardRef.value.todogroups[index].todos = strapi.data.body.todos;
          }
        }
        // console.log(strapi.data);
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value?.id &&
          strapi.data.action === "card_todo_updated"
        ) {
          // console.log("card_todo_updated ws");
          cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
            ...g,
            todos: g.todos.map((t) =>
              t.id === strapi.data.todo_id ? strapi.data.body : t
            ),
          }));
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_created"
        ) {
          // console.log("card_todo_created ws", strapi.data);
          cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
            ...g,
            todos:
              (g.id === strapi.data.group_id &&
                ((g.todos?.length > 0 && [...g.todos, strapi.data.body]) || [
                  strapi.data.body,
                ])) ||
              g.todos,
          }));
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_deleted"
        ) {
          cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
            ...g,
            todos: g.todos.filter((t) => t.id !== strapi.data.todo_id),
          }));
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === cardRef.value.id &&
          strapi.data.action === "overview_mediaChanged"
        ) {
          cardRef.value.overviews.find(
            (i) =>
              i.id === cardRef.value.default_version ||
              cardRef.value.overviews[0].id
          ).media = strapi.data.media;
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.cardBody {
  width: 320px;
}
.editting_card {
  border: 1px outset solid $primary;
  border-radius: 5px;
}
</style>
