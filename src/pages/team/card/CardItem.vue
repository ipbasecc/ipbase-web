<template>
  <div v-if="cardRef?.type" :key="`card-${cardRef.id}`" class="flex flex-center kanban-card" :class="`
        ${cardRef.status === 'completed' && teamStore.navigation === 'kanban' ? 'op-3' : ''}
        ${$q.dark.mode && !actived ? 'text-grey-1' : 'text-grey-9'}
      `" ref="cardDomRef" :style="`${$q.screen.gt.xs ? 'width: 320px' : 'width: 100%'}`">
    <q-card v-if="cardRef?.error" bordered>
      <q-card-section>
        {{ $t(cardRef.error) }}
      </q-card-section>
    </q-card>
    <!-- 此处qCard组件不能添加class名：card，会导致其内部的input组件无法框选、或点击修改光标位置 -->
    <q-card v-else-if="cardRef && viewTypeRef === 'card'" bordered flat
      class="full-width column no-wrap overflow-hidden hovered-item" :class="`${content_channging ? 'focus' : ''}
        ${$q.screen.gt.xs ? 'cardBody' : ''}
        ${actived ? 'border-primary' : ''}
      `" :tabindex="cardRef.id" @dblclick="tryEnter">
      <!-- 卡片顶部 -->
      <div v-if="cardRef.type !== 'note' && !isSale"
        class="row no-wrap items-center q-pa-xs gap-xs border-bottom hovered-item q-px-xs" :class="`
          ${useAuths('order', ['card']) &&
            !name_changing &&
            isDilgMode && orderAuth
            ? 'dragBar'
            : ''
          }
          ${actived
            ? `${$q.dark.mode ? 'bg-deep-purple-10' : 'bg-primary-9'} text-white`
            : 'transparent'}
        `" style="min-height: 34px;">
        <div>
          <StatusMenu v-if="show_byPreference?.status?.value" dense :modify="useAuths('status', ['card'])"
            :status="cardRef.status" @statusChange="_card_statusChange" class="undrag" />
        </div>
        <div v-if="name_changing && useAuths('name', ['card']) && !isShared"
          class="undrag text-medium q-space cursor-text q-px-sm z-fab" style="
            writing-mode: lr;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          " :contenteditable="true" autofocus @input="updateContent" :class="name_changing ? 'border-bottom' : ''"
          @blur="_updateCardName(cardRef, updateParmars.data.name)" @keydown.esc="name_changing = false"
          @keyup.enter="_updateCardName(cardRef, updateParmars.data.name)">
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
        <q-btn v-if="!content_channging && !isSale" dense size="sm" unelevated round
          :icon="cardRef.expand !== 'collapse' ? 'unfold_less' : 'unfold_more'"
          class="hover-show transition undrag q-mr-xs cursor-pointer" @click="toggleExpand(cardRef)">
          <q-tooltip class="font-small" :class="$q.dark.mode ? 'bg-black text-grey-1' : 'bg-white text-grey-10'
            ">
            {{ cardRef.expand === "collapse" ? $t('expand') : $t('collapse') }} {{ $t('card') }}
          </q-tooltip>
        </q-btn>
        <q-chip v-if="multiple_versions && isSale" dense outline color="green" :label="$t('multiple_versions')"
          class="undrag cursor-pointer">
          <q-menu v-if="!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron">
            <q-list bordered dense class="radius-sm q-pa-xs column gap-xs">
              <q-item v-for="(i, index) in cardRef.overviews.filter(ov => ov.media)" :key="i.id" class="radius-xs"
                :class="media?.id === i.media?.id ? 'bg-primary' : ''" clickable v-close-popup
                @click="toggleVersion(i)">
                <q-item-section side>
                  <q-avatar size="sm">{{ index }}</q-avatar>
                </q-item-section>
                <q-item-section>{{ i.name === 'Initial_Version' ? $t(i.name) : i.name }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-chip>
        <CardExecutor v-if="
          show_byPreference?.executor?.value &&
          !isExternal &&
          !isSale &&
          !isShared
        " :card="cardRef" :executor="executor" :cardMembers="cardMembers" :isCreator="isCreator"
          @attachExecutor="attachExecutorFn" />
      </div>
      <!-- 封面 -->
      <q-card-section v-if="teamStore.navigation !== 'kanban' || cardRef.expand !== 'collapse'"
        class="q-pa-none scroll-y mini-ui" style="max-height: 61vh;padding: 0 1px">
        <template v-if="!isElectron">
          <q-bar class="transparent dragBar absolute-top z-fab">
          </q-bar>
          <FileViewer v-if="media?.url && !isSale" :key="media.url" :file="quality?.length > 0 ? {
            id: media.id,
            ext: media.ext,
            url: quality[quality.length - 1].url,
          } : media" :videoOption="videoOption" :by_width="true" mainStyle="no-padding" />
          <MediaViewer v-else-if="cardRef.cover?.url && isSale" class="dragBar"
            :ratio="mediaType(cardRef.cover?.url) === 'video' ? 16 / 9 : 16 / 7" :url="cardRef.cover?.url" />
          <q-responsive v-else-if="alwaysShowCover" :ratio="16 / 5">
            <div class="rounded-borders flex flex-center">
              {{ $t('no_cover') }}
            </div>
          </q-responsive>

        </template>
        <q-responsive v-else :ratio="16 / 5" @click="show_cardDetial = true">
          <div class="rounded-borders flex flex-center">
            {{ $t('only_electron') }}
          </div>
        </q-responsive>
        <template v-if="show_unpublished_chip">
          <q-chip color="negative" square :label="$t('unpublished')" class="absolute-top-left" />
        </template>
        <q-chip v-if="cardRef.pulled" color="negative" square :label="$t('is_pulled')" class="absolute-top-left" />
      </q-card-section>
      <!-- 任务、备忘 -->
      <q-card-section v-if="cardRef.type !== 'todo' && !isSale"
        class="q-space column no-wrap card overflow-hidden no-padding"
        :style="cardRef.expand === 'collapse' ? 'max-height: 6rem' : ''" @click="expandCard(cardRef)">
        <TipTap :jsonContent="cardRef.jsonContent" :editable="useAuths('jsonContent', ['card']) && !isShared"
          :need="'json'" :square="true" :show_toolbar="false" :show_bubbleMenu="false" class="undrag"
          styleClass="q-px-md q-py-sm" :hideScroll="cardRef.expand === 'collapse'" :autofocus="false" :contentChanged
          @contentChanged="contentChanged = true" @tiptapBlur="tiptapBlur" @tiptapClose="toggleOffEditting()"
          @click.stop="clickContent(useAuths('jsonContent', ['card']))" @keydown.esc="uiStore.edittingCard = void 0" />
      </q-card-section>
      <!-- 待办 -->
      <q-card-section v-if="cardRef.type === 'todo' && !isSale"
        class="column no-wrap q-pa-none overflow-hidden relative-position" :class="uiStore.todoDragging
            ? 'border-dashed border-op-sm bg-primary-active'
            : 'border-placeholder'
          " style="min-height: 6rem" :style="cardRef.expand === 'collapse' ? 'max-height: 6rem' : ''"
        @click="expandCard(cardRef)">
        <AffairsContainer :todogroups="cardRef?.todogroups" :auth="useAuths('content', ['card_todo'])" :card="cardRef"
          :hideToolbar="true" :dense="true" :uiOptions
          :class="(cardRef?.todogroups?.length === 0 || !cardRef?.todogroups) ? 'absolute-full' : ''" _for="card"
          layout="column" />
      </q-card-section>
      <!-- 卡片底部 -->
      <q-card-section v-show="cardRef?.expand !== 'collapse'"
        class="row no-wrap gap-sm q-pa-xs hovered-item z-fab" :class="`
          ${isDilgMode && orderAuth ? 'dragBar' : ''}
          ${cardRef.type !== 'note' ? 'border-top items-end q-pb-sm' : 'border-bottom items-center'}
          ${isSale ? `absolute-full bg-gradient-bottom-${$q.dark.mode ? 'black' : 'white'}` : ''}
        `" :style="cardRef.type === 'note' ? 'order: -1' : ''" @dblclick="_enterCard(useAuths('read', ['card']))">
        <template v-if="cardRef.type !== 'note'">
          <div v-if="isSale" class="q-px-sm q-space column no-wrap gap-xs undrag cursor-pointer"
            @click="_enterCard(useAuths('read', ['card']))">
            <span v-if="cardRef.name">{{ cardRef.name }}</span>
            <PayState v-if="cardRef.type === 'classroom'" :card="cardRef" />
          </div>
          <ThreadBtn v-if="
            cardRef.mm_thread && !teamStore.card && isDilgMode && !isShared && !isSale
          " :thread="cardRef.mm_thread" :show="true" @enterThread="enterThread" />
          <template v-if="show_byPreference?.follow?.value && !isExternal && !isShared && !isSale">
            <overlappingAvatar v-if="cardRef.followed_bies?.length > 0" :members="cardRef.followed_bies" :size="22"
              @click="unfollowCard(cardRef)" class="undrag cursor-pointer">
              <template #tooltip>
                <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
                  {{ $t('followed_card') }}
                </q-tooltip>
              </template>
            </overlappingAvatar>
            <q-btn v-if="
              !is_followed && useAuths('followed_bies', ['card'])
            " dense round flat size="sm" class="hover-show transition undrag cursor-pointer" icon="bookmark_add"
              @click="followCard(cardRef)">
              <q-tooltip :class="$q.dark.mode ? 'bg-black' : 'bg-white'">
                {{ $t('followed_card') }}
              </q-tooltip>
            </q-btn>
          </template>
          <q-space />
          <div v-if="!isDilgMode" class="undrag flex flex-center hover-show transition">
            <q-btn flat dense size="sm" round icon="mdi-import" class="op-5"
              @click="_enterCard(useAuths('read', ['card']))" />
          </div>
          <div v-else class="undrag flex flex-center hover-show transition">
            <q-btn flat dense size="sm" round icon="fullscreen" class="op-5"
              @click="_enterCard(useAuths('read', ['card']))">
              <q-tooltip :class="$q.dark.mode ? 'bg-black text-grey-1' : 'bg-white text-grey-10'
                " class="border">
                {{ $t('view_detial') }}
              </q-tooltip>
            </q-btn>
          </div>
        </template>
        <template v-else>
          <q-icon name="mdi-note" color="yellow" class="op-5 q-ml-xs" />
          <q-space />
        </template>
        <q-btn v-if="!isShared || (isShared && color_marker)" flat dense :size="cardRef.type === 'note' ? 'xs' : 'sm'"
          round :icon="color_marker && show_byPreference?.color_marker?.value
              ? 'mdi-checkbox-blank-circle'
              : 'more_vert'
            " :color="color_marker && show_byPreference?.color_marker?.value
              ? color_marker
              : 'grey'
            " class="cursor-pointer undrag" :class="!color_marker ? 'hover-show transition' : ''">
          <q-menu v-if="!isShared" class="shadow-24 radius-sm">
            <q-list bordered dense class="radius-sm q-pa-xs text-no-wrap">
              <template v-if="!content_channging && cardRef.type !== 'note'">
                <q-item class="radius-xs">
                  <q-item-section>
                    <div class="row no-wrap gap-sm">
                      <q-btn flat dense size="sm" stack :icon="!isDilgMode ? 'mdi-import' : 'mdi-arrow-expand'"
                        class="op-5" padding="sm" v-close-popup @click="
                          _enterCard(useAuths('read', ['card']))
                          ">
                        <q-tooltip>
                          <span class="font-medium">
                            {{ isSale ? cardRef.type === 'classroom' ? $t('course_detial') : $t('resource_detial') :
                            $t('task_detial') }}
                          </span>
                        </q-tooltip>
                      </q-btn>
                      <template v-if="isSale && cardRef.creator?.id === teamStore.init?.id">
                        <q-space />
                        <q-btn flat dense size="sm" stack class="op-5" padding="sm" v-close-popup @click="editCard()">
                          <ReName />
                          <q-tooltip>
                            <span class="font-medium">
                              {{ isSale ? cardRef.type === 'classroom' ? $t('edit_course') : $t('edit_resource') :
                              $t('rename_card') }}
                            </span>
                          </q-tooltip>
                        </q-btn>
                      </template>
                      <template v-if="!isSale">
                        <q-btn v-if="useAuths('name', ['card'])" flat dense size="sm" stack class="op-5" padding="sm"
                          v-close-popup @click="name_changing = true">
                          <ReName />
                          <q-tooltip>
                            <span class="font-medium">{{ $t('rename_card') }}</span>
                          </q-tooltip>
                        </q-btn>
                        <q-space />
                        <q-btn v-if="!cardRef.disable_share" flat dense size="sm" stack icon="share" class="op-5"
                          padding="sm" v-close-popup @click="shareCard()" />
                        <ThreadBtn v-if="cardRef.mm_thread && isDilgMode" :thread="cardRef.mm_thread" :show="true"
                          :rounded="false" @enterThread="enterThread" />
                      </template>
                    </div>
                  </q-item-section>
                </q-item>
              </template>
              <template v-if="
                show_byPreference?.color_marker?.value &&
                useAuths('color_marker', ['card'])
              ">
                <q-separator v-if="cardRef.type !== 'note' && cardRef.type !== 'classoom'" spaced class="op-5" />
                <q-item>
                  <q-item-section>
                    <div class="row no-wrap items-center gap-sm">
                      <q-icon v-for="marker in colorMarks" :key="marker" dense :size="cardRef?.color_marker === marker ? '24px' : '16px'
                        " flat round padding="none" :color="marker" :name="cardRef?.color_marker === marker
                            ? 'mdi-checkbox-marked-circle'
                            : 'mdi-checkbox-blank-circle'
                          " class="cursor-pointer" v-close-popup @click="setCardColor(cardRef, marker)" />
                    </div>
                  </q-item-section>
                </q-item>
              </template>
              <q-separator v-if="
                (useAuths('type', ['card']) ||
                  useAuths('status', ['card'])) &&
                !isSale
              " spaced class="op-5" />
              <q-item v-if="
                useAuths('type', ['card']) &&
                !isSale
              " class="radius-xs" clickable>
                <q-item-section>{{ $t('change_to') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu auto-close anchor="top end" self="top start">
                  <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                    <q-item v-for="i in cardTypes" :key="i.val" dense clickable class="radius-xs"
                      :class="i.val === cardRef.type ? 'bg-primary' : ''" @click="setCardType(cardRef, i.val)">
                      <q-item-section side><q-icon :name="i.icon" size="xs" /></q-item-section>
                      <q-item-section><span class="q-pr-md">{{
                        $t(i.label)
                          }}</span></q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-item v-if="
                useAuths('status', ['card']) &&
                cardRef.type === 'task' &&
                show_byPreference?.status?.value
              " class="radius-xs" clickable>
                <q-item-section>{{ $t('status') }}：</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu auto-close anchor="top end" self="top start">
                  <StatusMenu :status="cardRef.status" :modify="useAuths('status', ['card'])"
                    @statusChange="_card_statusChange" :isList="true" />
                </q-menu>
              </q-item>
              <template v-if="useAuths('delete', ['card'])">
                <q-separator spaced class="op-5" />
                <q-item class="radius-xs" clickable v-close-popup @click="removeCard(cardRef, belong_card)">
                  <q-item-section>{{ $t('delete') }}{{
                    isSale ? cardRef.type === 'classroom' ? $t('class_card') : $t('resource_card') : $t('task_card')
                  }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card-section>
      <template v-if="cardRef.expand === 'collapse'">
        <div @dblclick="_enterCard(useAuths('read', ['card']))"
          class="absolute-bottom bg-gradient-bottom-unfold_card full-width" style="height: calc(100% - 34px)"></div>
        <q-btn @click="toggleExpand(cardRef)" dense square unelevated icon-right="mdi-chevron-down"
          :label="$t('show_more')" class="full-width hover-highlight-lg" />
      </template>
      <!-- 重要度、紧急度 左边框颜色标记 -->
      <div class="absolute-left full-height z-fab" :class="`${edgeStyle.highlight ? 'highlight transition' : ''}`"
        :style="`${edgeStyle.style}`"></div>
      <q-tooltip v-if="cardRef.type === 'classroom' && !isRmptyTiptap(cardRef.jsonContent)"
        class="transparent no-padding no-margin shadow-focus"
      >
        <q-card bordered style="width: 320px;" :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-10'">
          <q-card-section class="q-pb-xs font-large font-bold-600">
            {{ cardRef.name }}
          </q-card-section>
          <q-card-section class="q-pa-xs font-medium">
            <TipTap :jsonContent="cardRef.jsonContent" :editable="false"
              :need="'json'" :square="true" :show_toolbar="false" :show_bubbleMenu="false"
              styleClass="q-px-md q-py-sm"
            />
          </q-card-section>
        </q-card>
      </q-tooltip>
    </q-card>
    <!-- 对话框中，需要使用esc来取消输入框的聚焦状态，这里关闭组件的esc事件 -->
    <q-dialog ref="card_detial" v-model="show_cardDetial" :full-height="$q.screen.gt.sm" :full-width="$q.screen.gt.sm"
      :maximized="!$q.screen.gt.sm" persistent no-shake allow-focus-outside
      :transition-show="teamStore?.card ? '' : 'slide-down'" transition-hide="slide-up" transition-duration="300"
      @show="teamStore.showCards = true" @hide="_leaveCard()" class="blur-sm transition">
      <template v-if="isSale">
        <!-- 仅限客户端查看，此功能暂不开启，因此设置为false -->
        <q-card v-if="false" bordered class="column">
          <q-toolbar class="bg-deep-orange text-white">
            <div class="text-h6">{{ $t('only_electron') }}</div>
            <q-space />
            <q-btn dense flat round icon="close" v-close-popup />
          </q-toolbar>
          <q-card-section class="q-space column flex-center">
            <DownloadApp flat :nobar="true" />
          </q-card-section>
        </q-card>
        <ClassPage v-else-if="cardRef.type === 'classroom'" :card="cardRef" @buyData="buyData"
          @publishCard="publishCard(cardRef)" @pulledCard="pulledCard(cardRef)" @unpulledCard="unpulledCard(cardRef)" />
        <template v-else-if="cardRef.type === 'resource'">
          <SalePage v-if="editResource" :card_id="cardRef.id" @publishCard="publishCard(cardRef)"
            @pulledCard="pulledCard(cardRef)" @unpulledCard="unpulledCard(cardRef)" />
          <q-card v-else bordered class="column no-wrap">
            <q-bar dark class="row no-wrap q-pa-sm transparent">
              <q-space />
              <q-btn flat dense size="sm" round icon="mdi-close" v-close-popup />
            </q-bar>
            <ResourcePage style="margin: 0 auto;" class="q-py-none" :card_id="cardRef.id" @buyData="buyData" />
          </q-card>
        </template>
      </template>
      <CardPage v-else />
    </q-dialog>
    <q-dialog v-model="shareDlg" persistent>
      <CreateShare v-if="cardRef" :share_item="cardRef" :share_props="shareProps" is="card" @createShare="createShare"
        @closeShare="shareDlg = false" />
    </q-dialog>
    <q-dialog v-model="editCareDlg" persistent>
      <EditCard :card="cardRef" @updated="updated" />
    </q-dialog>
  </div>
</template>

<script setup>
  import { computed, reactive, ref, toRef, toRefs, watch, watchEffect, nextTick, onMounted, onBeforeUnmount } from "vue";
  import { useMagicKeys } from "@vueuse/core";
  import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
  import CardPage from "./CardPage.vue";
  import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
  import overlappingAvatar from "src/pages/team/components/widgets/overlappingAvatar.vue";
  import AffairsContainer from 'src/pages/team/todo/AffairsContainer.vue'
  import CardExecutor from "src/pages/team/card/components/CardExecutor.vue";
  import { mediaType } from 'src/hooks/utilits';

  import { useRoute } from "vue-router";
  import { useQuasar } from "quasar";
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
    updateJsonContent,
    publishCard,
    pulledCard,
    unpulledCard
  } from "src/hooks/team/useCard.js";
  import { isEqual } from "lodash-es";
  import { colorMarks, cardTypes, preferences, shareProps } from "src/pages/team/hooks/useSettingTemplate.js";
  import ThreadBtn from "../components/widgets/ThreadBtn.vue";
  import ReName from "../components/widgets/icons/ReName.vue";
  import { teamStore, uiStore } from "src/hooks/global/useStore.js";
  import ClassPage from "./ClassPage.vue";
  import FileViewer from "src/components/VIewComponents/FileViewer.vue";
  import CreateShare from "pages/team/components/CreateShare.vue";
  import DownloadApp from 'src/components/VIewComponents/DownloadApp.vue'
  import useOverview from 'src/pages/team/hooks/useOverview.js'
  import useMember from "src/hooks/team/useMember.js";
  import PayState from './components/PayState.vue'
  import EditCard from './components/EditCard.vue'
  import SalePage from './SalePage.vue'
  import ResourcePage from './ResourcePage.vue'
  import MediaViewer from 'src/components/VIewComponents/MediaViewer.vue'
  import useSocket from "src/pages/team/card/hooks/useSocket.js";
  import { isRmptyTiptap } from "src/hooks/utilits.js"
  import { $team } from "src/boot/service";

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
    orderAuth: {
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
  const { card: cardRef, orderAuth } = toRefs(props);
  const alwaysShowCover = computed(() => {
    const _navsAlwaysShowCover = ['segment', ...$team().saleTypes];
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
  const editCareDlg = ref(false);
  const editResource = ref(false);

  const updated = () => {
    editCareDlg.value = false
  }
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
  const toggleOffEditting = () => {
    uiStore.edittingCard = void 0;
  };
  const isElectron = computed(() => {
    return false; // 临时关闭此判断，允许在web端显示，等待Alpha结束
    if (!uiStore.only_electron.includes(teamStore.navigation) || $q.platform.is.electron) {
      return true
    } else {
      return false
    }
  })
  const isSale = computed(() => $team().saleTypes.includes(cardRef.value?.type))
  const cardMembers = computed(() => cardRef.value?.card_members || []);
  const { _isCreator } = useMember();
  const isCreator = computed(() => {
    if (isSale.value) {
      return cardRef.value?.creator?.id === teamStore.init?.id
    }
    return _isCreator(teamStore.init?.id, cardMembers.value, cardRef.value?.member_roles)
  })
  const show_unpublished_chip = computed(() => {
    /**
     * 是销售内容
     * 未发布
     * 是作者
     */
    return isSale.value && !cardRef.value?.published && isCreator.value
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

  const executor = ref();
  const edgeStyle = computed(() => clac_cardEdgeStyle(cardRef.value));

  const is_followed = computed(() =>
    cardRef.value?.followed_bies
      ?.map((i) => i.id)
      .includes(Number(teamStore.init?.id))
  );
  const color_marker = computed(() => {
    const _card_colorMarker = cardRef.value?.color_marker;
    if (!_card_colorMarker || _card_colorMarker === 'clear') {
      return null
    } else {
      return _card_colorMarker
    }
  });

  const updateParmars = reactive({
    project_id: route.params.project_id,
    data: {},
  });

  const name_changing = ref(false);


  const emit = defineEmits(["cardChange", "cardDelete", "buyData"]);
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
  const contentChanged = ref(false);
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
      contentChanged.value = false;
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
    if (cardRef.value?.type === 'note') return
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
  const editCard = (card) => {
    if (cardRef.value.type === 'resource') {
      editResource.value = true;
      show_cardDetial.value = true;
    } else {
      editCareDlg.value = true;
    }
  }

  const tryEnter = async () => {
    if (teamStore.shareInfo) {
      await _enterCard(true);
    }
  };
  const buyData = (data) => {
    emit('buyData', data)
  };

  const toggleExpand = async (card) => {
    cardRef.value.expand =
      cardRef.value.expand === "expand" ? "collapse" : "expand";
    await cacheExpand(card, cardRef.value.expand);
  };

  const expandCard = async (card) => {
    if (!cardRef.value?.expand) return
    cardRef.value.expand = "expand";
    await cacheExpand(card, "expand");
  };
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

  const _leaveCard = () => {
    editResource.value = false;
    leaveCard();
  };

  const cleanupFunctions = [];

  const setupWatchers = () => {
    cleanupFunctions.push(
      watch(keys, () => {
        if (keys.value) {
          if (keys.value?.includes("escape") && content_channging.value) {
            toggleOffEditting();
          }
        }
      }, { immediate: false, deep: false }),

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
      }, { immediate: true, deep: true }),

      watch([storeCard, storeCardMedia, storeCardVersion], () => {
        if (storeCard.value?.id === cardRef.value.id && storeCardMedia.value && storeCardVersion.value) {
          media.value = storeCardMedia.value

          const { quality: _quality } = useOverview(storeCardVersion.value)
          quality.value = _quality.value;
        }
      }, { immediate: false, deep: false }),


      watchEffect(() => {
        if (content_channging.value) {
          expandCard(cardRef.value);
        }
      }),
      watchEffect(() => {
        if (!teamStore.card) {
          show_cardDetial.value = false;
        }
      }),
      watchEffect(() => {
        if (!cardRef.value) return;
        isInCard.value = teamStore.card?.id === cardRef.value?.id;

        if (!isSale.value) {
          const executorRole = cardRef.value?.member_roles?.find(
            (i) => i.subject === "executor"
          );
          // 一个卡片只能有一个负责人，因此这里可以使用 find 方法
          executor.value = cardRef.value?.card_members?.find((i) =>
            i.member_roles.map((j) => j.id)?.includes(executorRole.id)
          );
        }
      }),

      watchEffect(() => {
        isDilgMode.value = !isExternal.value && !uiStore.isFocusMode
        actived.value = teamStore.thread?.id === cardRef.value.mm_thread?.id || teamStore.card?.id === cardRef.value.id;
      })
    )
  }

  // 优化事件监听器
  const cleanupFns = [];
  const setupEventListeners = () => {
    if (cardDomRef.value) {
      const resizeObserver = new ResizeObserver((entries) => {
        cardSize.value = entries[0].contentRect;
      });

      resizeObserver.observe(cardDomRef.value);
      cleanupFns.push(() => resizeObserver.disconnect());
    }
  };
  onBeforeUnmount(() => {
    cleanupFunctions.forEach(cleanup => cleanup());
      cleanupFns.forEach(fn => fn());
  });

  onMounted(async () => {
    await nextTick();
    setupEventListeners();
    updateCardThread(cardRef);
    useSocket(cardRef);
    setupWatchers();
  });
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
