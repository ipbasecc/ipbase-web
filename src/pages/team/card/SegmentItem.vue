<template>
  <!-- 此处qCard组件不能添加class名：card，会导致其内部的input组件无法框选、或点击修改光标位置 -->
    <q-card v-if="cardRef" bordered flat
      class="column no-wrap cardBody overflow-hidden relative-position radius-sm hovered-item"
      :class="teamStore.card?.id === cardRef.id ? 'openedCard shadow-focus' : ''"
      @mouseenter="AUTH = useAuths('read', ['card'])"
      @mouseleave="AUTH = void 0"
    >
      <!-- 卡片顶部 -->
      <q-card-section
        class="dragItem row no-wrap q-pa-xs q-pr-sm items-center hovered-item absolute-top z-fab"
        :class="`${
          useAuths('order', ['card']) && !name_changing && !isExternal
          ? 'dragBar' : ''
        }`"
        @mouseenter="uiStore.dragReelscrollEnable = false"
      >
        <q-circular-progress
          show-value
          :value="todo_process"
          :thickness="0.1"
          :color="todo_processColor"
          :track-color="$q.dark.mode ? 'grey-7' : 'grey-3'"
          class="column q-py-xs"
          style="width: 28px; height: 28px"
        >
          <span class="row items-end no-wrap scale-down-sm">
            <span style="font-size: 0.55rem">{{ todo_process }}</span>
            <span style="font-size: 0.4rem">%</span>
          </span>
        </q-circular-progress>
        <q-chip
          v-if="show_byPreference?.score?.value"
          dense
          square
          outline
          color="teal"
          icon="score"
          class="font-small"
          :class="
            useAuths('score', ['card']) ? 'cursor-pointer' : ''
          "
        >
          分值：{{ cardRef.score }}
          <q-popup-proxy
            cover
            v-if="useAuths('score', ['card'])"
            class="shadow-24"
          >
            <q-card
              bordered
              flat
              class="row no-wrap gap-xs items-center q-pa-xs"
            >
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
        <q-space />
        <CardExecutor
          v-if="show_byPreference?.executor?.value && !isExternal"
          :card="cardRef"
          :executor="executor"
          :isCreator="isCreator"
          @attachExecutor="attachExecutorFn"
        />
      </q-card-section>
      <!-- 封面 -->
      <q-card-section
        v-if="default_version?.media?.url"
        class="relative-position no-padding full-height"
        @mouseenter="uiStore.dragReelscrollEnable = true"
      >
        <FileViewer
          v-if="default_version?.media"
          :file="default_version?.media"
          :videoOption="videoOption"
          :height="uiStore.reelHeight"
          :clean="true"
          mainStyle="no-padding"
        />
        <div
          class="absolute-full bg-gradient-bottom-black hover-hide transition"
          @dblclick.stop="
            _enterSegment(useAuths('read', ['card']))
          "
        ></div>
      </q-card-section>
      <!-- 卡片底部 -->
      <q-card-section
        class="dragItem row no-wrap gap-sm items-center q-px-sm q-py-xs hovered-item absolute-bottom z-fab q-mb-sm"
        :class="isExternal ? '' : 'dragBar'"
        @dblclick="_enterSegment(useAuths('read', ['card']))"
        @mouseenter="uiStore.dragReelscrollEnable = false"
      >
        <StatusMenu
          v-if="show_byPreference?.status?.value"
          :modify="useAuths('status', ['card'])"
          :status="cardRef.status"
          @statusChange="_card_statusChange"
          class="undrag"
        />
        <ThreadBtn
          v-if="cardRef.mm_thread && !teamStore.card && !isExternal"
          :thread="cardRef.mm_thread"
          :show="true"
          @enterThread="enterThread"
        />
        <div
          v-if="name_changing && useAuths('name', ['card'])"
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
        <template v-if="show_byPreference?.follow?.value && !isExternal">
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
              {{ $t('followe_this_card') }}
            </q-tooltip>
          </q-btn>
        </template>
        <q-space />
        <div
          v-if="canEnter"
          class="undrag flex flex-center hover-show transition"
        >
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="fullscreen"
            class="op-5"
            @click="_enterSegment(useAuths('read', ['card']))"
          />
        </div>
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
                        flat
                        dense
                        size="sm"
                        stack
                        :icon="isExternal ? 'mdi-import' : 'mdi-arrow-expand'"
                        class="op-5"
                        padding="sm"
                        v-close-popup
                        @click="
                          _enterSegment(useAuths('read', ['card']))
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
                      <ThreadBtn
                        v-if="cardRef.mm_thread && !isExternal"
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
                    <div class="row no-wrap gap-sm">
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
                  useAuths('type', ['card']) ||
                  useAuths('status', ['card'])
                "
                spaced
                class="op-5"
              />
              <q-item
                v-if="
                  useAuths('status', ['card']) &&
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
                    :modify="true"
                    :status="cardRef.status"
                    @statusChange="_card_statusChange"
                    :isList="true"
                  />
                </q-menu>
              </q-item>
              <template v-if="useAuths('delete', ['card'])">
                <q-item
                  class="radius-xs"
                  clickable
                  v-close-popup
                  @click="removeCard(cardRef, belong_card)"
                >
                  <q-item-section>{{ $t('delete_card_segment') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-icon>
        <q-popup-proxy
          v-if="
            useAuths('read', ['card']) ||
            useAuths('name', ['card']) ||
            useAuths('color_marker', ['card']) ||
            useAuths('type', ['card']) ||
            useAuths('status', ['card']) ||
            useAuths('delete', ['card'])
          "
          context-menu
          ref="cardCtxMenu"
        >
          <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
            <q-item v-if="!content_channging" class="radius-xs">
              <q-item-section>
                <div class="row no-wrap gap-sm">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    stack
                    :icon="isExternal ? 'mdi-import' : 'mdi-arrow-expand'"
                    class="op-5"
                    padding="sm"
                    v-close-popup
                    @click="
                      _enterSegment(useAuths('read', ['card']))
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
                  <ThreadBtn
                    v-if="cardRef.mm_thread && !isExternal"
                    :thread="cardRef.mm_thread"
                    :show="true"
                    :rounded="false"
                    @enterThread="enterThread"
                  />
                </div>
              </q-item-section>
            </q-item>
            <template
              v-if="
                show_byPreference?.color_marker?.value &&
                useAuths('color_marker', ['card'])
              "
            >
              <q-separator spaced class="op-5" />
              <q-item>
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
              <q-separator spaced class="op-5" />
            </template>
            <q-item
              v-if="
                useAuths('status', ['card']) &&
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
            <template v-if="useAuths('delete', ['card'])">
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
      </q-card-section>
      <!-- 重要度、紧急度 左边框颜色标记 -->
      <div
        class="absolute-left full-height z-fab"
        :class="`${highlight ? 'highlight transition' : ''}`"
        :style="`${style}`"
      ></div>
      <div v-if="uiStore.dragscrollmove" class="absolute-full z-max"></div>
    </q-card>
</template>

<script setup>
import {
  reactive,
  ref,
  toRefs,
  watch,
  watchEffect,
  computed,
  nextTick,
  onMounted
} from "vue";
import {onKeyStroke, useMagicKeys} from '@vueuse/core';
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import overlappingAvatar from "src/pages/team/components/widgets/overlappingAvatar.vue";
import CardExecutor from "src/pages/team/card/components/CardExecutor.vue";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import {
  attachExecutor,
  unfollowCard,
  followCard,
  clac_cardEdgeStyle,
  clac_todoData,
  updateCardName,
  setCardColor,
  setScore,
  removeCard,
  enterSegment,
  setStatus,
} from "src/hooks/team/useCard.js";
import { colorMarks, preferences } from "src/pages/team/hooks/useSettingTemplate.js";
import ThreadBtn from "../components/widgets/ThreadBtn.vue";
import ReName from "../components/widgets/icons/ReName.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import FileViewer from "src/components/VIewComponents/FileViewer.vue";
import useProject from 'src/hooks/project/useProject.js'
import useSocket from "src/pages/team/card/hooks/useSocket.js";
import useMember from "src/hooks/team/useMember.js";

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
  column: {
    type: Object,
    default: null,
  },
});
const { card: cardRef, column } = toRefs(props);
const videoOption = {
  muted: true,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: false,
  fullscreenWeb: false,
};

const AUTH = ref();
onKeyStroke(['Escape'], (e) => {
  e.preventDefault();
  if(uiStore.activeReel) return
  _enterSegment(AUTH.value)
});

const isExternal = computed(() => teamStore.project?.isExternal || false);
const project_card_preference = computed(
  () =>
    teamStore.project?.preferences?.find(i => i.name === 'card_settings')?.settings
);
const show_inPreference = (val) => {
  return project_card_preference.value.find((item) => item.val === val);
};

const show_byPreference = {};
for (const key in preferences) {
  show_byPreference[key] = computed(
    () => show_inPreference(preferences[key])?.enable
  );
}
const { _isCreator } = useMember();
const isCreator = computed(() => {
  return _isCreator(teamStore.init?.id, cardRef.value?.card_members, cardRef.value?.member_roles)
})
const isInCard = ref(false);
const canEnter = computed(() => {
  let _can = false;
  const cantTypes = ["todo", "note"];
  if (!cantTypes.includes(cardRef.value?.type) || !isExternal.value) {
    _can = true;
  }
  return _can;
});
const default_version = computed(() => {
  const { overview } = useProject(cardRef.value);
  return overview
});
const media = ref();
const belong_card = ref();
watch(cardRef, () => {
  if (cardRef.value && cardRef.value.overviews?.length > 0) {
    media.value =
      cardRef.value.overviews.find(
        (i) => i.version === cardRef.value.default_version
      )?.media?.url || cardRef.value.overviews[0]?.media?.url;
  }
  belong_card.value = teamStore.card || null;
});

const executor = ref();
const { style, highlight } = clac_cardEdgeStyle(cardRef.value);

const { todo_process, todo_processColor } = clac_todoData(cardRef.value);

const is_followed = computed(() =>
  cardRef.value?.followed_bies
    ?.map((i) => i.id)
    .includes(teamStore.init?.id)
);
const color_marker = computed(() => {
  const _card_colorMarker = cardRef.value?.color_marker;
  if(!_card_colorMarker || _card_colorMarker === 'clear'){
    return null
  } else {
    return _card_colorMarker
  }
});
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
};

const _updateCardName = async (card, name) => {
  await updateCardName(card, name);
  name_changing.value = false;
};
const updateContent = (event) => {
  updateParmars.data.name = event.target.innerHTML;
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
const scores = [1, 2, 3, 5, 8, 13, 21];
const _setScore = async (val) => {
  await setScore(cardRef.value, val);
};

const content_channging = ref(false);

const cardCtxMenu = ref();
const hideCtxMent = () => {
  cardCtxMenu.value.hide();
};

const _enterSegment = async (auth) => {
  hideCtxMent();
  if (!auth) {
    return;
  }
  uiStore.activeReel = column.value?.id;
  await enterSegment(cardRef.value);
};

const { current } = useMagicKeys();
const keys = computed(() => Array.from(current));
watch(
  keys,
  () => {
    if (keys.value) {
      if (keys.value?.includes("escape") && content_channging.value) {
        content_channging.value = false;
      }
    }
  },
  { immediate: false, deep: false }
);

onMounted(async() => {
  await nextTick();
  useSocket(cardRef);
})
</script>

<style lang="scss" scoped>
.highlight {
  width: 5px;
}
.cardBody:hover .highlight {
  width: 1px;
}
.openedCard {
  border: 3px solid #1976D2;
}
</style>
