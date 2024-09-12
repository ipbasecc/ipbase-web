<template>
  <div
    class="column no-wrap"
    :class="`
      ${!card ? $q.dark.mode ? 'fit bg-dark' : 'fit bg-grey-1' : ''}
    `"
    :style="isFeedback ? 'max-width: 36rem' : ''"
  >
    <template v-if="!card">
      <q-bar
        v-if="
          !isClassroom &&
          layout === 'column' &&
          !hideToolbar &&
          !uiStore.isShared &&
          !isFeedback &&
          $q.screen.gt.sm
        "
        class="border-bottom"
        :class="
          $q.dark.mode ? 'bg-grey-10 text-white' : 'bg-grey-1 text-grey-10'
        "
        style="height: 40px"
      >
        <slot name="bar_left" />
        <q-toolbar-title>
          {{ kanban_id ? $t('todo_attach_txt_private_kanban') + ' ' + $t(asTitle) : $t('todo_attach_txt_person') + ' ' + $t(asTitle) }}
        </q-toolbar-title>
        <q-space />
        <PersonTip :kanban_id :card />
      </q-bar>
      <q-scroll-area
        v-dragscroll="{
          target: '.q-scrollarea__container',
          active: uiStore.dragKanbanScrollEnable && layout === 'row',
        }"
        v-dragscroll.x="$q.screen.gt.xs"
        v-dragscroll.y="false"
        v-dragscroll:nochilddrag
        v-on:dragscrollstart="dragscrollstart"
        v-on:dragscrollmove="draging"
        v-on:dragscrollend="dragscrollend"
        :class="uiStore.draging ? 'cursor-grab' : ''"
        class="q-space column no-wrap gap-sm q-px-sm q-pb-lg"
        ref="scrollAreaRef"
        @wheel="handleScroll"
        @scroll="getScollInfo"
      >
        <q-resize-observer @resize="onResize" />
        <VueDraggable v-if="todogroups && !loading" v-model="todogroups" :disabled="isFeedback"
          :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
          handle=".dragBar" filter=".undrag" :group="kanban_id ? 'kanban_todogroup' : 'todogroup'"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="gap-xs relative-position"
          :class="`
            ${teamStore.cardDragging ? 'q-space' : ''}
            ${layout === 'row' ? 'row no-wrap' : 'column no-wrap'}
          `"
          :style="layout === 'column' ? '' : `height: ${mainAreaHeight}px;`"
          @start="dragStart" @sort="dragTodogroup_sort" @end="dragEnd"
        >
        <template v-for="i in todogroups" :key="i.id">
          <q-scroll-area v-if="layout === 'row'" class="column no-wrap gap-xs q-pa-sm todogroup"
            :style="`max-height: ${mainAreaHeight}px;width: 320px`"
          >
            <div class="q-space column no-wrap gap-xs scroll-y">
              <q-resize-observer @resize="onColumnResize" />
              <div v-if="updateTodogroup_target !== i.id"
                data-no-dragscroll
                class="row no-wrap items-center q-py-sm border-bottom q-mb-sm hovered-item"
                @mouseenter="outsideScroll(i, true)"
                @mouseleave="outsideScroll(i, false)"
              >
                <div
                  v-if="
                    moveTarget === `group_${i.id}` &&
                    !uiStore.isShared &&
                    !isFeedback
                  "
                  class="q-pr-sm"
                  @mouseenter="uiStore.dragKanbanScrollEnable = false"
                  @mouseleave="uiStore.dragKanbanScrollEnable = true"
                >
                  <q-icon name="drag_indicator" class="dragBar" />
                </div>
                <span @dblclick="toggle_updateTodogroup(i)" class="q-space">
                  {{ i.name }}
                  <slot name="header"></slot>
                  <q-tooltip v-if="!uiStore.isShared && !isFeedback">
                    <span>{{ $t('double_click_change_name') }}</span>
                  </q-tooltip>
                </span>
                <div class="row no-wrap gap-xs hover-show transition">
                  <q-btn
                    v-if="false"
                    flat
                    dense
                    size="sm"
                    round
                    icon="add"
                    @click="fetchFeedback()"
                  >
                    <q-tooltip
                      class="border"
                      :class="
                        $q.dark.mode
                          ? 'bg-grey-10 text-grey-1'
                          : 'bg-grey-1 text-grey-10'
                      "
                    >
                    {{ $t('refresh') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="
                      layout === 'column' && !uiStore.isShared && !isFeedback
                    "
                    flat
                    dense
                    size="sm"
                    round
                    icon="add"
                    @click="createGroupHandler()"
                  >
                    <q-tooltip
                      class="border"
                      :class="
                        $q.dark.mode
                          ? 'bg-grey-10 text-grey-1'
                          : 'bg-grey-1 text-grey-10'
                      "
                    >
                      {{$t('add_todogroup')}}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat dense size="sm" round icon="more_vert">
                    <q-menu
                      class="radius-sm shadow-12"
                      ref="todogroupMenuRef"
                      @hide="rf_deleteTodogroup = false"
                    >
                      <q-list
                        dense
                        bordered
                        class="radius-sm q-pa-xs text-no-wrap column no-wrap gap-xs"
                      >
                        <q-item
                          v-if="!uiStore.isShared && !isFeedback"
                          class="radius-xs no-padding overflow-hidden"
                        >
                          <q-input
                            v-model="params.data.name"
                            dense
                            filled
                            type="text"
                            :placeholder="$t('group_name')"
                            class="col"
                            @keyup.esc="cancelUpdateGroupHandler()"
                            @keyup.ctrl.enter="updateTodogroupFn(i)"
                            @keyup.enter="updateTodogroupFn(i)"
                          >
                            <template v-slot:append>
                              <q-btn
                                flat
                                round
                                dense
                                size="sm"
                                icon="check"
                                :class="
                                  params.data.name ? '' : 'op-0 transition'
                                "
                                v-close-popup
                                @click="updateTodogroupFn(i)"
                              />
                            </template>
                          </q-input>
                        </q-item>
                        <q-separator
                          v-if="!uiStore.isShared && !isFeedback"
                          spaced
                          class="op-5"
                        />
                        <q-item
                          clickable
                          v-close-popup
                          class="radius-xs"
                          @click="toggleHideCompleted(i)"
                        >
                          <q-item-section side>
                            <q-icon
                              name="mdi-checkbox-marked-circle"
                              :color="i.hideCompleted ? 'green' : ''"
                              size="xs"
                            />
                          </q-item-section>
                          <q-item-section class="q-pr-md"
                            >隐藏已完成</q-item-section
                          >
                        </q-item>
                        <q-separator
                          v-if="!uiStore.isShared && !isFeedback"
                          spaced
                          class="op-5"
                        />
                        <q-item
                          v-if="!uiStore.isShared && !isFeedback"
                          clickable
                          :v-close-popup="rf_deleteTodogroup"
                          class="radius-xs"
                          :class="rf_deleteTodogroup ? 'bg-negative' : ''"
                          @click="rf_deleteTodogroupFn(i)"
                        >
                          <q-item-section side
                            ><q-icon name="close" size="xs"
                          /></q-item-section>
                          <q-item-section class="q-pr-md">
                            {{
                              i.todos?.length > 0 && rf_deleteTodogroup
                                ? $t('rf_delete_todogroup')
                                : $t('delete_todogroup')
                            }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
              <div
                v-if="updateTodogroup_target === i.id && !isFeedback"
                @mouseenter="setScroll(false)"
                @mouseleave="setScroll(true)"
                class="q-pa-xs undrag"
              >
                <q-input
                  v-model="params.data.name"
                  dense
                  square
                  autofocus
                  type="text"
                  :placeholder="$t('todogroup_name')"
                  @keyup.esc="updateTodogroup_target = null"
                  @keyup.enter="updateTodogroupFn(i)"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="check"
                      @click="updateTodogroupFn(i)"
                    />
                  </template>
                </q-input>
              </div>
              <VueDraggable v-model="i.todos"
                :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
                :disabled="isFeedback" handle=".dragItem" filter="textarea" group="todo"
                chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
                class="column"
                :class="`${teamStore.cardDragging ? 'q-space' : ''}${$q.screen.gt.sm ? 'gap-xs' : 'gap-sm'}`"
                :style="todoDragging ? 'min-height: 50px;' : ''"
                @sort="dragTodo_sort(i)"
                @start="
                  todoDragging = true;
                  uiStore.dragging = true;
                "
                @end="
                  todoDragging = false;
                  uiStore.dragging = false;
                "
                @mouseenter="setScroll(false)"
                @mouseleave="setScroll(true)"
              >
                <template v-for="element in i.todos" :key="element.id">
                  <TodoItem
                    v-if="
                      (i.hideCompleted && !element.status) || !i.hideCompleted
                    "
                    :todogroup="i"
                    :uiOptions
                    :element="element"
                    :authBase
                    :inCard="false"
                    :isFeedback
                    :byInfo
                    :displayType
                    @todoDeleted="todoDeleted"
                    @editing="editting_todosGroup = i.id"
                    @unediting="uneditting()"
                  />
                </template>
              </VueDraggable>
              <template
                v-if="(isFeedback && uiStore.isShared) || !isFeedback"
              >
                <div v-if="todo_add_ing === i.id"
                  class="column no-wrap q-pa-xs radius-xs border"
                >
                  <q-input
                    v-model="todo_params.data.content"
                    dense
                    square
                    filled
                    autofocus
                    autogrow
                    type="text"
                    :placeholder="$t('todo_content')"
                    @keydown.esc="cancelCreateTodo()"
                    @keyup.ctrl.enter="keepCreate(i, null)"
                  >
                    <template v-slot:append>
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="add"
                        @click="createTodoFn(i, '')"
                      />
                    </template>
                  </q-input>
                  <div class="row no-wrap items-center q-pt-xs">
                    <q-btn
                      flat
                      dense
                      :label="$t('cancel')"
                      padding="xs sm"
                      @click="cancelCreateTodo"
                    />
                    <q-space />
                    <q-btn
                      :disable="!todo_params.data.content"
                      dense
                      color="primary"
                      :label="$t('confirm')"
                      padding="xs sm"
                      @click="createTodoFn(i, null)"
                    />
                  </div>
                </div>
                <div v-else class="row no-wrap items-center q-py-xs">
                  <q-btn
                    dense
                    size="sm"
                    flat
                    class="border full-width"
                    :disable="editting_todosGroup === i.id"
                    @click.stop="todo_add_ing = i.id"
                  >
                    <q-icon name="add" size="xs" class="op-5" />
                  </q-btn>
                </div>
              </template>
            </div>
          </q-scroll-area>
          <div v-else class="column no-wrap gap-xs q-pa-sm todogroup">
            <div
              v-if="updateTodogroup_target !== i.id"
              data-no-dragscroll
              class="row no-wrap items-center q-py-sm q-mb-sm hovered-item"
              @mouseenter="outsideScroll(i, true)"
              @mouseleave="outsideScroll(i, false)"
            >
              <div
                v-if="
                  moveTarget === `group_${i.id}` &&
                  !uiStore.isShared &&
                  !isFeedback
                "
                class="q-pr-sm"
              >
                <q-icon name="drag_indicator" class="dragBar" />
              </div>
              <span @dblclick="toggle_updateTodogroup(i)" class="q-space">
                {{ i.name }}
                <slot name="header"></slot>
                <q-tooltip v-if="!uiStore.isShared && !isFeedback">
                  <span>{{ $t('double_click_change_name') }}</span>
                </q-tooltip>
              </span>
              <div class="row no-wrap gap-xs hover-show transition">
                <q-btn
                  v-if="false"
                  flat
                  dense
                  size="sm"
                  round
                  icon="add"
                  @click="fetchFeedback()"
                >
                  <q-tooltip
                    class="border"
                    :class="
                      $q.dark.mode
                        ? 'bg-grey-10 text-grey-1'
                        : 'bg-grey-1 text-grey-10'
                    "
                  >
                  {{ $t('refresh') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    layout === 'column' && !uiStore.isShared && !isFeedback
                  "
                  flat
                  dense
                  size="sm"
                  round
                  icon="add"
                  @click="createGroupHandler()"
                >
                  <q-tooltip
                    class="border"
                    :class="
                      $q.dark.mode
                        ? 'bg-grey-10 text-grey-1'
                        : 'bg-grey-1 text-grey-10'
                    "
                  >
                    {{$t('add_todogroup')}}
                  </q-tooltip>
                </q-btn>
                <q-btn flat dense size="sm" round icon="more_vert">
                  <q-menu
                    class="radius-sm shadow-12"
                    ref="todogroupMenuRef"
                    @hide="rf_deleteTodogroup = false"
                  >
                    <q-list
                      dense
                      bordered
                      class="radius-sm q-pa-xs text-no-wrap column no-wrap gap-xs"
                    >
                      <q-item
                        v-if="!uiStore.isShared && !isFeedback"
                        class="radius-xs no-padding overflow-hidden"
                      >
                        <q-input
                          v-model="params.data.name"
                          dense
                          filled
                          type="text"
                          :placeholder="$t('group_name')"
                          class="col"
                          @keyup.esc="cancelUpdateGroupHandler()"
                          @keyup.ctrl.enter="updateTodogroupFn(i)"
                          @keyup.enter="updateTodogroupFn(i)"
                        >
                          <template v-slot:append>
                            <q-btn
                              flat
                              round
                              dense
                              size="sm"
                              icon="check"
                              :class="
                                params.data.name ? '' : 'op-0 transition'
                              "
                              v-close-popup
                              @click="updateTodogroupFn(i)"
                            />
                          </template>
                        </q-input>
                      </q-item>
                      <q-separator
                        v-if="!uiStore.isShared && !isFeedback"
                        spaced
                        class="op-5"
                      />
                      <q-item
                        clickable
                        v-close-popup
                        class="radius-xs"
                        @click="toggleHideCompleted(i)"
                      >
                        <q-item-section side>
                          <q-icon
                            name="mdi-checkbox-marked-circle"
                            :color="i.hideCompleted ? 'green' : ''"
                            size="xs"
                          />
                        </q-item-section>
                        <q-item-section class="q-pr-md"
                          >隐藏已完成</q-item-section
                        >
                      </q-item>
                      <q-separator
                        v-if="!uiStore.isShared && !isFeedback"
                        spaced
                        class="op-5"
                      />
                      <q-item
                        v-if="!uiStore.isShared && !isFeedback"
                        clickable
                        :v-close-popup="rf_deleteTodogroup"
                        class="radius-xs"
                        :class="rf_deleteTodogroup ? 'bg-negative' : ''"
                        @click="rf_deleteTodogroupFn(i)"
                      >
                        <q-item-section side
                          ><q-icon name="close" size="xs"
                        /></q-item-section>
                        <q-item-section class="q-pr-md">
                          {{
                            i.todos?.length > 0 && rf_deleteTodogroup
                              ? $t('rf_delete_todogroup')
                              : $t('delete_todogroup')
                          }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
            <div
              v-if="updateTodogroup_target === i.id && !isFeedback"
              @mouseenter="setScroll(false)"
              @mouseleave="setScroll(true)"
              class="q-pa-xs undrag"
            >
              <q-input
                v-model="params.data.name"
                dense
                square
                autofocus
                type="text"
                :placeholder="$t('todogroup_name')"
                @keyup.esc="updateTodogroup_target = null"
                @keyup.enter="updateTodogroupFn(i)"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="check"
                    @click="updateTodogroupFn(i)"
                  />
                </template>
              </q-input>
            </div>
            <VueDraggable v-model="i.todos"
              :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
              :disabled="isFeedback" handle=".dragItem" filter="textarea" group="todo"
              chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
              :class="`column ${teamStore.cardDragging ? 'q-space' : ''} ${$q.screen.gt.sm ? 'gap-xs' : 'gap-sm'}`"
              :style="todoDragging ? 'min-height: 50px;' : ''"
              @sort="dragTodo_sort(i)"
              @start="
                todoDragging = true;
                uiStore.dragging = true;
              "
              @end="
                todoDragging = false;
                uiStore.dragging = false;
              "
              @mouseenter="setScroll(false)"
              @mouseleave="setScroll(true)"
            >
              <template v-for="element in i.todos" :key="element.id">
                <TodoItem
                  v-if="
                    (i.hideCompleted && !element.status) || !i.hideCompleted
                  "
                  :todogroup="i"
                  :uiOptions
                  :element="element"
                  :authBase
                  :inCard="false"
                  :isFeedback
                  :byInfo
                  :displayType
                  @todoDeleted="todoDeleted"
                  @editing="editting_todosGroup = i.id"
                  @unediting="uneditting()"
                />
              </template>
            </VueDraggable>
            <template
              v-if="(isFeedback && uiStore.isShared) || !isFeedback"
            >
              <div v-if="todo_add_ing === i.id"
                class="column no-wrap q-pa-xs radius-xs border"
              >
                <q-input
                  v-model="todo_params.data.content"
                  dense
                  square
                  filled
                  autofocus
                  autogrow
                  type="text"
                  :placeholder="$t('todo_content')"
                  @keydown.esc="cancelCreateTodo()"
                  @keyup.ctrl.enter="keepCreate(i)"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="add"
                      @click="createTodoFn(i, '')"
                    />
                  </template>
                </q-input>
                <div class="row no-wrap items-center q-pt-xs">
                  <q-btn
                    flat
                    dense
                    :label="$t('cancel')"
                    padding="xs sm"
                    @click="cancelCreateTodo"
                  />
                  <q-space />
                  <q-btn
                    :disable="!todo_params.data.content"
                    dense
                    color="primary"
                    :label="$t('confirm')"
                    padding="xs sm"
                    @click="createTodoFn(i, '')"
                  />
                </div>
              </div>
              <div v-else class="row no-wrap items-center q-py-xs">
                <q-btn
                  dense
                  size="sm"
                  flat
                  class="border full-width"
                  :disable="editting_todosGroup === i.id"
                  @click.stop="todo_add_ing = i.id"
                >
                  <q-icon name="add" size="xs" class="op-5" />
                </q-btn>
              </div>
            </template>
          </div>
        </template>
          <template v-if="layout === 'row' && !uiStore.isShared && !isFeedback">
            <div
              class="column no-wrap gap-xs q-pa-sm undrag"
              :style="layout === 'row' ? 'width: 320px' : ''"
            >
              <q-btn
                v-if="todogroups?.length > 0 && !createTodogroup_ing"
                dense
                flat
                icon="add"
                :label="$t('add_todogroup')"
                align="left"
                class="full-width"
                @mouseenter="uiStore.dragKanbanScrollEnable = false"
                @mouseleave="uiStore.dragKanbanScrollEnable = true"
              >
                <q-popup-proxy
                  cover
                  ref="createGroupPopupRef"
                  @show="uiStore.dragKanbanScrollEnable = false"
                >
                  <q-card bordered class="q-pa-xs">
                    <q-input
                      v-model="params.data.name"
                      type="text"
                      dense
                      square
                      filled
                      :placeholder="$t('todogroup_name')"
                      @keyup.esc="createTodogroup_ing = false"
                      @keyup.ctrl.enter="createTodogroupFn()"
                      @keyup.enter="createTodogroupFn()"
                    >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          dense
                          size="sm"
                          icon="check"
                          @click="createTodogroupFn()"
                        />
                      </template>
                    </q-input>
                  </q-card>
                </q-popup-proxy>
              </q-btn>
              <q-card
                v-if="todogroups?.length === 0 && createTodogroup_ing"
                bordered
                class="q-pa-xs"
              >
                <q-input
                  v-model="params.data.name"
                  type="text"
                  dense
                  square
                  filled
                  :placeholder="$t('todogroup_name')"
                  @keyup.esc="createTodogroup_ing = false"
                  @keyup.ctrl.enter="createTodogroupFn()"
                  @keyup.enter="createTodogroupFn()"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="check"
                      @click="createTodogroupFn()"
                    />
                  </template>
                </q-input>
              </q-card>
              <div class="q-space" @mouseenter="setScroll(true)"></div>
            </div>
          </template>
        </VueDraggable>
        <div
          v-if="
            createTodogroup_ing &&
            layout === 'column' &&
            !uiStore.isShared &&
            !isFeedback
          "
          class="q-px-sm"
        >
          <div class="full-width q-pa-xs">
            <q-input
              v-model="params.data.name"
              square
              autofocus
              type="text"
              :placeholder="$t('todogroup_name')"
              @keyup.esc="createTodogroup_ing = false"
              @keyup.ctrl.enter="createTodogroupFn()"
              @keyup.enter="createTodogroupFn()"
            >
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="check"
                  @click="createTodogroupFn()"
                />
              </template>
            </q-input>
          </div>
        </div>
        <div v-if="todogroups?.length === 0 &&
            !createTodogroup_ing &&
            !uiStore.isShared &&
            !isFeedback
          "
          class="absolute-full column flex-center"
        >
          <div class="q-space column flex-center">
            <div class="column no-wrap">
              <ProjectTip :_for :kanban_id />
              <q-btn
                flat
                icon="add"
                :label="`${$t('create')}${$t(asTitle)}${$t('group')}`"
                class="border q-mt-md"
                @click="createGroupHandler"
              />
            </div>
          </div>
          <q-space />
        </div>
      </q-scroll-area>
    </template>
    <template
      v-if="
        card &&
        (useAuths('read', ['card_todogroups', 'todogroups']) ||
          isCreator ||
          isPrivate)
      "
    >
      <VueDraggable v-model="todogroups"
        :disabled="
          !useAuths('order', ['card_todogroups', 'todogroups'])
        "
        :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" filter=".undrag" group="todogroup"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="column no-wrap"
        :style="uiStore.dragging ? 'min-height: 6rem;' : ''"
        @start="dragStart('todogroup')" @sort="dragTodogroup_sort" @end="dragEnd"
      >
        <template v-for="i in todogroups" :key="i.id">
          <div class="column no-wrap gap-xs q-py-xs radius-xs">
            <div class="row no-wrap items-center q-px-sm hovered-item"
                 @mouseenter="moveTarget = `group_${i.id}`"
                 @mouseleave="moveTarget = null"
            >
              <div class="row no-wrap q-space font-bold-600">
                <span class="undrag">{{ i.name }}</span>
                <div class="q-space dragBar" />
                <q-popup-proxy v-if=" useAuths('name', [authBase.collection]) &&
                    !uiStore.edittingTodo"
                  cover
                  @show="toggle_updateTodogroup(i)"
                >
                  <q-card bordered class="q-pa-xs">
                    <q-input
                      v-model="params.data.name"
                      dense
                      square
                      autofocus
                      filled
                      type="text"
                      :placeholder="$t('todogroup_name')"
                      class="undrag"
                      @keyup.esc="updateTodogroup_target = null"
                      @keyup.ctrl.enter="updateTodogroupFn(i)"
                      @keyup.enter="updateTodogroupFn(i)"
                    >
                      <template v-slot:append>
                        <q-btn
                          v-if="params?.data?.name !== i.name"
                          flat
                          round
                          dense
                          size="sm"
                          icon="check"
                          @click="updateTodogroupFn(i)"
                        />
                      </template>
                    </q-input>
                  </q-card>
                </q-popup-proxy>
              </div>
              <div class="row no-wrap gap-xs hover-show transition">

                <q-btn-group flat class="border">
                  <q-btn flat
                         size="sm"
                         padding="xs"
                         icon="mdi-plus"
                         @click="createAddTodo(`group_${i.id}`)"
                  />
                  <q-btn
                      v-if="useAuths('delete', [authBase.collection]) || useAuths('create', [authBase.collection])"
                      flat
                      dense
                      size="sm"
                      round
                      icon="more_vert"
                  >
                    <q-menu class="radius-sm shadow-12">
                      <q-list
                          dense
                          bordered
                          class="radius-sm q-pa-xs text-no-wrap"
                      >
                        <template
                            v-if="useAuths('create', [authBase.collection])"
                        >
                          <q-item
                              clickable
                              class="radius-xs"
                              v-close-popup
                              @click="createAddTodo(`group_${i.id}`)"
                          >
                            <q-item-section side>
                              <q-icon name="mdi-playlist-plus" size="xs" />
                            </q-item-section>
                            <q-item-section class="q-pr-md">
                              {{$t('add_todo')}}
                            </q-item-section>
                          </q-item>
                          <q-item
                              clickable
                              v-close-popup
                              class="radius-xs"
                              @click="createGroupHandler"
                          >
                            <q-item-section side>
                              <q-icon name="mdi-plus-circle-outline" size="xs" />
                            </q-item-section>
                            <q-item-section class="q-pr-md">
                              {{$t('add_todogroup')}}
                            </q-item-section>
                          </q-item>
                        </template>
                        <template
                            v-if="useAuths('delete', [authBase.collection])"
                        >
                          <q-separator spaced />
                          <q-item
                              clickable
                              :v-close-popup="rf_deleteTodogroup"
                              class="radius-xs"
                              :class="rf_deleteTodogroup ? 'bg-negative' : ''"
                              @click="rf_deleteTodogroupFn(i)"
                          >
                            <q-item-section side
                            ><q-icon name="mdi-close" size="xs"
                            /></q-item-section>
                            <q-item-section class="q-pr-md">
                              {{ !rf_deleteTodogroup ? $t('delete_todogroup') : $t('rf_delete_todogroup') }}
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-btn-group>

              </div>
            </div>
            <div class="column no-wrap gap-xs" :class="noneDisplayGroup(i) && todo_add_ing !== `group_${i.id}` ? 'hovered-item' : ''">
              <VueDraggable v-model="i.todos"
                :animation="300" :delay="50" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
                handle=".dragItem" filter=".undrag" group="todo"
                chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
                class="column gap-xs"
                :style="`${todoDragging ? 'min-height: 62px;' : ''}`"
                @start="tododragStart('todo', i)" @sort="dragTodo_sort(i)" @end="tododragEnd"
              >
                <template v-for="element in i.todos" :key="element.id">
                  <TodoItem
                    v-show="!hidecompletedTodo(element)"
                    :card="card"
                    :todogroup="i"
                    :uiOptions
                    :element="element"
                    :authBase
                    @todoDeleted="todoDeleted"
                    @editing="editting_todosGroup = i.id"
                    @unediting="uneditting()"
                    @showAddTodo="showAddTodo"
                    @hideAddTodo="hideAddTodo"
                    @mouseenter="show_addTodo_ofGroup = element.id"
                    @mouseleave="show_addTodo_ofGroup = void 0"
                  >
                    <template v-if="!uiStore.dragging && useAuths('create', [authBase.of === 'card' ? 'card' : 'card_todo'])">
                      <div class="row no-wrap gap-xs items-start q-pl-xs q-pr-sm todo_in_card relative-position hovered-item"
                           :class="todo_add_ing === element.id
                      ? 'border-info radius-xs border-solid border-xs'
                      : 'border-placeholder'
                  "
                           style="order: 99999"
                      >
                        <template v-if="todo_add_ing !== element.id">
                          <div :class="
                            show_addTodo_ofGroup === element.id && enableAddTodo ? 'op-null' : 'op-0'
                          "
                               class="column justify-center items-end q-space q-pr-md bg-primary overflow-show transition"
                               style="height: 1px"
                          >
                            <q-btn
                                dense
                                unelevated
                                color="primary"
                                size="xs"
                                round
                                icon="mdi-plus"
                                @click="createAddTodo(element.id)"
                            />
                          </div>
                        </template>
                        <div v-else class="full-width column no-wrap border-top">
                          <div class="full-width row no-wrap">
                            <div
                                class="transition flex flex-center"
                                style="height: 30px"
                            >
                              <q-checkbox
                                  v-model="todo_params.data.status"
                                  size="xs"
                                  dense
                                  :disable="!todo_params.data.content"
                              >
                              </q-checkbox>
                            </div>
                            <InputDiv
                                v-if="todo_add_ing === element.id"
                                v-model="todo_params.data.content"
                                :auth="useAuths('create', [authBase.of === 'card' ? 'card' : 'card_todo'])"
                                :baseClass="`q-space q-pa-xs`"
                                :autofocus="true"
                                style="
                                  min-height: 30px;
                                  max-width: 240px;
                                  cursor: text;
                                "
                                @update="createTodoFn(i, element)"
                                @ctrlEnter="createTodoFn(i, element)"
                                @cancel="cancelCreateTodo"
                                @ESC="cancelCreateTodo"
                            ></InputDiv>
                          </div>
                          <div
                              v-if="todo_add_ing === element.id && !$q.screen.gt.xs"
                              class="row no-wrap items-center q-py-xs"
                          >
                            <q-btn
                                flat
                                dense
                                :label="$t('cancel')"
                                padding="xs sm"
                                @click="cancelCreateTodo"
                            />
                            <q-space />
                            <q-btn
                                :disable="!todo_params.data.content"
                                dense
                                color="primary"
                                :label="$t('confirm')"
                                padding="xs sm"
                                @click="createTodoFn(i, element)"
                            />
                          </div>
                          <q-inner-loading :showing="todo_creating" size="sm">
                            <q-spinner-dots
                                color="primary"
                                size="1em"
                            />
                          </q-inner-loading>
                        </div>
                      </div>
                    </template>
                  </TodoItem>
                </template>
              </VueDraggable>
              <template v-if="(noneDisplayGroup(i) || todo_add_ing === `group_${i.id}`) && !uiStore.dragging && useAuths('create', [authBase.of === 'card' ? 'card' : 'card_todo'])">
                <div class="row no-wrap gap-xs items-start q-pl-xs q-pr-sm todo_in_card relative-position"
                     :class="todo_add_ing === `group_${i.id}`
                      ? 'border-info radius-xs border-solid border-xs'
                      : 'border-placeholder hover-show'"
                     style="order: 99999"
                >
                  <template v-if="todo_add_ing !== `group_${i.id}`">
                    <div class="column justify-center items-end q-space q-pr-md bg-primary overflow-show transition"
                         style="height: 1px"
                    >
                      <q-btn
                          dense
                          unelevated
                          color="primary"
                          size="xs"
                          round
                          icon="mdi-plus"
                          @click="createAddTodo(`group_${i.id}`)"
                      />
                    </div>
                  </template>
                  <div v-else class="full-width column no-wrap border-top">
                    <div class="full-width row no-wrap">
                      <div
                          class="transition flex flex-center"
                          style="height: 30px"
                      >
                        <q-checkbox
                            v-model="todo_params.data.status"
                            size="xs"
                            dense
                            :disable="!todo_params.data.content"
                        >
                        </q-checkbox>
                      </div>
                      <InputDiv
                          v-model="todo_params.data.content"
                          :auth="useAuths('create', [authBase.of === 'card' ? 'card' : 'card_todo'])"
                          :baseClass="`q-space q-pa-xs`"
                          :autofocus="true"
                          style="
                                  min-height: 30px;
                                  max-width: 240px;
                                  cursor: text;
                                "
                          @update="createTodoFn(i, null)"
                          @ctrlEnter="createTodoFn(i, null)"
                          @ESC="cancelCreateTodo"
                      ></InputDiv>
                    </div>
                    <div
                        v-if="todo_add_ing === `group_${i.id}` && !$q.screen.gt.xs"
                        class="row no-wrap items-center q-py-xs"
                    >
                      <q-btn
                          flat
                          dense
                          :label="$t('cancel')"
                          padding="xs sm"
                          @click="cancelCreateTodo"
                      />
                      <q-space />
                      <q-btn
                          :disable="!todo_params.data.content"
                          dense
                          color="primary"
                          :label="$t('confirm')"
                          padding="xs sm"
                          @click="createTodoFn(i, null)"
                      />
                    </div>
                    <q-inner-loading :showing="todo_creating" size="sm">
                      <q-spinner-dots
                          color="primary"
                          size="1em"
                      />
                    </q-inner-loading>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </VueDraggable>
      <template v-if="useAuths('create', [authBase.collection])">
        <template v-if="todogroups?.length > 0">
          <div v-if="!createTodogroup_ing" class="q-px-xs">
            <q-btn
              v-if="useAuths('create', [authBase.collection])"
              dense
              size="sm"
              flat
              round
              icon="add"
              @click="createGroupHandler"
            >
              <q-tooltip
                class="border"
                :class="
                  $q.dark.mode
                    ? 'bg-grey-10 text-grey-1'
                    : 'bg-grey-1 text-grey-10'
                "
              >
                {{ $t('add_todogroup') }}
              </q-tooltip>
            </q-btn>
          </div>
        </template>
        <div
          v-if="
            !createTodogroup_ing &&
            todogroups?.length === 0 &&
            !uiStore.dragging
          "
          class="absolute-full column flex-center"
        >
          <div class="fit column flex-center">
            <div class="column no-wrap">
              <q-btn
                flat
                icon="add"
                :label="$t('add_todogroup')"
                class="border"
                @click="createGroupHandler"
              />
            </div>
          </div>
          <q-space />
        </div>
        <div v-if="createTodogroup_ing" class="q-px-sm">
          <div class="full-width q-pa-xs">
            <q-input
              v-model="params.data.name"
              dense
              square
              autofocus
              type="text"
              :placeholder="$t('todogroup_name')"
              @keyup.esc="createTodogroup_ing = false"
              @keyup.enter="createTodogroupFn()"
            >
              <template v-if="params.data.name" v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="check"
                  @click="createTodogroupFn()"
                />
              </template>
            </q-input>
          </div>
        </div>
      </template>
    </template>
    <q-dialog v-model="add_attachment_dialog" persistent>
      <q-card bordered style="min-width: 360px">
        <q-card-section class="q-pa-xs">
          <StrapiUpload
            :bordered="false"
            :label="$t('attach_file')"
            class="no-padding fit"
            color="transparent"
            accept=".jpg,.png,.mp4,.mov,.m4v,.jpeg,.png,.webp,.svg,.avi,.pdf,.ppt,.pptx,.doc,.docx"
            @uploaded="attachFile"
          ></StrapiUpload>
        </q-card-section>
        <q-card-actions align="left" class="q-pa-xs border-top">
          <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
// 设计思路：
// todogroups关联给用户和card两种情况
// 关联给卡片的时候，走正常鉴权流程，从belong_to对象中获取数据
// 关联给用户的时候，根据提供的kanban_id，从用户的所有todogroups中筛选出内容
// 在项目或看板右侧抽屉中展示

// 实现效果：
// 1.卡片上可以独立展示自己的todogroups
// 2.用户针对不同的看板可以自己增加todogroups，作为对应的私有内容，仅供自己查阅
import {computed, onBeforeMount, ref, toRefs, watch, nextTick, watchEffect} from "vue";
import {
  createTodo,
  createTodogroup,
  deleteTodogroup,
  findCardFeedback,
  findCardFeedbackByShare,
  updateCard,
  updateTodo,
  updateTodogroup,
} from "src/api/strapi/project.js";
import {updateUserTodogroups} from "src/api/strapi.js";
import {VueDraggable} from 'vue-draggable-plus'
import InputDiv from "src/components/Utilits/InputDiv.vue";
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";

import {useQuasar} from "quasar";
import PersonTip from "./tips/PersonTip.vue";
import ProjectTip from "./tips/ProjectTip.vue";

import TodoItem from "./TodoItem.vue";
import {teamStore, uiStore, userStore} from "src/hooks/global/useStore.js";
import localforage from "localforage";

import {objectsIsEqual} from "src/hooks/utilits.js";
import {useRoute, useRouter} from "vue-router";

const userId = computed(() => teamStore.init?.id);

const $q = useQuasar();

const props = defineProps({
  kanban_id: {
    type: Number,
    default: NaN,
  },
  card: {
    type: Object,
    default() {
      return null;
    },
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  uiOptions: {
    type: Object,
    default() {
      return null;
    },
  },
  isClassroom: {
    type: Boolean,
    default: false,
  },
  asTitle: {
    type: String,
    default: "memo",
  },
  layout: {
    type: String,
    default: "column",
  },
  assignData: {
    type: Array,
    default: void 0,
  },
  hideToolbar: {
    type: Boolean,
    default: false,
  },
  isFeedback: {
    type: Boolean,
    default: false,
  },
  byInfo: {
    type: Object,
    default: void 0,
  },
  /*
  定义todo的附加对象：
    @card_todo - 卡片的todo；
    @feedback - 卡片的反馈；
    @private - 用户的todo
  */
  _for: {
    type: String,
    default: void 0,
  },
  displayType: {
    type: String,
    default: 'todo',
  },
});

// 父组件传参：
// 根据设计思路，只有属于卡片时，是从卡片获取数据
// 其它时候都是从用户的所有待办中根据对应ID来筛选
const {
  kanban_id,
  card,
  isCreator,
  isPrivate,
  uiOptions,
  isClassroom,
  layout,
  assignData,
  hideToolbar,
  isFeedback,
  byInfo,
  _for,
  displayType
} = toRefs(props);
// 确定判断鉴权的字段
// 只有在todogroups是属于卡片的时候需要鉴权
// 其它时候，todogroups都是属于用户的
// 只是需要根据对应的kanban_id来做筛选
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card) {
    const members = teamStore.card.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (card.value) {
    if (isInCard) {
      res = {
        collection: "todogroups",
        of: "card",
      };
    } else {
      res = {
        collection: "card_todogroups",
        of: "project",
      };
    }
  }
  return res;
});

// 仅限个人 todo
const toggleHideCompleted = async (i) => {
  i.hideCompleted = i.hideCompleted ? !i.hideCompleted : true;
  const _key = `__todogroup_${i.id}_pfrs`;
  await localforage.setItem(_key, i.hideCompleted);
};

const attachHiddenStatus = async (_todogroups) => {
  const fetchHiddenStatus = async (group) => {
    const _key = `__todogroup_${group.id}_pfrs`;
    const res = await localforage.getItem(_key);
    return res ? res : false;
  };

  // 使用 Promise.all 等待所有 fetchHiddenStatus 调用完成
  const promises = _todogroups?.map(async (group) => {
    // 注意：这里不需要 await，因为 Promise.all 会处理
    return fetchHiddenStatus(group).then((hidden) => {
      // 修改原始对象可能会导致意外的副作用，通常最好返回一个新对象
      return { ...group, hideCompleted: hidden };
    });
  });

  // 等待所有 Promise 完成，并将结果收集到一个数组中
  // console.log("fetchHiddenStatus", result);
  return await Promise.all(promises);
};
const moveTarget = ref();
const createTodogroup_ing = ref(false);
const params = ref({
  data: {
    name: "",
  },
});
const emit = defineEmits([
  "todogroupSort",
  "todogroupUpdate",
  "deleteTodogroup",
  "createTodogroup",
  "todoSort",
  "disableAction",
]);
const noneDisplayGroup = (group) => {
  return !group.todos || group.todos.filter(j => !j.status)?.length === 0
}
const fetchFeedback = async () => {
  if (!isFeedback.value) return;
  let res;
  if (teamStore.shareInfo) {
    res = await findCardFeedbackByShare(
      teamStore.card?.id,
      teamStore.shareInfo.code,
      teamStore.shareInfo.by
    );
  } else {
    res = await findCardFeedback(teamStore.card?.id);
  }
  if (res?.data) {
    teamStore.card.feedback = res.data;
  }
};
const groupScroll = ref();
const getScollInfo = (info) => {
  groupScroll.value = info;
  // console.log('groupScroll',groupScroll.value)
};

const needEmit = ref(false);
watchEffect(() => {
  needEmit.value = card.value || _for.value === "card_todo";
});

const todogroups = ref([]);
// 附加对象：
//     用户私有清单
// 全局的、绑定到看板的
// 共享用户反馈： feedback
// 卡片：
//   看板中的卡片
// 打开详情弹框后待办面板
//
// 赋值逻辑
// 共享页面：
//     feedback数据：1.是共享状态；2.card状态数据存在；3.没有被父组件指定数据（在共享状态下有两个待办组件，还有一个就是卡片本身的待办）
//         卡片待办：父组件赋值
// 卡片自身：父组件传递card数据，如果存在card数据，从card数据中提取
// 弹框内：
//     feedback数据：同共享页面；
//         卡片待办：父组件赋值；
//         用户关联的私有清单：从用户清单中提取
// 看板中：
//         用户关联的私有清单：从用户清单中提取
// 个人规划：
//         从用户初始化数据中提取
const user_todogroups = computed(() => teamStore.init?.todogroups);
const loading = ref(false);
const getTodogroups = async () => {
  loading.value = true;
  let res;
  if(card.value) {
    // 看板上卡片的todo
    res = card.value.todogroups;
  } else if (kanban_id.value) {
    res = user_todogroups.value?.filter(
      (i) => i.kanban?.id === kanban_id.value // 看板中，用户关联的私有todo
    );
  } else if (uiStore.isShared && teamStore.card && !assignData.value) {
    res = teamStore.card?.todogroups || []; // 共享页面中的待办面板todo
  } else if (assignData.value) {
    res = assignData.value; // 共享页面中的feedback的todo、弹框中待办面板的数据
  } else {
    res = user_todogroups.value;
  }
  if (res?.length > 0 && !card.value) {
    // card todogroup no need attachHiddenStatus
    res = await attachHiddenStatus(res);
  }
  
  todogroups.value = res;
  loading.value = false;
};
const filterUserTodo = (_todogroups) => {
  if(userStore.affairsFilterIDs?.length > 0){
    return _todogroups.filter((i) => userStore.affairsFilterIDs.includes(i.id))
  } else {
    return _todogroups;
  }
}
watchEffect(() => {
  if (_for.value === "user_todos") {
    todogroups.value = filterUserTodo(user_todogroups.value);
  }
})
watch(
  [card, assignData],
  async () => {
    if (card.value || assignData.value) {
      await getTodogroups();
    }
  },
  { immediate: false, deep: true }
);
onBeforeMount(async () => {
  await getTodogroups();
});
const hidecompletedTodo = (i) => {
  const pfrs = uiOptions.value?.find((i) => i.val === "hidecompletedTodo");
  return (pfrs.enable && i?.status) || false;
};

const updateCache = async (_todogroups) => {
  if (card.value) return;
  const _cache = await localforage.getItem("init");
  if (_cache?.todogroups) {
    _cache.todogroups = _todogroups;
    await localforage.setItem("init", _cache);
  }
};
const createGroupPopupRef = ref(null);
const createGroupHandler = () => {
  params.value.data.name = "";
  createTodogroup_ing.value = true;
  if (layout.value === "row") {
    scrollAreaRef.value.setScrollPosition(
      "vertical",
      groupScroll.value?.verticalContainerSize,
      300
    );
  }
};
const cancelUpdateGroupHandler = () => {
  params.value.data.name = "";
  updateTodogroup_target.value = null;
};
const createTodogroupFn = async () => {
  if (loading.value) return;
  loading.value = true;
  if (!params.value.data.name) {
    createTodogroup_ing.value = false;
    return;
  }
  if (kanban_id.value) {
    params.value.kanban_id = kanban_id.value;
  }
  if (card.value) {
    params.value.card_id = card.value?.id;
  } else if (teamStore.card) {
    params.value.card_id = teamStore.card?.id;
  }
  // console.log("params.value", params.value);
  let res = await createTodogroup(params.value);
  if (res?.data) {
    if (card.value || _for.value === "card_todo") {
      // console.log('emit createTodogroup')
      emit("createTodogroup", res.data);
    } else {
      todogroups.value.push(res.data);
    }
    params.value.data.name = "";
    createTodogroup_ing.value = false;
    loading.value = false;
    createGroupPopupRef.value?.hide();
  }
};

const toggle_updateTodogroup = (i) => {
  if (isFeedback.value) return;
  updateTodogroup_target.value = i.id;
  params.value.data.name = i.name;
};
const updateTodogroup_target = ref();
const todogroupMenuRef = ref();

const updateTodogroupFn = async (i) => {
  if (!params.value.data.name) return;
  if (byInfo.value?.by === "card") {
    params.value.props = {
      card_id: byInfo.value?.card_id,
    };
  }
  let res = await updateTodogroup(i.id, params.value);
  if (res) {
    if (card.value || _for.value === "card_todo") {
      emit("todogroupUpdate", i, res.data);
    } else {
      Object.assign(i, res.data);
    }
    updateTodogroup_target.value = null;
    params.value.data.name = "";
    if (todogroupMenuRef.value) {
      todogroupMenuRef.value.hide();
    }
  }
};
const dragTodo_sort = async (i) => {
  await nextTick();
  let sort = i.todos.map((i) => i.id);
  if (card.value || _for.value === "card_todo") {
    emit("todoSort", i, sort);
  }
  let params = {
    data: {
      todos: sort,
    },
  };
  if (byInfo.value?.by === "card") {
    params.props = {
      card_id: byInfo.value?.card_id,
    };
  }
  let res = await updateTodogroup(i.id, params);
  if (res?.data) {    
    userStore.todogroups = userStore.todogroups.map((i) => i.id === res.data.id ? res.data : i);
    teamStore.init.todogroups = userStore.todogroups;
    await getTodogroups();
  }
};
const dragTodogroup_sort = async () => {
  await nextTick();
  dragging.value = false;
  const sort = todogroups.value.map((i) => i.id);
  if (card.value || _for.value === "card_todo") {
    console.log('dragTodogroup_sort', todogroups.value)
    emit("todogroupSort", sort);
  }
  let params = {
    data: {
      todogroups: sort,
    },
  };
  if ((teamStore.card && !isClassroom.value) || card.value) {
    // console.log('card', todogroups.value)
    params.project_id = teamStore.project?.id;

    let card_id;
    if (card.value) {
      card_id = card.value.id;
    } else if (teamStore.card) {
      card_id = teamStore.card?.id;
    }
    await updateCard(card_id, params);
  } else if (_for.value === "user_todos" || kanban_id.value) {
    // console.log('user_todos', todogroups.value)
    const _update = await updateUserTodogroups(params);
    if(_update?.data){
      teamStore.init.todogroups = _update.data
      userStore.todogroups = _update.data
      await getTodogroups();
    }
  }
};
const rf_deleteTodogroup = ref(false);
const rf_deleteTodogroupFn = async (i) => {
  if (!i.todos || i.todos?.length === 0) {
    await deleteTodogroupFn(i);
    return;
  }
  if (!rf_deleteTodogroup.value) {
    rf_deleteTodogroup.value = true;
  } else {
    await deleteTodogroupFn(i);
    rf_deleteTodogroup.value = false;
  }
};
const deleteTodogroupFn = async (i) => {
  let res = await deleteTodogroup(i.id);
  if (res) {
    if (card.value || _for.value === "card_todo") {
      emit("deleteTodogroup", i);
    } else {
      todogroups.value = todogroups.value.filter(
        (todogroup) => todogroup.id !== i.id
      );
    }
  }
};

const todo_params = ref({
  data: {
    content: "",
    status: false,
  },
});
const todo_add_ing = ref(void 0);
const todo_creating = ref(false);
const editting_todosGroup = ref(void 0);
const show_addTodo_ofGroup = ref(void 0);
const uneditting = () => {
  setTimeout(() => {
    editting_todosGroup.value = void 0;
  }, 300);
};
const createAddTodo = (_id) => {
  /**
   * updateValue event in q-menu,need setTimeout, unknown why
   */
  setTimeout(() => {
    todo_add_ing.value = _id;
  },1)
};

const createTodoFn = async (i, todo) => {
  if (!i.todos) {
    i.todos = [];
  }
  if (!todo_params.value.data.content) {
    todo_add_ing.value = void 0;
    return;
  }

  // todo_params.value 有脏数据，这里不重置，直接赋值
  let create_params = {
    todogroup_id: i.id,
    data: {},
  };
  if(todo){
    create_params.after = todo.id
  }
  create_params.data.content = todo_params.value.data.content;
  // console.log('window.fingerprint', window.fingerprint)
  if (teamStore.shareInfo) {    
    create_params.shareInfo = teamStore.shareInfo;
    create_params.data.fingerprint = window.fingerprint;
  }

  let res = await createTodo(create_params);
  todo_params.value.data.content = "";
  if (res?.data) {
    // console.log('createTodo',res?.data);

    // const todoIndex = i.todos.findIndex(t => t.id === todo.id)
    // if (todoIndex !== -1) {
    //   i.todos.splice(todoIndex + 1, 0, res?.data);
    // }
    if(!card.value){
      i.todos = [...i.todos, res.data];
    }
    cancelCreateTodo();
  }
  return res?.data;
};

const keepCreate = async (i, todo) => {
  const _create = await createTodoFn(i, todo);
  if (_create) {
    todo_add_ing.value = i.id;
  }
};
const cancelCreateTodo = () => {
  todo_params.value.data.content = "";
  todo_add_ing.value = void 0;
};

const oldVal = ref(null);
const focusOn = ref(null);
const todoSource = ref();
const updateTodoFn = async (i, todo) => {
  const isChanged = objectsIsEqual(todoSource.value, todo);
  if (!isChanged) return;
  todo_params.value.data = todo;
  if (byInfo.value?.by === "card") {
    todo_params.value.props = {
      card_id: byInfo.value?.card_id,
    };
  }
  let res = await updateTodo(todo.id, todo_params.value);
  if (res.data) {
    // Object.assign(todo, res.data);
    focusOn.value = null;
    updateTodo_target.value = null;

    setTimeout(() => {
      // 延时重置，否则UI闪烁
      todo_params.value.data = Object.assign({});
    }, 50);
    return res.data;
  }
};

const todoDeleted = (_gid, _tid) => {
  if (!card.value) {
    const _todos = todogroups.value.find((g) => g.id === _gid).todos;
    todogroups.value.find((g) => g.id === _gid).todos = _todos.filter(
      (t) => t.id !== _tid
    );
  }
};

const add_attachment_dialog = ref(false);
const add_attachment_props = ref();
const attachFile = async (files) => {
  // console.log(files);
  const fileIds = (files.length > 0 && files.map((i) => i.id)) || [];
  let { todogroup, todo } = add_attachment_props.value;
  todo.attachment = todo.attachment
    ? [...todo.attachment, ...fileIds]
    : fileIds;
  let res = await updateTodoFn(todogroup, todo);
  if (res) {
    add_attachment_props.value = {};
    todo_params.value.data = {
      content: "",
      status: false,
    };
    setTimeout(() => {
      add_attachment_dialog.value = false;
    }, 500);
  }
};

const hoverOn = ref("");
const updateTodo_target = ref();
const dragging = ref(false);
const todoDragging = ref(false);
const tododragStart = (_gName, _g) => {
  todoDragging.value = true;
  uiStore.dragging = true;
  uiStore.topPannel = true;
  uiStore.dropGroup = _gName;
  uiStore.dropTodo_belonged = {
    card: card.value,
    todogroup: _g
  };
};
const tododragEnd = () => {
  todoDragging.value = false;
  uiStore.dragging = false;
  uiStore.topPannel = false;
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

watch([todo_add_ing, createTodogroup_ing], () => {
  if (todo_add_ing.value || createTodogroup_ing.value) {
    emit("disableAction", true);
  } else {
    emit("disableAction", false);
  }
});

const dragscrollstart = () => {
  uiStore.draging = true;
};
const draging = () => {
  // uiStore.draging = true
};
const dragscrollend = () => {
  uiStore.draging = false;
};
const mainAreaHeight = ref();
const groupAreaHeight = ref();
function onResize(size) {
  mainAreaHeight.value = size.height;
}
const disableScrollX_byWheel = ref(false);
function onColumnResize(size) {
  groupAreaHeight.value = size.height
  disableScrollX_byWheel.value = mainAreaHeight.value < size.height;
}
const setScroll = (val) => {
  uiStore.dragKanbanScrollEnable = val;
  uiStore.scrollX_byWheel = disableScrollX_byWheel.value ? false : val;
};
const outsideScroll = (group, val) => {
  if (val) {
    moveTarget.value = `group_${group.id}`;
    uiStore.dragKanbanScrollEnable = val;
    uiStore.scrollX_byWheel = val;
  } else {
    moveTarget.value = null;
  }
};
const scrollAreaRef = ref(null);
const handleScroll = (event) => {
  if (!uiStore.scrollX_byWheel || layout.value === "column") return;
  uiStore.draging = true;
  event.preventDefault();
  let scroolPosition = scrollAreaRef.value?.getScrollPosition();
  let x = scroolPosition.left;
  // 根据滚轮动作计算滚动距离
  const deltaY = event.deltaY || event.detail || event.wheelDelta;
  const moveAmount = -deltaY; // 正负号取决于你希望的滚动方向
  scrollAreaRef.value?.setScrollPosition("horizontal", x + moveAmount, 0);
  uiStore.draging = false;
};
watch(
  todogroups,
  () => {
    if (todogroups.value?.length > 0 && !card.value) {
      const _cache = JSON.parse(JSON.stringify(todogroups.value));
      updateCache(_cache);
    }
  },
  { immediate: false, deep: true }
);
const dragStart = (_gName) => {
  dragging.value = true;
  uiStore.dragKanbanScrollEnable = false;
  uiStore.dragging = true;
  uiStore.topPannel = true;
  uiStore.dropGroup = _gName;
};
const dragEnd = () => {
  dragging.value = false;
  uiStore.dragKanbanScrollEnable = true;
  uiStore.dragging = false;
  uiStore.topPannel = false;
};

const enableAddTodo = ref(true);
const showAddTodo = () => {
  enableAddTodo.value = true
}
const hideAddTodo = () => {
  enableAddTodo.value = false
}

const route = useRoute();
const router = useRouter();
</script>

<style lang="scss">
.todo_in_card textarea {
  min-height: 24px !important;
  line-height: 24px !important;
  padding-top: 0 !important;
}
.todo_in_card .q-textarea {
  min-height: 24px !important;
}
.todo_in_card .q-textarea.q-field--dense {
  min-height: 24px !important;
}
.todo_in_card .q-textarea.q-field--dense .q-field__control,
.q-textarea.q-field--dense .q-field__native {
  min-height: 24px;
}
</style>
