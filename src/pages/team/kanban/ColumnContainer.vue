<template>
  <!-- 此处需要一个真实的根节点、否则拖拽插件不能正常工作 -->
  <div class="column no-wrap items-center border-placeholder" :class="`
      ${__dragging_column ? '' : 'full-height'}
      ${columnRef && view_modelRef === 'kanban' ? 'gap-xs ' : 'gap-md '}
    `">
    <template v-if="columnRef && view_modelRef === 'kanban'">
      <div class="row no-wrap items-center q-px-xs q-pt-xs gap-xs radius-xs transparent font-medium columnDragBar"
        :style="$q.screen.gt.xs ? 'width: 322px' : 'width: 100%'">
        <StatusMenu v-if="isKanban" :status="column_status" :modify="useAuths('status', ['column'])" :dense="true"
          class="flex undrag" @statusChange="statusChange" />
        <span class="q-space unselected" :class="useAuths('order', ['column']) ? 'dragBar' : ''"
          @mouseenter="uiStore.dragKanbanScrollEnable = false" @mouseleave="uiStore.dragKanbanScrollEnable = true">{{
            column_name === 'Initial_Column' ? $t(column_name) : column_name }}</span>
        <q-btn v-if="
          useAuths('name', ['column']) ||
          useAuths('delete', ['column']) ||
          isCreator
        " dense size="sm" flat round icon="more_vert" class="undrag">
          <q-menu class="border shadow-24" ref="column_menu">
            <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
              <template v-if="useAuths('name', ['column'])">
                <q-item class="no-padding">
                  <q-item-section>
                    <q-input v-model="params.data.name" type="text" :placeholder="$t('column_name')" dense square filled
                      autofocus @keyup.enter="updateColumnFn()" @keyup.ctrl.enter="updateColumnFn()"
                      @blur="updateCannel" @keyup.esc="updateCannel">
                      <template v-slot:append>
                        <q-btn dense flat size="sm" round icon="add" @click="updateColumnFn()" />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item>
              </template>
              <template v-if="isKanban">
                <q-separator spaced />
                <q-item class="radius-xs" clickable>
                  <q-item-section>{{ $t('default_create') }}：</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu auto-close anchor="top end" self="top start">
                    <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                      <q-item v-for="i in cardTypes" :key="i.val" dense clickable class="radius-xs" :class="i.val === DefaultCreateCardType ? 'bg-primary' : ''
                        " @click="setDefaultCreateCardType(i.val)">
                        <q-item-section side><q-icon :name="i.icon" size="xs" /></q-item-section>
                        <q-item-section><span class="q-pr-md">{{
                          $t(i.label)
                            }}</span></q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
                <q-item class="radius-xs" clickable>
                  <q-item-section>{{ $t('display_settings') }}：</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>
                  <q-menu auto-close anchor="top end" self="top start">
                    <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                      <q-item v-for="i in uiOptions" :key="i.val" dense clickable class="radius-xs"
                        @click="update_uiOptions(i)">
                        <q-item-section v-if="i.enable" side><q-icon :name="i.icon" color="green"
                            size="xs" /></q-item-section>
                        <q-item-section><span class="q-pr-md">{{
                          i.label
                            }}</span></q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
              </template>
              <template v-if="useAuths('delete', ['column'])">
                <q-separator spaced />
                <q-item clickable v-close-popup class="radius-xs" @click="deleteColumnFn()">
                  <q-item-section>{{ $t('delete_column') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <q-btn-group v-if="useAuths('create', ['column'])" dense unelevated size="sm" class="full-width border" no-caps>
        <q-btn dense size="sm" icon="add" :color="$q.dark.mode ? 'grey-10 text-grey-2' : 'white text-grey-10'"
          @click="CreateCardFn(columnRef.id)" class="q-space" />
        <q-btn v-if="isKanban" dense size="sm" icon="arrow_drop_down"
          :color="$q.dark.mode ? 'grey-10 text-grey-2' : 'white text-grey-10'" class="border-left">
          <q-menu class="radius-sm">
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item v-for="i in cardTypes" :key="i.val" dense clickable class="radius-xs" :class="$q.dark.mode ? 'grey-10 text-grey-1' : 'white text-grey-10'
                " v-close-popup @click="CreateCardFn(columnRef.id, i.val)">
                <q-item-section side><q-icon :name="i.icon"
                    :color="DefaultCreateCardType === i.val ? 'orange' : ''" /></q-item-section>
                <q-item-section class="q-pr-md text-no-wrap">{{ $t(i.label) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-btn-group>

      <CreateCard v-if="
        createCard_in === columnRef.id && useAuths('create', ['card'])
      " :column_id="columnRef.id" :DefaultCreateCardType="DefaultCreateCardType"
        @created="created" @createCannel="createCannel" @closeCreate="closeCreate" />
      <q-scroll-area v-if="$q.screen.gt.xs" class="full-width q-space scroll-container flex-content" :id="columnRef.id"
        ref="columnScrollRef" @mouseenter="setMouseWheelScroll">
        <VueDraggable v-model="filteredCards" :animation="200" :forceFallback="true" :fallbackOnBody="true"
          :disabled="!useAuths('order', ['card'])" handle=".dragBar" filter=".undrag" group="tasks"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="q-py-xs radius-sm column gap-sm no-wrap forbid" :class="teamStore.cardDragging ? 'q-space' : ''"
          @start="dragStart('tasks')" @end="dragEnd" @sort="onSort" ref="dropRef">
          <template v-for="element in filteredCards" :key="element.id">
            <CardItem :card="element" :data-card-id="element.id" :isCreator_column="isCreator" :viewType="'card'"
              :uiOptions="uiOptions" :orderAuth="useAuths('order', ['card'])" @buyData="cardChange"
              @cardChange="cardChange" @cardDelete="cardDelete" @mouseenter="dragHandler(false)"
              @mouseleave="dragHandler(true)" />
          </template>
        </VueDraggable>
        <div v-if="!teamStore.cardDragging" data-dragscroll class="q-space" style="order: 9999; opacity: 0"
          :class="setDragscroll && 'cursor-grab'" @mouseenter="uiStore.dragKanbanScrollEnable = true"
          @mousedown="setDragscroll = true" @mouseup="setDragscroll = false"
          @dblclick.stop="CreateCardFn(columnRef.id)">
          <q-popup-proxy v-if="teamStore?.kanban?.type === 'kanban'" context-menu class="radius-sm shadow-12">
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item clickable v-ripple class="radius-xs">
                <q-item-section>{{ $t('create_card') }}</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu anchor="top end" self="top start" class="radius-sm">
                  <q-list bordered dense class="q-pa-xs radius-sm">
                    <q-item v-for="i in cardTypes" :key="i.val" dense clickable class="radius-xs" v-close-popup
                      @click="CreateCardFn(columnRef.id, i.val)">
                      <q-item-section side><q-icon :name="i.icon" :color="DefaultCreateCardType === i.val ? 'orange' : ''
                        " /></q-item-section>
                      <q-item-section class="q-pr-md">{{
                        $t(i.label)
                        }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-item class="radius-xs" clickable>
                <q-item-section>{{ $t('display_settings') }}：</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu auto-close anchor="top end" self="top start">
                  <q-list dense bordered class="radius-sm q-pa-xs text-no-wrap">
                    <q-item v-for="i in uiOptions" :key="i.val" dense clickable class="radius-xs"
                      @click="update_uiOptions(i)">
                      <q-item-section v-if="i.enable" side><q-icon :name="i.icon" color="green"
                          size="xs" /></q-item-section>
                      <q-item-section><span class="q-pr-md">{{
                        i.label
                          }}</span></q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
            </q-list>
          </q-popup-proxy>
          <!-- 此div充满分栏剩余空间，作为拖拽横向滚动的抓手使用 -->
        </div>
      </q-scroll-area>
      <VueDraggable v-else v-model="filteredCards" :animation="300" :delay="50" :fallbackTolerance="5"
        :forceFallback="true" :fallbackOnBody="true" handle=".dragBar" filter=".undrag" group="tasks"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="q-py-xs radius-sm column gap-sm no-wrap forbid"
        :class="`${teamStore.cardDragging ? 'q-space' : ''} ${$q.screen.gt.xs ? '' : 'full-width'}`" @sort="onSort"
        @start="dragStart('tasks')" @end="dragEnd" ref="draggableRef">
        <template v-for="element in filteredCards" :key="element.id">
          <CardItem :card="element" :isCreator_column="isCreator" :viewType="'card'" :uiOptions="uiOptions"
            @cardChange="cardChange" @cardDelete="cardDelete" @mouseenter="dragHandler(false)"
            @mouseleave="dragHandler(true)" />
        </template>
      </VueDraggable>
    </template>
    <template v-if="columnRef && view_modelRef === 'list'">
      <div
        class="full-width row no-wrap items-center q-px-xs q-pt-xs gap-xs radius-xs transparent font-medium hovered-item">
        <StatusMenu :status="columnRef.status" :modify="useAuths('status', ['column'])" :dense="true"
          @statusChange="statusChange" />
        <span class="q-space" :class="useAuths('order', ['column'])
          ? 'dragBar listDragBar'
          : ''
          ">{{ columnRef.name }}</span>
        <q-space />
        <q-btn v-if="useAuths('create', ['card'])" dense flat round size="sm" icon="add" class="hover-show transition">
          <q-menu>
            <q-list bordered dense class="q-pa-xs radius-sm">
              <q-item v-for="i in cardTypes" :key="i.val" dense clickable class="radius-xs" v-close-popup
                @click="CreateCardFn(columnRef.id, i.val)">
                <q-item-section side>
                  <q-icon :name="i.icon" :color="DefaultCreateCardType === i.val ? 'orange' : ''" />
                </q-item-section>
                <q-item-section class="q-pr-md text-no-wrap">
                  {{ $t(i.label) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <span v-if="columnRef.unread_count > 0" class="bg-primary radius-full" style="width: 5px; height: 5px" />
        <q-btn v-if="useAuths('name', ['column']) || useAuths('delete', ['column']) || isCreator" dense size="sm" flat
          round icon="more_vert">
          <q-menu class="border shadow-24">
            <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
              <template v-if="useAuths('name', ['column'])">
                <q-item class="no-padding">
                  <q-item-section>
                    <q-input v-model="params.data.name" type="text" :placeholder="$t('column_name')" dense square filled
                      autofocus @keyup.enter="updateColumnFn()" @keyup.ctrl.enter="updateColumnFn()"
                      @blur="updateCannel" @keyup.esc="updateCannel">
                      <template v-slot:append>
                        <q-btn dense flat size="sm" round icon="check" v-close-popup @click="updateColumnFn()" />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item>
              </template>
              <template v-if="useAuths('delete', ['column'])">
                <q-separator spaced />
                <q-item @click="deleteColumnFn()" clickable v-close-popup class="radius-xs">
                  <q-item-section>{{ $t('delete_column') }}</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <VueDraggable v-model="filteredCards" target=".taskItems" :animation="300" :forceFallback="true"
        :fallbackOnBody="true" handle=".dragBar" filter=".undrag" group="tasks" chosenClass="chosenGroupClass"
        ghostClass="ghostColumn" fallbackClass="chosenGroupClass" class="full-width forbid"
        :class="teamStore.cardDragging ? 'q-space' : ''" @sort="onSort" @start="dragStart('tasks')" @end="dragEnd">
        <q-markup-table dense flat bordered class="full-width q-space table-view">
          <thead>
            <tr>
              <th v-if="!teamStore.shareInfo" class="text-left op-5"></th>
              <th class="text-left status op-5">{{ $t('status') }}</th>
              <th class="text-left thumbnial op-5">{{ $t('thumbnial') }}</th>
              <th class="text-left name op-5">{{ $t('title') }}</th>
              <th class="text-left content op-5">{{ $t('content') }}</th>
              <th class="text-left todos op-5">{{ $t('todo') }}</th>
              <th class="text-left score op-5">{{ $t('score') }}</th>
              <th class="text-left progress op-5">{{ $t('progress') }}</th>
              <th v-if="!teamStore.shareInfo" class="text-left follow op-5">{{ $t('follower') }}</th>
              <th v-if="!teamStore.shareInfo" class="text-left more op-5">{{ $t('more_actions') }}</th>
            </tr>
          </thead>
          <tbody class="taskItems">
            <template v-if="createCard_in === columnRef.id && useAuths('create', ['card'])">
              <CreateCard :column_id="columnRef.id" :DefaultCreateCardType="DefaultCreateCardType"
                :view_model=view_modelRef @createCannel="createCannel" @created="created" @closeCreate="closeCreate" />
            </template>
            <template v-if="filteredCards?.length > 0">
              <RowCardItem v-for="(element, index) in filteredCards" :key="element.id" :card="element" :index="index"
                :isCreator_column="isCreator" :viewType="'list'" :uiOptions="uiOptions" @cardChange="cardChange"
                @cardDelete="cardDelete" />
            </template>
          </tbody>
        </q-markup-table>
      </VueDraggable>
    </template>
  </div>
</template>

<script setup>
  import {
    ref,
    toRef,
    watch,
    watchEffect,
    computed,
    onBeforeMount,
    nextTick
  } from "vue";
  import { VueDraggable } from 'vue-draggable-plus'
  import CardItem from "src/pages/team/card/CardItem.vue";
  import RowCardItem from "src/pages/team/card/RowCardItem.vue";
  import CreateCard from "src/pages/team/card/components/CreateCard.vue";
  import StatusMenu from "src/pages/team/components/user/StatusMenu.vue";
  import { filterCardsByString } from "src/hooks/utilits.js";

  import { useQuasar } from "quasar";
  import {
    updateColumn,
    deleteColumn,
    createCard
  } from "src/api/strapi/project.js";
  import localforage from "localforage";

  import { board_type } from "src/pages/team/kanban/BoradsList.js";

  import {
    teamStore,
    uiStore,
  } from "src/hooks/global/useStore.js";
  import { i18n } from 'src/boot/i18n.js';

  import { useBoolean, useDrop } from 'vue-hooks-plus'

  const dropRef = ref(null)
  const insertIndex = ref(-1)
  const cloneElement = ref(null)
  const dropPosition = ref({ start: true })

  // 更新插入指示器位置
  const updateInsertIndicator = (event) => {
    const dropZone = dropRef.value?.$el
    if (!dropZone) return

    const dropZoneRect = dropZone.getBoundingClientRect()
    const mouseY = event.clientY - dropZoneRect.top

    // 获取所有卡片元素
    const cardElements = dropZone.querySelectorAll('.kanban-card')
    let newInsertIndex = 0

    // 更新 position
    if (cardElements.length === 0) {
      dropPosition.value = { start: true }
    } else {
      for (let i = 0; i < cardElements.length; i++) {
        const cardRect = cardElements[i].getBoundingClientRect()
        const cardMiddle = (cardRect.top + cardRect.bottom) / 2 - dropZoneRect.top

        if (mouseY < cardMiddle) {
          newInsertIndex = i
          // 如果是第一个位置
          if (i === 0) {
            dropPosition.value = { start: true }
          } else {
            // 获取前一个卡片的 ID
            const previousCard = cardElements[i - 1]
            const cardId = previousCard.getAttribute('data-card-id')
            dropPosition.value = { after: parseInt(cardId) }
          }
          break
        }
        newInsertIndex = i + 1
        // 如果是最后一个位置
        if (i === cardElements.length - 1) {
          dropPosition.value = { after: parseInt(cardElements[i].getAttribute('data-card-id')) }
        }
      }
    }

    // 如果位置发生变化，更新指示器
    if (newInsertIndex !== insertIndex.value) {
      insertIndex.value = newInsertIndex

      // 移除旧的指示器
      if (cloneElement.value) {
        cloneElement.value.remove()
      }

      // 创建新的指示器
      const clone = document.createElement('div')
      clone.className = 'full-width ghostColumn'
      clone.style.height = '50px'
      clone.style.pointerEvents = 'none'

      // 插入新的指示器
      if (insertIndex.value < cardElements.length) {
        dropZone.insertBefore(clone, cardElements[insertIndex.value])
      } else {
        dropZone.appendChild(clone)
      }

      cloneElement.value = clone
    }
  }

  // 使用 useDrop
  useDrop(dropRef, {
    onDom: async (content, event) => {
      // 使用计算好的 position
      console.log('Drop position:', content)
      if (cloneElement.value) {
        // 为指示器添加样式： ‘flex flex-center’
        cloneElement.value.classList.add('flex')
        cloneElement.value.classList.add('flex-center')
        // 在此处依然保留指示器，并且在指示器内部添加文字： ‘正在创建，请稍候...’
        cloneElement.value.innerHTML = '正在创建，请稍候...'
      }

      const _jsonContent = {
        "type": "doc",
        "content": [{
          "type": "paragraph",
          "content": [{
            "text": content.message,
            "type": "text"
          }]
        }]
      }
      const params = {
        column_id: columnRef.value?.id,
        position: dropPosition.value,
        data: {
          status: "pending",
          type: 'note',
          jsonContent: _jsonContent
        },
      };
      const res = await createCard(params);
      if(res.data){
        if(dropPosition.value.start){
          filteredCards.value.unshift(res.data)
        }else{
          filteredCards.value.splice(insertIndex.value, 0, res.data)
        }
        // 移除指示器
        if (cloneElement.value) {
          cloneElement.value.remove()
          cloneElement.value = null
        }
      }

      // 重置 position
      dropPosition.value = { start: true }
      insertIndex.value = -1
    },
    onDragOver: (event) => {
      event.preventDefault()
      // 只有在没有进行内部拖拽时才显示指示器
      if (!teamStore.cardDragging) {
        updateInsertIndicator(event)
      }
    },
    onDragLeave: () => {
      // 移除指示器
      if (cloneElement.value) {
        cloneElement.value.remove()
        cloneElement.value = null
      }
      insertIndex.value = -1
      dropPosition.value = { start: true }
    },
    onDragEnd: () => {
      // 移除指示器
      if (cloneElement.value) {
        cloneElement.value.remove()
        cloneElement.value = null
      }
      insertIndex.value = -1
      dropPosition.value = { start: true }
    }
  })

  const $t = i18n.global.t;

  const $q = useQuasar();
  const props = defineProps({
    column: {
      type: Object,
      default() {
        return {};
      },
    },
    __dragging_column: {
      type: Boolean,
      default: false,
    },
    kanban_id: {
      type: Number,
      default: NaN,
    },
    view_model: {
      type: String,
      default: "kanban",
    },
    isCreator_kanban: {
      type: Boolean,
      default: false,
    },
  });
  const columnRef = toRef(props, "column");
  const isCreator = computed(
    () =>
      columnRef.value.creator?.id === teamStore?.init?.id || props.isCreator_kanban
  );
  const kanban_idRef = toRef(props, "kanban_id");
  const view_modelRef = toRef(props, "view_model");
  const isKanban = computed(() => board_type.value === "kanban");

  let filter_txt = ref();
  let filteredCards = ref();
  let cards = ref();
  let column_name = ref();
  let column_unread_count = ref();
  let column_status = ref();
  let column_type = ref();
  let column_executor = ref();
  watchEffect(() => {
    filter_txt.value = teamStore.filter_txt;
  });
  watch(columnRef, () => {
    if (columnRef.value) {
      cards.value = columnRef.value?.cards.filter(i => !i.pulled || i.creator?.id === teamStore.init?.id);
      filteredCards.value = cards.value;
      column_name.value = columnRef.value?.name;
      column_unread_count.value = columnRef.value?.unread_count;
      column_status.value = columnRef.value?.status;
      column_type.value = columnRef.value?.type;
      column_executor.value = columnRef.value?.executor;
    }
  }, { immediate: true, deep: true });

  const deleteColumnFn = () => {
    const deleteFn = async () => {
      let res;
      if (teamStore.card?.id) {
        await deleteColumn(
          teamStore.project.id,
          columnRef.value.id,
          teamStore.card?.id
        );
      } else {
        await deleteColumn(teamStore.project.id, columnRef.value.id);
      }
    };
    if (columnRef.value.cards.length > 0) {
      $q.dialog({
        title: $t('attention'),
        message: $t('delete_column_include_cards_tip'),
        cancel: $t('cancel'),
        ok: $t('confirm'),
        class: "shadow-24",
      }).onOk(() => {
        deleteFn();
      });
    } else {
      deleteFn();
    }
  };
  const params = ref({
    project_id: teamStore.project?.id,
    kanban_id: kanban_idRef.value,
    data: {
      name: column_name.value,
    },
  });
  const column_menu = ref();
  const updateColumnFn = async () => {
    let res = await updateColumn(columnRef.value.id, params.value);
    if (res) {
      column_menu.value?.hide();
      delete params.value.data.status;
      params.value.data.name = "";
    }
  };
  const statusChange = (val) => {
    delete params.value.data.name;
    params.value.data.status = val;
    updateColumnFn();
  };
  const updateCannel = () => {
    params.value.data.name = "";
  };

  const emit = defineEmits(["cardChange", "cardDelete", "orderCard"]);
  const sortRes = ref();
  const dragCard_sort = async () => {
    // console.log("dragCard_sort", filteredCards.value);
    await nextTick();
    let params = {
      project_id: teamStore.project.id,
      kanban_id: kanban_idRef.value,
      data: {
        cards: filteredCards.value.map((i) => i.id),
      },
    };

    const { data } = await updateColumn(columnRef.value.id, params);
    if (data) {
      // sortRes.value = data
      await nextTick();
      columnRef.value = data
    }
  };
  const onSort = async () => {
    await dragCard_sort()
  }
  //卡片部分
  const createCard_in = ref(null);
  const DefaultCreateCardType = ref();
  let DefaultCreateCardType_key = `___DefaultCreateCardType_key__${columnRef.value?.id}`;
  const CreateCardFn = (column_id, createCardType) => {
    if (teamStore.$storageCapacityExceeded) {
      uiStore.dialogNotify = 'cardNumberExceeded'
      return
    }
    if (!uiStore.dragging) {
      createCard_in.value = createCard_in.value ? null : column_id;
      if (createCardType) {
        DefaultCreateCardType.value = createCardType;
      }
    }
  };
  const closeCreate = () => {
    createCard_in.value = null;
    showCreater.value = false;
  };
  const showCreater = ref(false);
  const created = (val) => {
    pushCard(val);
  }
  const createCannel = () => {
    createCard_in.value = null;
    showCreater.value = false;
  };
  const cardChange = (val) => {
    emit("cardChange", val);
  };
  const cardDelete = (card_id) => {
    emit("cardDelete", card_id);
  };
  const dragStart = (_gName) => {
    teamStore.cardDragging = true;
    uiStore.dragging = true;
    uiStore.topPannel = true;
    uiStore.dropGroup = _gName;
  };
  const dragEnd = () => {
    uiStore.topPannel = false;
    // console.log('dragEnd');
    setTimeout(() => {
      teamStore.cardDragging = false;
      uiStore.dragging = false;
    }, 500);
  };
  const setDragscroll = ref(false);

  const getDefaultCreateCardType = async () => {
    try {
      // 使用await等待localforage.getItem的结果
      const res = await localforage.getItem(DefaultCreateCardType_key);
      // 如果获取到值，就设置为该值，否则设置为’note’
      DefaultCreateCardType.value = res || "note";
    } catch (e) {
      console.log(e);
    }
  };
  getDefaultCreateCardType();
  const cardTypes = ref([
    { val: "task", label: "task", icon: "task_alt" },
    { val: "note", label: "note", icon: "event_note" },
    { val: "todo", label: "todo", icon: "checklist" },
  ]);
  const setDefaultCreateCardType = async (val) => {
    try {
      const res = await localforage.setItem(DefaultCreateCardType_key, val);
      DefaultCreateCardType.value = res || "note";
    } catch (e) {
      console.log(e);
    }
  };

  watch(filter_txt, () => {
    if (cards.value) {
      if (filter_txt.value) {
        filteredCards.value = filterCardsByString(filter_txt.value, cards.value);
      } else {
        filteredCards.value = cards.value;
      }
    }
  }, { immediate: true, deep: false });

  // 有竖向滚动条，当鼠标进入分栏后，禁用滚轮横向滚动
  const hasScrollBar = ref();
  const columnScrollRef = ref(null);
  const setMouseWheelScroll = () => {
    if (!columnScrollRef.value) return
    const { verticalSize, verticalContainerSize } = columnScrollRef.value.getScroll();
    hasScrollBar.value = verticalSize > verticalContainerSize;
  }
  const dragHandler = (val) => {
    if (uiStore.dragging || $q.screen.lt.sm) return;
    uiStore.scrollX_byWheel = hasScrollBar.value ? val : true;

    // 鼠标进入卡片范围后，禁用拖拽横向滚动
    uiStore.dragKanbanScrollEnable = val;
  };

  const pushCard = (_card) => {
    if (teamStore.kanban?.type === "kanban" || teamStore.kanban?.type === "classroom") {
      columnRef.value.cards = [_card, ...columnRef.value?.cards];
    } else {
      columnRef.value.cards = [...columnRef.value?.cards, _card];
    }
  }

  const uiOptions = ref([
    {
      val: "hidecompletedTodo",
      label: $t('hide_completed_todo'),
      enable: true,
      icon: "mdi-checkbox-marked-circle",
    },
  ]);
  onBeforeMount(() => {
    sync_uiOptions();
  });
  const update_uiOptions = async (i) => {
    i.enable = !i.enable;
    uiOptions.value = uiOptions.value.map((ui) => (ui.val === i.val && i) || ui);
    let res = JSON.stringify(uiOptions.value);
    await localforage
      .setItem(`___column_${columnRef.value.id}_uiOptions`, res)
      .catch(function (err) {
        console.log(err);
      });
  };
  const sync_uiOptions = async () => {
    let res = await localforage.getItem(
      `___column_${columnRef.value.id}_uiOptions`
    );
    if (res) {
      uiOptions.value = JSON.parse(res);
    }
  };
</script>

<style lang="scss">
  .flex-content .q-scrollarea__content {
    display: flex;
    flex-direction: column;
  }

  .highlight {
    width: 5px;
  }

  .cardBody:hover .highlight {
    width: 1px;
  }

  .table-view .dragBar {
    width: 4rem;
  }

  .table-view .status {
    width: 8rem;
  }

  .table-view .thumbnial {
    width: 14rem;
  }

  .table-view .name {
    width: 16rem;
  }

  .table-view .content {
    width: auto;
    min-width: 18rem;
    text-wrap: wrap;
  }

  .table-view .todos {
    width: 8rem;
  }

  .table-view .score {
    width: 8rem;
  }

  .table-view .progress {
    width: 6rem;
  }

  .table-view .follow {
    width: 12rem;
  }

  .table-view .more {
    width: 4rem;
  }

  .insert-indicator {
    pointer-events: none;
    /* 防止指示器影响拖拽 */
  }
</style>
