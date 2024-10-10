<template>
  <div v-if="cardRef.expand"
    :key="`card-${cardRef.id}`"
    class="flex flex-center"
    :class="`
        ${cardRef.status === 'completed' && teamStore.navigation === 'kanban' ? 'op-3' : ''}
        ${ $q.dark.mode && !actived ? 'text-grey-1' : 'text-grey-9' }
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
    <q-card v-else-if="cardRef && viewTypeRef === 'card'"
      bordered
      flat
      class="full-width column no-wrap overflow-hidden"
      :class="`${content_channging ? 'focus' : ''}
        ${$q.screen.gt.xs ? 'cardBody' : ''}
        ${actived ? 'border-primary' : ''}
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
        style="min-height: 34px;"
      >
        <div>
          <StatusMenu
            v-if="show_byPreference?.status?.value"
            dense
            :modify="useAuths('status', ['card'])"
            :status="cardRef.status"
            @statusChange="_card_statusChange"
            class="undrag"
          />
        </div>
        <div v-if="name_changing && useAuths('name', ['card']) && !isShared"
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
        <q-chip v-if="multiple_versions && cardRef.type === 'classroom'" dense outline color="green" :label="$t('multiple_versions')" class="undrag cursor-pointer">
          <q-menu v-if="!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron">
            <q-list bordered dense class="radius-sm q-pa-xs column gap-xs">
              <q-item
                v-for="(i,index) in cardRef.overviews.filter(ov => ov.media)"
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
        v-if="teamStore.navigation !== 'kanban' || cardRef.expand !== 'collapse'"
        class="q-pa-none scroll-y mini-ui"
        style="max-height: 61vh;padding: 0 1px"
      >
        <template v-if="!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron">
          <FileViewer
            v-if="media?.url"
            :key="media.url"
            :file="quality?.length > 0 ? {
              id: media.id,
              ext: media.ext,
              url: quality[quality.length - 1].url,
            } : media"
            :videoOption="videoOption"
            :by_width="true"
            mainStyle="no-padding"
          />
          <q-responsive v-else-if="alwaysShowCover" :ratio="16/5">
            <div class="rounded-borders flex flex-center">
              {{ $t('only_electron') }}
            </div>
          </q-responsive>

        </template>
        <div v-else class="column flex-center q-py-md cursor-pointer" @click="show_cardDetial = true">
          <q-responsive :ratio="16/5">
            <div class="rounded-borders flex flex-center">
              {{ $t('only_electron') }}
            </div>
          </q-responsive>
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
          :editable="useAuths('jsonContent', ['card']) && !isShared"
          :need="'json'"
          :square="true"
          :show_toolbar="false"
          styleClass="q-px-md q-py-sm"
          :hideScroll="cardRef.expand === 'collapse'"
          :autofocus="false"
          class="undrag"
          @tiptapBlur="tiptapBlur"
          @tiptapClose="toggleOffEditting()"
          @click.stop="clickContent(useAuths('jsonContent', ['card']))"
          @keydown.esc="uiStore.edittingCard = void 0"
        />
      </q-card-section>
      <!-- 待办 -->
      <q-card-section
        v-if="cardRef.type === 'todo' && cardRef.type !== 'classroom'"
        class="column no-wrap q-pa-none overflow-hidden relative-position"
        :class="
          uiStore.dragging
            ? 'border-dashed border-op-sm bg-primary-active'
            : 'border-placeholder'
        "
        style="min-height: 6rem"
        :style="cardRef.expand === 'collapse' ? 'max-height: 6rem' : ''"
        @click="expandCard(cardRef)"
      >
        <AffairsContainer
          :todogroups="cardRef?.todogroups"
          :auth="useAuths('content', ['card_todo'])"
          :card="cardRef"
          :hideToolbar="true"
          :dense="true"
          :uiOptions
          _for="card"
          layout="column"
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
        <div v-if="!isDilgMode"
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
        <div v-else
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
        <q-icon v-if="!isShared || (isShared && color_marker)"
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
        <div @dblclick="_enterCard(useAuths('read', ['card']))"
          class="absolute-bottom bg-gradient-bottom-unfold_card full-width"
          style="height: calc(100% - 34px)"
        ></div>
        <q-btn @click="toggleExpand(cardRef)"
          dense
          square
          unelevated
          icon-right="mdi-chevron-down"
          :label="$t('show_more')"
          class="full-width hover-highlight-lg"
        />
      </template>
      <!-- 重要度、紧急度 左边框颜色标记 -->
      <div class="absolute-left full-height z-fab"
        :class="`${edgeStyle.highlight ? 'highlight transition' : ''}`"
        :style="`${edgeStyle.style}`"
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
        :card="cardRef"
      />
      <q-card v-else bordered class="column">
        <q-toolbar class="bg-deep-orange text-white">
          <div class="text-h6">{{ $t('only_electron') }}</div>
          <q-space />
          <q-btn dense flat round icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="q-space column flex-center">
          <DownloadApp flat :nobar="true" />
        </q-card-section>
      </q-card>
    </template>
      <CardPage
        v-else
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
import {computed, reactive, ref, toRef, toRefs, watch, watchEffect, nextTick, onMounted} from "vue";
import {useMagicKeys} from "@vueuse/core";
import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
import CardPage from "./CardPage.vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import overlappingAvatar from "src/pages/team/components/widgets/overlappingAvatar.vue";
import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
import CardExecutor from "src/pages/team/card/components/CardExecutor.vue";

import {useRoute} from "vue-router";
import {useQuasar} from "quasar";
import {
  attachExecutor,
  cacheExpand,
  clac_cardEdgeStyle,
  enterCard,
  followCard,
  leaveCard,
  removeCard,
  setCardColor,
  setCardSharecode,
  setCardType,
  setScore,
  setStatus,
  unfollowCard,
  updateCardName,
  updateCardThread,
  updateJsonContent
} from "src/hooks/team/useCard.js";
import {isEqual} from "lodash-es";
import {useProjectCardPreference,colorMarks,cardTypes,preferences,shareProps} from "src/pages/team/hooks/useSettingTemplate.js";
import ThreadBtn from "../components/widgets/ThreadBtn.vue";
import ReName from "../components/widgets/icons/ReName.vue";
import {teamStore, uiStore, userStore, mm_wsStore} from "src/hooks/global/useStore.js";
import ClassPage from "./ClassPage.vue";
import FileViewer from "src/components/VIewComponents/FileViewer.vue";
import CreateShare from "pages/team/components/CreateShare.vue";
import DownloadApp from 'src/components/VIewComponents/DownloadApp.vue'
import useOverview from 'src/pages/team/hooks/useOverview.js'
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
});
const { card: cardRef } = toRefs(props);
const alwaysShowCover = computed(() => {
  const _navsAlwaysShowCover = ['classroom', 'segment'];
  return _navsAlwaysShowCover.includes(teamStore.navigation);
});

const viewTypeRef = toRef(props, "viewType");
const isShared = computed(() => uiStore.isShared);
const videoOption = {
  muted: true,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: true,
  fullscreenWeb: false,
};

const isExternal = computed(() => teamStore.project?.isExternal || false);
const isDilgMode = ref(true);
const actived = ref(false);

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
const { _isCreator } = useMember();
const isCreator = computed(() => {
  return _isCreator(userStore.userId, cardMembers.value, cardRef.value?.member_roles)
})
const isInCard = ref(false);
const multiple_versions = computed(() => cardRef.value?.overviews?.length > 1);
const media = ref();
const quality = ref([]);
const storeCard = computed(() => teamStore.card);
const storeCardMedia = computed(() => teamStore.card?.activeVersion?.media);
const storeCardVersion = computed(() => teamStore.card?.activeVersion);
const belong_card = ref();
const toggleVersion = (i) => {
  // console.log('toggleVersion', i);
  media.value = i.media;
  cardRef.value.activeVersion = i
}
watch(cardRef, () => {
  if (cardRef.value && cardRef.value.overviews?.length > 0) {
    let version
    if (cardRef.value?.activeVersion) {
      version = cardRef.value?.activeVersion
    } else {
      version = cardRef.value.overviews?.find((i) => 
        i.version === cardRef.value.default_version
      ) || cardRef.value.overviews[0];
    }
    media.value = version.media;
    const { quality: _quality } = useOverview(version)
    quality.value = _quality.value;
  }
  belong_card.value = teamStore.card || null;
},{immediate:true,deep:true});

watch([storeCard, storeCardMedia, storeCardVersion], () => {
  if (storeCard.value?.id === cardRef.value.id && storeCardVersion.value) {    
    media.value = storeCardMedia.value

    const { quality: _quality } = useOverview(storeCardVersion.value)
    quality.value = _quality.value;
  }
},{immediate:false,deep:false})

const executor = ref();
const edgeStyle = computed(() => clac_cardEdgeStyle(cardRef.value));

const is_followed = computed(() =>
  cardRef.value?.followed_bies
    ?.map((i) => i.id)
    .includes(Number(userStore.userId))
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
watchEffect(() => {
  if(!teamStore.card){
    show_cardDetial.value = false;
  }
})
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

const cardDomRef = ref(null);
const cardSize = ref();

const { current } = useMagicKeys();
const keys = computed(() => Array.from(current));
watch(keys, () => {
  if (keys.value) {
    if (keys.value?.includes("escape") && content_channging.value) {
      toggleOffEditting();
    }
  }
},{ immediate: false, deep: false });

const _leaveCard = () => {
  leaveCard();
};

onMounted(async() => {
  await nextTick();
  useSocket(cardRef);
  updateCardThread(cardRef);
})
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
