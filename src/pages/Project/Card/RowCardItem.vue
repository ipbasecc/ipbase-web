<template>
  <tr class="hovered-item">
    <td class="dragBar">
      <div class="fit flex flex-center hover-show">
        <q-icon name="drag_indicator" />
      </div>
    </td>
    <!-- 状态 -->
    <td>
      <StatusMenu
        v-if="cardRef.type === 'task' && show_byPreference?.status?.value"
        :modify="calc_auth('card', 'status', 'project') || isCreator"
        :status="cardRef.status"
        @statusChange="_card_statusChange"
        class="undrag"
      />
      <q-icon
        v-else-if="cardRef.type === 'note'"
        name="mdi-note"
        size="xs"
        class="op-5"
      />
    </td>
    <!-- 预览图 -->
    <td>
      <q-img
        v-if="default_version?.media?.url"
        :src="default_version?.media?.url"
        :ratio="16 / 9"
        spinner-color="primary"
        spinner-size="82px"
        class="cursor-pointer"
        @click="$hevueImgPreview(default_version?.media?.url)"
      />
    </td>
    <!-- 名称 -->
    <td>
      <div
        v-if="
          name_changing && (calc_auth('card', 'name', 'project') || isCreator)
        "
        class="undrag text-medium q-space cursor-text q-px-sm z-fab"
        style="
          writing-mode: lr;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        "
        :contenteditable="true"
        autofocus
        @input="updateContent"
        :class="name_changing ? 'border-bottom' : ''"
        @blur="_updateCardName(cardRef, updateParmars.data.name)"
        @keydown.esc="name_changing = false"
        @keyup.enter="_updateCardName(cardRef, updateParmars.data.name)"
      >
        {{ cardRef.name }}
      </div>
      <div
        v-else
        class="text-medium q-space text-line-1 q-px-sm cursor-pointer z-fab"
      >
        <!-- {{ cardRef.id }} |  -->
        <span @click="name_changing = true" class="undrag cursor-text">{{
          cardRef.name
        }}</span>
      </div>
    </td>
    <!-- 内容 -->
    <td>
      <TipTap
        v-if="calc_auth('card', 'jsonContent', 'project') || isCreator"
        :jsonContent="cardRef.jsonContent"
        :editable="
          content_channging &&
          (calc_auth('card', 'jsonContent', 'project') || isCreator)
        "
        :need="'json'"
        :clickOutsideSave="true"
        :autofocus="true"
        :square="true"
        :toolbarHeight="34"
        :styleClass="content_channging ? 'q-py-sm q-px-md' : 'q-pa-none'"
        class="undrag"
        @tiptapBlur="tiptapBlur"
        @click.stop="content_channging = true"
        @keydown.esc="content_channging = false"
      />
      <TipTap
        v-else
        :jsonContent="cardRef.jsonContent"
        :editable="false"
        :need="'json'"
        :styleClass="'q-pa-none'"
        class="undrag"
      />
    </td>
    <!-- 清单 -->
    <td>
      <q-btn
        :color="cardRef.todogroups?.length > 0 ? 'primary' : ''"
        flat
        icon="mdi-checkbox-multiple-marked-circle-outline"
        round
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
                :belong_to="cardRef"
                :attach_to="-3"
                :isCreator="isCreator"
                :isPrivate="cardRef.private"
                :uiOptions="uiOptions"
                @todogroupSort="_todogroupSort"
                @todogroupUpdate="_todogroupUpdate"
                @deleteTodogroup="_deleteTodogroup"
                @createTodogroup="_createTodogroup"
                @todoSort="_todoSort"
                @todoitemUpdate="_todoitemUpdate"
                @todoCreated="_todoCreated"
                @todoDeleted="_todoDeleted"
                @disableAction="disableAction"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-btn>
    </td>
    <!-- 分值 -->
    <td>
      <q-chip
        v-if="show_byPreference?.score?.value"
        dense
        square
        outline
        color="teal"
        icon="score"
        class="font-small"
        :class="
          calc_auth('card', 'score', 'project') || isCreator
            ? 'cursor-pointer'
            : ''
        "
      >
        分值：{{ cardRef.score }}
        <q-popup-proxy
          cover
          v-if="calc_auth('card', 'score', 'project') || isCreator"
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
    <td>
      <span v-if="cardRef.type === 'todo'">{{ todo_process }}%</span>
    </td>
    <!-- 关注者 -->
    <td>
      <div class="row no-wrap items-center gap-xs">
        <overlappingAvatar
          v-if="cardRef.followed_bies?.length > 0"
          :members="cardRef.followed_bies"
          :size="22"
          @click="unfollowCard(cardRef)"
          class="undrag cursor-pointer"
        >
          <template #tooltip>
            <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
              关注了此卡片
            </q-tooltip>
          </template>
        </overlappingAvatar>
        <q-btn
          v-if="
            !is_followed &&
            (calc_auth('card', 'followed_bies', 'project') || isCreator)
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
            关注此卡片
          </q-tooltip>
        </q-btn>
      </div>
    </td>
    <!-- 操作 -->
    <td>
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
                      dense
                      size="sm"
                      unelevated
                      :icon="
                        unfold_lessRef != 'collapse'
                          ? 'unfold_less'
                          : 'unfold_more'
                      "
                      v-close-popup
                      @click="unfold_less()"
                      padding="xs"
                      class="border"
                    >
                      <q-tooltip
                        class="font-small"
                        :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
                      >
                        {{
                          `${
                            unfold_lessRef === "collapse" ? "展开" : "折叠"
                          }卡片`
                        }}
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
                (calc_auth('card', 'color_marker', 'project') || isCreator)
              "
            >
              <q-item-section>
                <div class="row no-wrap gap-sm">
                  <q-icon
                    v-for="marker in colorMarks"
                    :key="marker"
                    dense
                    :size="element?.color_marker === marker ? '24px' : '16px'"
                    flat
                    round
                    padding="none"
                    :color="marker"
                    :name="
                      element?.color_marker === marker
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
                calc_auth('card', 'type', 'project') ||
                calc_auth('card', 'name', 'project') ||
                calc_auth('card', 'status', 'project') ||
                isCreator
              "
              spaced
              class="op-5"
            />
            <q-item
              v-if="calc_auth('card', 'name', 'project') || isCreator"
              class="radius-xs"
              clickable
              v-close-popup
              @click="name_changing = true"
            >
              <q-item-section>
                {{ cardRef.name ? "卡片改名" : "添加卡片名称" }}
              </q-item-section>
            </q-item>
            <q-item
              v-if="calc_auth('card', 'type', 'project') || isCreator"
              class="radius-xs"
              clickable
            >
              <q-item-section>修改为：</q-item-section>
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
                (calc_auth('card', 'status', 'project') || isCreator) &&
                cardRef.type === 'task' &&
                show_byPreference?.status?.value
              "
              class="radius-xs"
              clickable
            >
              <q-item-section>状态：</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start">
                <StatusMenu
                  :status="cardRef.status"
                  @statusChange="_card_statusChange"
                  :isList="true"
                />
              </q-menu>
            </q-item>
            <template
              v-if="calc_auth('card', 'delete', 'project') || isCreator"
            >
              <q-separator spaced class="op-5" />
              <q-item
                class="radius-xs"
                clickable
                v-close-popup
                @click="_removeCard"
              >
                <q-item-section>删除卡片</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-icon>
    </td>
    <!-- 更多 -->
    <td>
      <q-btn
        v-if="cardRef.type === 'task'"
        flat
        dense
        size="sm"
        round
        icon="fullscreen"
        class="op-5 hover-show"
        @click="
          _enterCard(
            calc_auth('card', 'read', isInCard ? 'card' : 'project') ||
              isCreator
          )
        "
      />
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
        @show="projectStore.showCards = true"
        @hide="leaveCard()"
        class="blur-sm transition"
      >
        <CardPage />
      </q-dialog>
    </td>
    <q-popup-proxy context-menu>
      <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
        <template v-if="!content_channging">
          <q-item class="radius-xs">
            <q-item-section>
              <div class="row no-wrap gap-sm">
                <q-btn
                  dense
                  size="sm"
                  unelevated
                  :icon="
                    unfold_lessRef != 'collapse' ? 'unfold_less' : 'unfold_more'
                  "
                  v-close-popup
                  @click="unfold_less()"
                  padding="xs"
                  class="border"
                >
                  <q-tooltip
                    class="font-small"
                    :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
                  >
                    {{
                      `${unfold_lessRef === "collapse" ? "展开" : "折叠"}卡片`
                    }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
          <q-separator
            v-if="
              calc_auth('card', 'type', 'project') ||
              calc_auth('card', 'name', 'project') ||
              calc_auth('card', 'delete', 'project') ||
              isCreator
            "
            spaced
            class="op-5"
          />
        </template>
        <q-item
          v-if="
            show_byPreference?.color_marker?.value &&
            calc_auth('card', 'color_marker', 'project')
          "
        >
          <q-item-section>
            <div class="row no-wrap gap-sm">
              <q-icon
                v-for="marker in colorMarks"
                :key="marker"
                dense
                :size="element?.color_marker === marker ? '24px' : '16px'"
                flat
                round
                padding="none"
                :color="marker"
                :name="
                  element?.color_marker === marker
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
        <template v-if="cardRef.type === 'task'">
          <q-separator spaced class="op-5" />
          <q-item
            v-if="calc_auth('card', 'name', 'project') || isCreator"
            class="radius-xs"
            clickable
            v-close-popup
            @click="name_changing = true"
          >
            <q-item-section>
              {{ cardRef.name ? "卡片改名" : "添加卡片名称" }}
            </q-item-section>
          </q-item>
        </template>
        <q-item
          v-if="calc_auth('card', 'type', 'project') || isCreator"
          class="radius-xs"
          clickable
        >
          <q-item-section>修改为：</q-item-section>
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
                  ><span class="q-pr-md">{{ i.label }}</span></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-item
          v-if="
            (calc_auth('card', 'status', 'project') || isCreator) &&
            cardRef.type === 'task' &&
            show_byPreference?.status?.value
          "
          class="radius-xs"
          clickable
        >
          <q-item-section>状态：</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu auto-close anchor="top end" self="top start">
            <StatusMenu
              :status="cardRef.status"
              @statusChange="_card_statusChange"
              :isList="true"
            />
          </q-menu>
        </q-item>
        <q-separator spaced class="op-5" />
        <q-item
          v-if="calc_auth('card', 'delete', 'project') || isCreator"
          class="radius-xs"
          clickable
          v-close-popup
          @click="_removeCard"
        >
          <q-item-section>删除卡片</q-item-section>
        </q-item>
      </q-list>
    </q-popup-proxy>
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
import StatusMenu from "src/pages/Project/components/widgets/StatusMenu.vue";
import CardPage from "src/pages/Project/Card/CardPage.vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import overlappingAvatar from "src/pages/Project/components/project/widgets/overlappingAvatar.vue";
import TodoPage from "src/pages/Project/todo/TodoPage.vue";
import CardExecutor from "src/pages/Project/Card/components/CardExecutor.vue";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
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
  deleteTodogroup,
  createTodogroup,
  todoSort,
  todoitemUpdate,
  todoCreated,
  todoDeleted,
  setScore,
  updateJsonContent,
  removeCard,
  enterCard,
  leaveCard,
  setStatus,
  cacheExpand,
} from "src/hooks/project/useCard.js";

import localforage from "localforage";

import _ from "lodash";
import { useProjectCardPreference } from "src/hooks/project/useSettingTemplate.js";

const todoDlg = ref(false);
const projectStore = useProjectStore();
const project_card_preference = computed(
  () =>
    projectStore.project?.preferences?.card_settings ||
    useProjectCardPreference()
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

const show_byPreference = {};
for (const key in preferences) {
  show_byPreference[key] = computed(
    () => show_inPreference(preferences[key])?.enable
  );
}

const mm_wsStore = useMmws();
const userStore = useUserStore();
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
      cardRef.value.overviews.find(
        (i) => i.version === cardRef.value.default_version
      ).media.url || cardRef.value.overviews[0].media.url;
  }
  belong_card.value = projectStore.card || null;
});

const members = ref();
const executor = ref();
const { style, highlight } = clac_cardEdgeStyle(cardRef.value);

const { todo_process, todo_processColor } = clac_todoData(cardRef.value);

const is_followed = computed(() =>
  cardRef.value?.followed_bies
    ?.map((i) => i.id)
    .includes(Number(userStore.userId))
);
const color_marker = computed(
  () =>
    (cardRef.value?.color_marker &&
      cardRef.value.color_marker != "clear" &&
      cardRef.value.color_marker) ||
    null
);
watchEffect(() => {
  isInCard.value = projectStore.card != null;
  // jsonContent.value = cardRef.value.jsonContent;
  members.value = projectStore?.project?.project_members || [];
  executor.value = cardRef.value?.card_members?.find((i) =>
    i.member_roles.map((j) => j.subject).includes("executor")
  );
});

const updateParmars = reactive({
  project_id: route.params.proj_id,
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

const _updateCardName = async (card, name) => {
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
const _deleteTodogroup = async (groups, group) => {
  await deleteTodogroup(cardRef.value, groups, group);
};
const _createTodogroup = async (group) => {
  await createTodogroup(cardRef.value, group);
};
const _todoSort = async (group, sort) => {
  await todoSort(cardRef.value, group, sort);
};
const _todoitemUpdate = async (group_id, todo) => {
  await todoitemUpdate(cardRef.value, group_id, todo);
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
  const isChanged = !_.isEqual(cardRef.value.jsonContent, val);

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
const _removeCard = async () => {
  const res = await removeCard(cardRef.value, belong_card.value);
  if (res) {
    emit("cardDelete", res);
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
  { val: "task", label: "任务", icon: "task_alt" },
  { val: "note", label: "笔记", icon: "event_note" },
  { val: "todo", label: "待办", icon: "checklist" },
]);

const unfold_lessRef = ref();
watchEffect(() => {
  if (content_channging.value) {
    expandCard();
  }
});
const getUnfold_lessRef = async () => {
  try {
    const res = await localforage.getItem(
      `___card_unfold_less_${cardRef.value.id}`
    );
    if (res) {
      unfold_lessRef.value = res;
    } else {
      unfold_lessRef.value = "expand";
    }
  } catch (error) {
    console.log(error);
  }
};
getUnfold_lessRef();

const unfold_less = async () => {
  unfold_lessRef.value =
    unfold_lessRef.value === "expand" ? "collapse" : "expand";
  cacheExpand();
};

const expandCard = async () => {
  unfold_lessRef.value = "expand";
  cacheExpand();
};
const collapseCard = async () => {
  unfold_lessRef.value = "collapse";
  cacheExpand();
};

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
    // console.log("mm_wsStore.event.event", mm_wsStore?.event);
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      let project_users = projectStore.project?.project_members.map(
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
            (u) => u.id != strapi.data.remove_followed
          );
        }
        // 其他用户在卡片详情中修改卡片jsonContent内容时同步数据
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id == cardRef.value.id &&
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
          function isSameId(element) {
            return element.id == strapi.data.body.id;
          }
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index != -1) {
            let todos = cardRef.value.todogroups[index].todos;
            cardRef.value.todogroups[index] = {
              ...strapi.data.body,
              todos: todos,
            };
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_deleted"
        ) {
          function isSameId(element) {
            return element.id == strapi.data.id;
          }
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index != -1) {
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
          let all_todos = cardRef.value.todogroups.map((g) => g.todos).flat(2);
          // console.log(all_todos.length);
          function isSameId(element) {
            return element.id == strapi.data.group_id;
          }
          const index = cardRef.value.todogroups.findIndex(isSameId);
          if (index != -1) {
            cardRef.value.todogroups[index].todos = strapi.data.body.todos;
          }
        }
        // console.log(strapi.data);
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id == cardRef.value?.id &&
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
              (g.id == strapi.data.group_id &&
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
            todos: g.todos.filter((t) => t.id != strapi.data.todo_id),
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
.highlight {
  width: 5px;
}
.cardBody:hover .highlight {
  width: 1px;
}
</style>
