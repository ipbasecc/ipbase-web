<template>
  <div
    v-if="cardRef.expand"
    :key="`card-${cardRef.id}`"
    class="flex flex-center"
    :class="`
        ${cardRef.status === 'completed' && teamStore.navigation === 'kanban' ? 'op-3' : ''}
        ${
          $q.dark.mode && !actived
            ? 'text-grey-1'
            : 'text-grey-9'
        }
      `"
    ref="cardDomRef"
    :style="`${$q.screen.gt.xs ? 'width: 320px' : 'width: 100%'}`"
  >
    <q-card v-if="cardRef?.error" bordered>
      <q-card-section>
        {{ $t(cardRef.error) }}
      </q-card-section>
    </q-card>
    <!-- 此处qCard组件不能添加class名：card，会导致其内部的input组件无法框选、或点击修改光标位置 -->
    <q-card
      v-else-if="cardRef && viewTypeRef === 'card'"
      bordered
      flat
      class="full-width column no-wrap overflow-hidden"
      :class="`${content_channging ? 'focus' : ''}
        ${$q.screen.gt.xs ? 'cardBody' : ''}
        ${actived
          ? 'border-primary'
          : ''}
      `"
      :tabindex="cardRef.id"
      @dblclick="tryEnter"
    >
      <!-- 卡片顶部 -->
      <div
        class="row no-wrap items-center q-pa-xs gap-xs border-bottom hovered-item q-px-xs"
        :class="`
          ${
            useAuths('order', ['card']) &&
            !name_changing &&
            isDilgMode
              ? 'dragBar'
              : ''
          }
          ${actived
            ? `${ $q.dark.mode ? 'bg-deep-purple-10' : 'bg-primary-9'} text-white`
            : 'transparent'}
        `"
      >
      <div class="">
        <StatusMenu
          v-if="show_byPreference?.status?.value"
          dense
          :modify="useAuths('status', ['card'])"
          :status="cardRef.status"
          @statusChange="_card_statusChange"
          class="undrag"
        />
      </div>
        <div
          v-if="
            name_changing &&
            useAuths('name', ['card']) &&
            !isShared
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
        <template v-else>
          <div class="text-medium cursor-pointer z-fab">
            <span @click="name_changing = true" class="undrag cursor-text">
              {{ cardRef.name }}
            </span>
          </div>
          <q-space />
        </template>
        <q-btn
          v-if="!content_channging && cardRef.type !== 'classroom'"
          dense
          size="sm"
          unelevated
          round
          :icon="cardRef.expand !== 'collapse' ? 'unfold_less' : 'unfold_more'"
          class="hover-show transition undrag q-mr-xs cursor-pointer"
          @click="toggleExpand(cardRef)"
        >
          <q-tooltip
            class="font-small"
            :class="
              $q.dark.mode ? 'bg-black text-grey-1' : 'bg-white text-grey-10'
            "
          >
            {{ cardRef.expand === "collapse" ? $t('expand') : $t('collapse') }} {{ $t('card') }}
          </q-tooltip>
        </q-btn>
        <q-chip v-if="multiple_versions" dense outline color="green" :label="$t('multiple_versions')" class="undrag cursor-pointer">
          <q-menu v-if="!uiStore.only_electron.includes('classroom')">
            <q-list bordered dense class="radius-sm q-pa-xs">
              <q-item
                v-for="(i,index) in cardRef.overviews"
                :key="i.id" class="radius-xs"
                :class="media?.id === i.media?.id ? 'bg-primary' : ''"
                clickable v-close-popup
                @click="toggleVersion(i)"
              >
                <q-item-section side>
                  <q-avatar size="sm">{{ index }}</q-avatar>
                </q-item-section>
                <q-item-section>{{ i.name === 'Initial_Version' ? $t(i.name) : i.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-chip>
        <CardExecutor
          v-if="
            show_byPreference?.executor?.value &&
            !isExternal &&
            cardRef.type !== 'classroom' &&
            !isShared
          "
          :card="cardRef"
          :executor="executor"
          :cardMembers="cardMembers"
          :isCreator="isCreator"
          @attachExecutor="attachExecutorFn"
        />
      </div>
      <!-- 封面 -->
      <q-card-section
        v-if="cardRef.expand !== 'collapse'"
        class="q-pa-xs scroll-y"
        style="max-height: 61vh"
      >
      <template v-if="!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron">
        <FileViewer
          v-if="media?.url"
          :key="media.url"
          :file="media"
          :videoOption="videoOption"
          :by_width="true"
          mainStyle="no-padding"
        />
      </template>
        <div v-else class="column flex-center q-py-xl">
          {{ $t('only_electron') }}
        </div>
      </q-card-section>
      <!-- 任务、备忘 -->
      <q-card-section
        v-if="cardRef.type !== 'todo' && cardRef.type !== 'classroom'"
        class="q-space column no-wrap card overflow-hidden no-padding"
        :style="cardRef.expand === 'collapse' ? 'max-height: 6rem' : ''"
        @click="expandCard(cardRef)"
      >
        <TipTap
          :jsonContent="cardRef.jsonContent"
          :editable="
            useAuths('jsonContent', ['card']) && !isShared
          "
          :need="'json'"
          :square="true"
          :show_toolbar="false"
          styleClass="q-px-md q-py-sm"
          :hideScroll="cardRef.expand === 'collapse'"
          class="undrag"
          @tiptapBlur="tiptapBlur"
          @tiptapClose="toggleOffEditting()"
          @click.stop="
            clickContent(useAuths('jsonContent', ['card']))
          "
          @keydown.esc="uiStore.edittingCard = void 0"
        />
      </q-card-section>
      <!-- 待办 -->
      <q-card-section
        v-if="cardRef.type === 'todo' && cardRef.type !== 'classroom'"
        class="column no-wrap q-px-xs q-py-sm q-pb-sm overflow-hidden relative-position"
        :class="
          uiStore.dragging
            ? 'border-dashed border-op-sm bg-primary-active'
            : 'border-placeholder'
        "
        style="min-height: 6rem"
        :style="cardRef.expand === 'collapse' ? 'max-height: 6rem' : ''"
        @click="expandCard(cardRef)"
      >
        <TodoPage
          ref="todoRef"
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
        />
      </q-card-section>
      <!-- 卡片底部 -->
      <q-card-section
        v-show="cardRef?.expand !== 'collapse'"
        class="row no-wrap gap-sm items-center q-px-sm q-py-xs border-top hovered-item"
        :class="`
          ${isDilgMode ? 'dragBar' : ''}
        `"
        @dblclick="_enterCard(useAuths('read', ['card']))"
      >
        <ThreadBtn
          v-if="
            cardRef.mm_thread && !teamStore.card && isDilgMode && !isShared
          "
          :thread="cardRef.mm_thread"
          :show="true"
          @enterThread="enterThread"
        />
        <template
          v-if="show_byPreference?.follow?.value && !isExternal && !isShared"
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
              !is_followed && useAuths('followed_bies', ['card'])
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
        </template>
        <q-space />
        <div
          v-if="!isDilgMode"
          class="undrag flex flex-center hover-show transition"
        >
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="mdi-import"
            class="op-5"
            @click="_enterCard(useAuths('read', ['card']))"
          />
        </div>
        <div
          v-else
          class="undrag flex flex-center hover-show transition"
        >
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="fullscreen"
            class="op-5"
            @click="_enterCard(useAuths('read', ['card']))"
          >
            <q-tooltip
              :class="
                $q.dark.mode ? 'bg-black text-grey-1' : 'bg-white text-grey-10'
              "
              class="border"
            >
              {{ $t('view_detial') }}
            </q-tooltip>
          </q-btn>
        </div>
        <q-icon
          v-if="!isShared || (isShared && color_marker)"
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
          <q-menu v-if="!isShared" class="shadow-24">
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
                        :icon="!isDilgMode ? 'mdi-import' : 'mdi-arrow-expand'"
                        class="op-5"
                        padding="sm"
                        v-close-popup
                        @click="
                          _enterCard(useAuths('read', ['card']))
                        "
                      >
                        <q-tooltip>
                          <span class="font-medium">{{ $t('task_detial') }}</span>
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="useAuths('name', ['card'])"
                        flat
                        dense
                        size="sm"
                        stack
                        class="op-5"
                        padding="sm"
                        v-close-popup
                        @click="name_changing = true"
                      >
                        <ReName />
                        <q-tooltip>
                          <span class="font-medium">{{ $t('rename_card') }}</span>
                        </q-tooltip>
                      </q-btn>
                      <q-space />
                      <q-btn
                        v-if="!cardRef.disable_share"
                        flat
                        dense
                        size="sm"
                        stack
                        icon="share"
                        class="op-5"
                        padding="sm"
                        v-close-popup
                        @click="shareCard()"
                      />
                      <ThreadBtn
                        v-if="cardRef.mm_thread && isDilgMode"
                        :thread="cardRef.mm_thread"
                        :show="true"
                        :rounded="false"
                        @enterThread="enterThread"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
              <template
                v-if="
                  show_byPreference?.color_marker?.value &&
                  useAuths('color_marker', ['card'])
                "
              >
                <q-separator spaced class="op-5" />
                <q-item>
                  <q-item-section>
                    <div class="row no-wrap items-center gap-sm">
                      <q-icon
                        v-for="marker in colorMarks"
                        :key="marker"
                        dense
                        :size="
                          cardRef?.color_marker === marker ? '24px' : '16px'
                        "
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
              </template>
              <q-separator
                v-if="
                  (useAuths('type', ['card']) ||
                    useAuths('status', ['card'])) &&
                  cardRef.type !== 'classroom'
                "
                spaced
                class="op-5"
              />
              <q-item
                v-if="
                  useAuths('type', ['card']) &&
                  cardRef.type !== 'classroom'
                "
                class="radius-xs"
                clickable
              >
                <q-item-section>{{ $t('change_to') }}</q-item-section>
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
                          $t(i.label)
                        }}</span></q-item-section
                      >
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-item
                v-if="
                  useAuths('status', ['card']) &&
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
                    :modify="useAuths('status', ['card'])"
                    @statusChange="_card_statusChange"
                    :isList="true"
                  />
                </q-menu>
              </q-item>
              <template v-if="useAuths('delete', ['card'])">
                <q-separator spaced class="op-5" />
                <q-item
                  class="radius-xs"
                  clickable
                  v-close-popup
                  @click="removeCard(cardRef, belong_card)"
                >
                  <q-item-section
                    >{{ $t('delete') }} {{
                      cardRef.type === "classroom" ? $t('class_card') : $t('task_card')
                    }}</q-item-section
                  >
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-icon>
      </q-card-section>
      <template v-if="cardRef.expand === 'collapse'">
        <div
          class="absolute-bottom bg-gradient-bottom-unfold_card full-width"
          style="height: calc(100% - 34px)"
          @dblclick="_enterCard(useAuths('read', ['card']))"
        ></div>
        <q-btn
          dense
          square
          unelevated
          icon-right="mdi-chevron-down"
          :label="$t('show_more')"
          class="full-width hover-highlight-lg"
          @click="toggleExpand(cardRef)"
        />
      </template>
      <!-- 重要度、紧急度 左边框颜色标记 -->
      <div
        class="absolute-left full-height z-fab"
        :class="`${highlight ? 'highlight transition' : ''}`"
        :style="`${style}`"
      ></div>
    </q-card>
    <!-- 对话框中，需要使用esc来取消输入框的聚焦状态，这里关闭组件的esc事件 -->
    <q-dialog
      v-model="show_cardDetial"
      :full-height="$q.screen.gt.sm"
      :full-width="$q.screen.gt.sm"
      :maximized="!$q.screen.gt.sm"
      persistent
      no-shake
      :transition-show="teamStore?.card ? '' : 'slide-down'"
      transition-hide="slide-up"
      transition-duration="300"
      @show="teamStore.showCards = true"
      @hide="_leaveCard()"
      class="blur-sm transition"
    >
    <template v-if="cardRef.type === 'classroom'">
      <ClassPage v-if="!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron"
        :syncedVersion @syncedVersion="toggleVersion"
      />
      <q-card v-else bordered class="column">
        <q-bar class="bg-deep-orange text-white">
          <div class="text-h6">{{ $t('only_electron') }}</div>
          <q-space />
          <q-btn dense flat round icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-space column flex-center">
          <DownloadApp flat :nobar="true" />
        </q-card-section>
      </q-card>
    </template>
      <CardPage
        v-else
        @todogroupSort="_todogroupSort"
        @todogroupUpdate="_todogroupUpdate"
        @deleteTodogroup="deleteTodogroup"
        @createTodogroup="_createTodogroup"
        @todoSort="_todoSort"
      />
    </q-dialog>
    <q-dialog v-model="shareDlg" persistent>
      <CreateShare
        v-if="cardRef"
        :share_item="cardRef"
        :share_props="shareProps"
        is="card"
        @createShare="createShare"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  toRef,
  toRefs,
  watch,
  watchEffect,
  computed
} from "vue";
import { useMagicKeys } from "@vueuse/core";
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import CardPage from "./CardPage.vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import overlappingAvatar from "src/pages/team/components/widgets/overlappingAvatar.vue";
import TodoPage from "src/pages/team/todo/TodoPage.vue";
import CardExecutor from "src/pages/team/card/components/CardExecutor.vue";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import {
  attachExecutor,
  unfollowCard,
  followCard,
  clac_cardEdgeStyle,
  updateCardName,
  updateCardThread,
  setCardType,
  setCardColor,
  todogroupSort,
  todogroupUpdate,
  _deleteTodogroup,
  createTodogroup,
  todoSort,
  setScore,
  updateJsonContent,
  removeCard,
  enterCard,
  leaveCard,
  setStatus,
  cacheExpand,
  setCardSharecode,
} from "src/hooks/team/useCard.js";
import { findCard } from "src/api/strapi/project.js";
import { isEqual } from "lodash-es";
import { useProjectCardPreference } from "src/pages/team/hooks/useSettingTemplate.js";
import ThreadBtn from "../components/widgets/ThreadBtn.vue";
import ReName from "../components/widgets/icons/ReName.vue";
import {
  userStore,
  teamStore,
  mm_wsStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import ClassPage from "./ClassPage.vue";
import FileViewer from "src/components/VIewComponents/FileViewer.vue";
import CreateShare from "pages/team/components/CreateShare.vue";
import DownloadApp from 'src/components/VIewComponents/DownloadApp.vue'

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
const isShared = computed(() => uiStore.isShared);
const shareProps = ref([
  { val: "card_todo", label: "todo", enable: false },
  { val: "card_kanban", label: "task", enable: false },
  { val: "card_documents", label: "document", enable: false },
  { val: "card_storage", label: "storage", enable: false },
  { val: "card_schedule", label: "schedule", enable: false },
  { val: "card_feedback", label: "feedback", enable: false },
]);
const videoOption = {
  muted: false,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: true,
  fullscreenWeb: false,
};

const isExternal = computed(() => teamStore.project?.isExternal || false);
const isDilgMode = ref(true);
const actived = ref(false)
watchEffect(() => {
  isDilgMode.value = !isExternal.value && !uiStore.isFocusMode
  actived.value = teamStore.thread?.id === cardRef.value.mm_thread?.id || teamStore.card?.id === cardRef.value.id;
})
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

const show_byPreference = {};
for (const key in preferences) {
  show_byPreference[key] = computed(
    () => show_inPreference(preferences[key])?.enable
  );
}
const toggleOffEditting = () => {
  uiStore.edittingCard = void 0;
};

const cardMembers = computed(() => cardRef.value?.card_members || []);
const isCreator = computed(() => {
  // 卡片所有角色
  const _member_roles = cardRef.value?.member_roles;
  // 用户的所有角色id集合
  const _userMember_roles = cardRef.value?.card_members
    ?.filter((i) => i.by_user.id === userStore.userId)
    ?.map((j) => j.member_roles.map((k) => k.id))
    .flat(3);
  // 筛选出用户在卡片中的角色
  const _member_role = _member_roles?.filter((i) =>
    _userMember_roles.includes(i.id)
  );
  // 判断是不是创建者
  let _isCreator;
  if (_member_role?.length > 0) {
    _isCreator = _member_role.map((i) => i.subject)?.includes("creator");
  }
  return _isCreator;
});
const isInCard = ref(false);
const multiple_versions = computed(() => cardRef.value?.overviews?.length > 1);
const media = ref();
const belong_card = ref();
watch(cardRef, () => {
  if (cardRef.value && cardRef.value.overviews?.length > 0) {
    media.value =
      cardRef.value.overviews?.find(
        (i) => i.version === cardRef.value.default_version
      )?.media || cardRef.value.overviews[0]?.media;
  }
  belong_card.value = teamStore.card || null;
});
const syncedVersion = ref()
const toggleVersion = (version) => {  
  media.value = version.media || void 0
  syncedVersion.value = version
}

const executor = ref();
const { style, highlight } = clac_cardEdgeStyle(cardRef.value);

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
const todoRef = ref();

const name_changing = ref(false);
const emit = defineEmits(["cardChange", "cardDelete"]);
const _card_statusChange = async (val) => {
  await setStatus(cardRef.value, val);
  if (val === "completed" && cardSize.value?.height > 200) {
    collapseCard(cardRef.value);
  }
};

const _updateCardName = async (card, name) => {
  await updateCardName(card, name);
  name_changing.value = false;
};
const updateContent = (event) => {
  updateParmars.data.name = event.target.innerHTML;
};

const _todogroupSort = async (sort) => {
  await todogroupSort(cardRef.value, sort);
};
const _todogroupUpdate = async (old_group, group) => {
  await todogroupUpdate(cardRef.value, old_group, group);
};
const deleteTodogroup = async (group) => {
  await _deleteTodogroup(cardRef.value, group);
};
const _createTodogroup = async (group) => {
  // console.log('get emit createTodogroup cardItem')
  await createTodogroup(cardRef.value, group);
};
const _todoSort = async (group, sort) => {
  // console.log('_todoSort carditem')
  await todoSort(cardRef.value, group, sort);
};

const attachExecutorFn = (member) => {
  attachExecutor(cardRef.value, member);
};
const enterThread = (thread) => {
  if (
    teamStore.kanban_rightDrawer === "thread" &&
    teamStore.thread?.id === thread.id
  ) {
    teamStore.kanban_rightDrawer = null;
    teamStore.thread = null;
  } else {
    teamStore.kanban_rightDrawer = "thread";
    teamStore.thread = thread;
  }
};
const shareDlg = ref(false);
const shareCard = () => {
  shareDlg.value = true;
};
const createShare = async (val) => {
  // shareDlg.value = false
  const res = await setCardSharecode(cardRef.value, val);
  if (res) {
    cardRef.value.share_codes = res.share_codes;
  }
};
const scores = [1, 2, 3, 5, 8, 13, 21];
const _setScore = async (val) => {
  await setScore(cardRef.value, val);
};

const content_channging = computed(
  () => uiStore.edittingCard === cardRef.value?.id
);
const loading = ref(false);
const tiptapBlur = async (val) => {
  if (loading.value) return;
  const isChanged = !isEqual(cardRef.value.jsonContent, val);

  if (!isChanged) {
    return;
  }
  uiStore.edittingCard = cardRef.value?.id;
  loading.value = true;

  const res = await updateJsonContent(cardRef.value, val);
  if (res) {
    loading.value = false;
  }
};

const cardCtxMenu = ref();
const hideCtxMent = () => {
  if (!teamStore.shareInfo) {
    cardCtxMenu.value?.hide();
  }
};
const show_cardDetial = ref(false);
const _enterCard = async (auth) => {
  if (!isDilgMode.value) {
    teamStore.card = cardRef.value;
    teamStore.activedCard_id = cardRef.value?.id;
  } else {
    hideCtxMent();
    if (!auth && !teamStore.shareInfo) {
      return;
    }
    await enterCard(cardRef.value, viewTypeRef.value);
    show_cardDetial.value = true;
  }
};

const tryEnter = async () => {
  if (teamStore.shareInfo) {
    await _enterCard(true);
  }
};
const cardTypes = ref([
  { val: "task", label: "task", icon: "task_alt" },
  { val: "note", label: "note", icon: "event_note" },
  { val: "todo", label: "todo", icon: "checklist" },
]);

const toggleExpand = async (card) => {
  cardRef.value.expand =
    cardRef.value.expand === "expand" ? "collapse" : "expand";
  await cacheExpand(card, cardRef.value.expand);
};

const expandCard = async (card) => {
  cardRef.value.expand = "expand";
  await cacheExpand(card, "expand");
};

watchEffect(() => {
  if (content_channging.value) {
    expandCard(cardRef.value);
  }
});
const collapseCard = async (card) => {
  cardRef.value.expand = "collapse";
  await cacheExpand(card, "collapse");
};

const clickContent = (auth) => {
  if (auth) {
    uiStore.edittingCard = cardRef.value?.id;
  }
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

const cardDomRef = ref(null);
const cardSize = ref();

const { current } = useMagicKeys();
const keys = computed(() => Array.from(current));
watch(
  keys,
  () => {
    if (keys.value) {
      if (keys.value?.includes("escape") && content_channging.value) {
        toggleOffEditting();
      }
    }
  },
  { immediate: false, deep: false }
);

const _leaveCard = () => {
  // console.log('_leaveCard')
  // cardRef.value.todogroups = teamStore.card.todogroups
  leaveCard();
  syncDeletedByWS();
};

// ws data line -------------------------
let strapi;
const syncCardStore = () => {
  if (teamStore.card) {
    // teamStore.card = cardRef.value
    Object.keys(cardRef.value).forEach((key) => {
      teamStore.card[key] = cardRef.value[key];
    });
  }
};
const syncDeletedByWS = () => {
  if (deletedCards.value.includes(cardRef.value.id)) {
    emit("cardDelete", cardRef.value.id);
  }
};
const deletedCards = ref([]);
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      strapi = post?.props?.strapi;
      let project_users = teamStore.project?.project_members?.map(
        (i) => i.by_user
      );
      if (strapi) {
        if (
          strapi.data?.is === "card" &&
          strapi.data.body?.id === cardRef.value.id &&
          strapi.data.action === "delete"
        ) {
          if(!teamStore.card){
            emit("cardDelete", cardRef.value.id);
          } else {
            deletedCards.value.push(cardRef.value.id)
          }
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_executor"
        ) {
          executor.value = cardRef.value?.card_members.find(
            (i) => i.id === strapi.data.executor
          );
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_type"
        ) {
          cardRef.value.type = strapi.data.card_type;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_color"
        ) {
          cardRef.value.color_marker = strapi.data.card_color;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_name"
        ) {
          cardRef.value.name = strapi.data.card_name;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_status"
        ) {
          cardRef.value.status = strapi.data.card_status;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "update_card_jsonContent"
        ) {
          cardRef.value.jsonContent = strapi.data.jsonContent;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value?.id &&
          strapi.data.action === "new_card_followed"
        ) {
          // console.log("触发followCard WS", strapi.data);
          let __ = project_users.find((u) => u.id === strapi.data.new_followed);
          cardRef.value.followed_bies.push(__);
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "remove_card_followed"
        ) {
          cardRef.value.followed_bies = cardRef.value.followed_bies?.filter(
            (u) => u.id !== strapi.data.remove_followed
          );
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === cardRef.value.id &&
          strapi.data.action === "change_card_content"
        ) {
          // console.log("ws detial changed");
          cardRef.value.jsonContent = strapi.data.body;
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_order"
        ) {
          // find all todos in this card
          const all_todogroups = teamStore.kanban?.columns
            ?.map((column) => column.cards
            ?.map((card) => card.todogroups))
            .flat(2);
          // calc all todos ids
          const _all_todogroup_ids = all_todogroups?.map(group => group.id);
          const sort = strapi.data.order;
          // find unknown todo ids
          const _unknown_todo_ids = sort.filter(todo => !_all_todogroup_ids.includes(todo));
          // if unknown todo ids exist
          // find card by id and get all todos
          // then assign todogroups
          if(_unknown_todo_ids?.length > 0) {
            const res = await findCard(cardRef.value.id);
            if(res) {
              cardRef.value.todogroups = res.data.todogroups;
            }
            return
          } else {
            cardRef.value.todogroups = sort.map((order) =>
              all_todogroups.find((group) => group.id === order)
            );
          }
          syncCardStore();
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
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todogroup_deleted"
        ) {
          if(!cardRef.value?.todogroups || cardRef.value.todogroups.length === 0) return
          cardRef.value.todogroups = cardRef.value?.todogroups?.filter(
            (i) => i.id !== strapi.data.id
          );
          syncCardStore();
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === cardRef.value?.id &&
          strapi.data.action === "card_todogroup_created"
        ) {
          if (cardRef.value.todogroups?.length > 0) {
            cardRef.value.todogroups = [
              ...cardRef.value.todogroups,
              strapi.data.body,
            ];
          } else {
            cardRef.value.todogroups = [strapi.data.body];
          }
          syncCardStore();
        }
        if (
          strapi.data?.is === "todogroup" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_sort" &&
          cardRef.value?.todogroups
            ?.map((i) => i.id)
            ?.includes(strapi.data.group_id)
        ) {
          // find all todos in this card
          const all_todos = teamStore.kanban?.columns
            ?.map((column) => column.cards
            ?.map((card) => card.todogroups
            ?.map(group => group.todos)))
            .flat(3);
          // calc all todos ids
          const _all_todo_ids = all_todos?.map(todo => todo.id);
          const sort = strapi.data.sort;
          // find unknown todo ids
          const _unknown_todo_ids = sort.filter(todo => !_all_todo_ids.includes(todo));
          // if unknown todo ids exist
          // find card by id and get all todos
          // then assign todogroups
          if(_unknown_todo_ids?.length > 0) {
            const res = await findCard(cardRef.value.id);
            if(res) {
              cardRef.value.todogroups = res.data.todogroups;
            }
            return
          } else {
            const _todos = sort.map((order) =>
              all_todos.find((todo) => todo.id === order)
            );
            cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
              ...g,
              todos: g.id === strapi.data.group_id ? _todos : g.todos,
            }));
          }
          syncCardStore();
        }
        // console.log(strapi.data);
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value?.id &&
          strapi.data.action === "card_todo_updated"
        ) {
          console.log("card_todo_updated ws", strapi.data);
          cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
            ...g,
            todos: g.todos.map((t) =>
              t.id === strapi.data.todo_id ? strapi.data.body : t
            ),
          }));
          syncCardStore();
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_created"
        ) {
          // console.log("card_todo_created post", post);
          strapi.data.body.mm_thread = post
          cardRef.value.todogroups = cardRef.value.todogroups.map((g) => ({
            ...g,
            todos:g.id === Number(strapi.data.group_id)
                  && !g.todos?.map((todo) => todo.id).includes(strapi.data.body.id)
                  ? [...g.todos, strapi.data.body]
                  : g.todos
          }));
          syncCardStore();
        }
        if (
          strapi.data?.is === "todo" &&
          strapi.data.card_id === cardRef.value.id &&
          strapi.data.action === "card_todo_deleted"
        ) {
          cardRef.value.todogroups = cardRef.value.todogroups?.map((g) => ({
            ...g,
            todos: g.todos?.filter((t) => t.id !== Number(strapi.data.todo_id)),
          }));
          syncCardStore();
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
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === cardRef.value.id &&
          strapi.data.action === "removeVersion"
        ) {
          function isSameId(element) {
            return element.id === strapi.data.removed_id;
          }
          const index = cardRef.value.overviews.findIndex(isSameId);
          if (index !== -1) {
            cardRef.value.overviews.splice(index, 1);
          }
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === cardRef.value.id &&
          strapi.data.action === "newVersion"
        ) {
          function isSameId(element) {
            return element.id === strapi.data?.body?.id;
          }
          const index = cardRef.value.overviews.findIndex(isSameId);
          if (index === -1) {
            if (cardRef.value?.overviews?.length > 0 && !cardRef.value?.overviews.map(i => i.id).includes(strapi.data?.body?.id)) {
              cardRef.value.overviews.push(strapi.data?.body);
            } else {
              cardRef.value.overviews = [strapi.data?.body];
            }
          }
        }
      }
    }
    if (mm_wsStore.event && mm_wsStore.event.event === "thread_updated") {
      const _thread = JSON.parse(mm_wsStore.event.data.thread);
      if (_thread.id === cardRef.value?.mm_thread?.id) {
        cardRef.value.mm_thread = _thread;
        await updateCardThread(cardRef.value, _thread);
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped>
.cardBody {
  width: 320px;
}
.highlight {
  width: 5px;
}
.cardBody:hover .highlight {
  width: 1px;
}
.cardBody:focus,
.cardBody.focus {
  border: 1px solid #1976d2;
}
</style>
