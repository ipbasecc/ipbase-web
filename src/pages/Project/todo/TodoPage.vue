<template>
  <div
    class="fit column no-wrap"
    :class="attach_to === -1 && ($q.dark.mode ? 'bg-grey-10' : 'bg-grey-1')"
  >
    <q-bar
      v-if="attach_to === -1"
      class="transparent border-bottom op-5"
      style="height: 40px"
    >
      <q-toolbar-title>
        {{ kanban_id ? "个人自定备忘" : "个人备忘" }}
      </q-toolbar-title>
      <q-space />
      <PersonTip />
    </q-bar>
    <q-scroll-area
      v-if="attach_to != -3"
      class="q-space column no-wrap gap-sm q-px-sm q-pb-lg"
    >
      <template v-if="todogroups?.length > 0">
        <draggable
          :list="todogroups"
          animation="300"
          :delay="30"
          :fallbackTolerance="2"
          :force-fallback="true"
          :fallbackOnBody="false"
          :item-key="(key) => key"
          :sort="true"
          :touchStartThreshold="2"
          :scroll="true"
          ghost-class="ghostColumn"
          chosen-class="chosenGroupClass"
          drag-class="dragClass"
          group="todogroup"
          handle=".dragBar"
          filter=".undrag"
          class="column gap-xs relative-position"
          :class="`${projectStore.cardDragging ? 'q-space' : ''}`"
          @change="dragTodogroup_sort()"
          @start="dragging = true"
          @end="dragging = false"
          :style="dragging ? 'min-height: 50px;' : ''"
        >
          <template #item="{ element: i }">
            <div class="full-width column no-wrap gap-xs q-pa-sm">
              <div
                v-if="updateTodogroup_target != i.id"
                class="row no-wrap items-center q-pa-sm border-bottom q-mb-sm"
                @mouseenter="moveTarget = `group_${i.id}`"
                @mouseleave="moveTarget = null"
              >
                <div v-if="moveTarget === `group_${i.id}`" class="q-pr-sm">
                  <q-icon name="drag_indicator" class="dragBar" />
                </div>
                <span @dblclick="toggle_updateTodogroup(i)" class="q-space">
                  {{ i.name }}
                  <q-tooltip>
                    <span>双击改名</span>
                  </q-tooltip>
                </span>
                <div class="row no-wrap gap-xs">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    round
                    icon="add"
                    @click="
                      (params.data.name = ''), (createTodogroup_ing = true)
                    "
                  />
                  <q-btn flat dense size="sm" round icon="more_vert">
                    <q-menu class="radius-sm shadow-12">
                      <q-list
                        dense
                        bordered
                        class="radius-sm q-pa-xs text-no-wrap"
                      >
                        <q-item
                          clickable
                          v-close-popup
                          class="radius-xs"
                          @click="deleteTodogroupFn(i)"
                        >
                          <q-item-section side
                            ><q-icon name="close" size="xs"
                          /></q-item-section>
                          <q-item-section class="q-pr-md"
                            >删除该分组</q-item-section
                          >
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          class="radius-xs"
                          @click="rf_deleteTodogroupFn(i)"
                        >
                          <q-item-section side
                            ><q-icon name="close" size="xs"
                          /></q-item-section>
                          <q-item-section class="q-pr-md"
                            >强制删除该分组</q-item-section
                          >
                          <div class="absolute-full bg-negative op-2"></div>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
              <div
                v-if="updateTodogroup_target === i.id"
                class="q-pa-xs undrag"
              >
                <q-input
                  v-model="params.data.name"
                  dense
                  square
                  autofocus
                  type="text"
                  placeholder="待办分组名称"
                  @keyup.esc="updateTodogroup_target = null"
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
                      @click="updateTodogroupFn(i)"
                    />
                  </template>
                </q-input>
              </div>
              <div class="column no-wrap gap-xs">
                <draggable
                  :list="i.todos"
                  animation="300"
                  :delay="30"
                  :fallbackTolerance="2"
                  :force-fallback="true"
                  :fallbackOnBody="true"
                  :item-key="(key) => key"
                  :sort="true"
                  :touchStartThreshold="2"
                  :scroll="true"
                  ghost-class="ghostColumn"
                  chosen-class="chosenGroupClass"
                  drag-class="dragClass"
                  group="todo"
                  handle=".dragBar"
                  filter=".undrag"
                  class="column gap-xs"
                  :class="`${projectStore.cardDragging ? 'q-space' : ''} ${
                    todoDragging ? 'border radius-sm' : ''
                  }`"
                  @change="dragTodo_sort(i)"
                  @start="todoDragging = true"
                  @end="todoDragging = false"
                  :style="todoDragging ? 'min-height: 50px;' : ''"
                >
                  <template #item="{ element }">
                    <div
                      class="row gap-sm no-wrap hovered-item"
                      :class="element.status ? 'delete op-3' : ''"
                      @mouseenter="hoverOn = `todo_${element.id}`"
                      @mouseleave="hoverOn = null"
                    >
                      <q-input
                        v-model="element.content"
                        dense
                        square
                        filled
                        type="text"
                        :placeholder="element.content"
                        @focus="onFocuson(element)"
                        class="q-pa-xs radius-xs border q-space z-fab"
                        @blur="updateTodoFn(i, element)"
                        @keyup.enter="updateTodoFn(i, element)"
                        @keyup.ctrl.enter="updateTodoFn(i, element)"
                      >
                        <template v-slot:prepend>
                          <q-icon
                            v-if="hoverOn === `todo_${element.id}`"
                            name="drag_indicator"
                            class="dragBar q-mr-sm hover-show"
                          />
                          <q-checkbox
                            v-model="element.status"
                            dense
                            @update:model-value="statusChange(i, element)"
                          />
                        </template>
                        <template v-slot:append>
                          <q-btn
                            v-if="
                              oldVal &&
                              oldVal != element.content &&
                              focusOn === element.id
                            "
                            flat
                            round
                            dense
                            size="sm"
                            icon="check"
                            @click="updateTodoFn(i, element)"
                          />
                          <q-btn
                            v-else-if="hoverOn === `todo_${element.id}`"
                            flat
                            round
                            dense
                            size="sm"
                            icon="close"
                            @click.stop="deleteTodoFn(i, element)"
                          />
                        </template>
                      </q-input>
                    </div>
                  </template>
                  <template #footer>
                    <div
                      v-if="todo_add_ing === i.id"
                      class="q-pa-xs radius-xs border"
                    >
                      <q-input
                        v-model="todo_params.data.content"
                        dense
                        square
                        filled
                        autofocus
                        type="text"
                        placeholder="待办内容"
                        @keydown.esc="todo_add_ing = false"
                        @keyup.enter="createTodoFn(i)"
                        @keyup.ctrl.enter="createTodoFn(i)"
                      >
                        <template v-slot:append>
                          <q-btn
                            flat
                            round
                            dense
                            size="sm"
                            icon="add"
                            @click="createTodoFn(i)"
                          />
                        </template>
                      </q-input>
                    </div>
                    <div
                      v-if="!todo_add_ing"
                      class="row no-wrap q-pa-xs items-center q-pl-sm"
                    >
                      <q-btn
                        dense
                        size="md"
                        flat
                        round
                        class="border"
                        @click="todo_add_ing = i.id"
                      >
                        <q-icon name="add" size="xs" class="op-5" />
                      </q-btn>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </template>
        </draggable>
      </template>
      <div v-if="createTodogroup_ing" class="q-px-sm">
        <div class="full-width q-pa-xs">
          <q-input
            v-model="params.data.name"
            dense
            square
            autofocus
            type="text"
            placeholder="待办分组名称"
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
      <div
        v-if="todogroups?.length === 0 && !createTodogroup_ing"
        class="absolute-full column flex-center"
      >
        <div class="q-space column flex-center">
          <div class="column no-wrap">
            <ProjectTip :kanban_id />
            <q-btn
              flat
              icon="add"
              label="新建清单分组"
              class="border q-mt-md"
              @click="(params.data.name = ''), (createTodogroup_ing = true)"
            />
          </div>
        </div>
        <q-space />
      </div>
    </q-scroll-area>
    <template
      v-if="
        attach_to === -3 &&
        (calc_auth(authBase.collection, 'read', authBase.of) ||
          isCreator ||
          isPrivate)
      "
    >
      <template v-if="todogroups?.length > 0">
        <draggable
          :list="todogroups"
          animation="300"
          :delay="30"
          :fallbackTolerance="2"
          :force-fallback="true"
          :fallbackOnBody="true"
          :item-key="(key) => key"
          :sort="true"
          :touchStartThreshold="2"
          :scroll="true"
          ghost-class="ghostColumn"
          chosen-class="chosenGroupClass"
          drag-class="dragClass"
          group="todogroup"
          handle=".dragBar"
          filter=".undrag"
          class="column gap-xs relative-position aaa"
          :class="`${projectStore.cardDragging ? 'q-space' : ''}`"
          @start="dragging = true"
          @end="dragging = false"
          @change="dragTodogroup_sort()"
          :style="dragging ? 'min-height: 50px;' : ''"
        >
          <template #item="{ element: i }">
            <div
              class="column no-wrap gap-xs q-px-sm"
              @mouseenter="moveTarget = `group_${i.id}`"
              @mouseleave="moveTarget = null"
            >
              <div class="row no-wrap items-center q-px-sm hovered-item">
                <div
                  v-if="
                    moveTarget === `group_${i.id}` &&
                    (calc_auth(authBase.collection, 'order', authBase.of) ||
                      isCreator)
                  "
                  class="q-pr-sm"
                >
                  <q-icon name="drag_indicator" class="dragBar" />
                </div>
                <span class="q-space text-line-1 font-bold-600"
                  >{{ i.name }}
                  <q-popup-proxy
                    cover
                    v-if="
                      calc_auth(authBase.collection, 'name', authBase.of) ||
                      isCreator
                    "
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
                        placeholder="待办分组名称"
                        class="undrag"
                        @keyup.esc="updateTodogroup_target = null"
                        @keyup.ctrl.enter="updateTodogroupFn(i)"
                        @keyup.enter="updateTodogroupFn(i)"
                      >
                        <template v-slot:append>
                          <q-btn
                            v-if="params?.data?.name != i.name"
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
                </span>
                <div class="row no-wrap gap-xs hover-show transition">
                  <q-btn
                    v-if="
                      calc_auth(authBase.collection, 'create', authBase.of) ||
                      isCreator
                    "
                    dense
                    size="sm"
                    flat
                    round
                    icon="add"
                    @click="
                      (params.data.name = ''), (createTodogroup_ing = true)
                    "
                  />
                  <q-btn
                    v-if="
                      calc_auth(authBase.collection, 'delete', authBase.of) ||
                      isCreator
                    "
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
                          v-if="
                            calc_auth(
                              authBase.collection,
                              'delete',
                              authBase.of
                            ) || isCreator
                          "
                        >
                          <q-item
                            clickable
                            v-close-popup
                            class="radius-xs"
                            @click="deleteTodogroupFn(i)"
                          >
                            <q-item-section side
                              ><q-icon name="close" size="xs"
                            /></q-item-section>
                            <q-item-section class="q-pr-md"
                              >删除该分组</q-item-section
                            >
                          </q-item>
                          <template v-if="i.todos?.length > 0">
                            <q-separator spaced />
                            <q-item
                              clickable
                              v-close-popup
                              class="radius-xs"
                              @click="rf_deleteTodogroupFn(i)"
                            >
                              <q-item-section side
                                ><q-icon name="close" size="xs"
                              /></q-item-section>
                              <q-item-section class="q-pr-md"
                                >强制删除该分组</q-item-section
                              >
                              <div class="absolute-full bg-negative op-2"></div>
                            </q-item>
                          </template>
                        </template>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
              <div class="column no-wrap gap-xs">
                <draggable
                  :list="i.todos"
                  animation="300"
                  :delay="30"
                  :fallbackTolerance="2"
                  :force-fallback="true"
                  :fallbackOnBody="true"
                  :item-key="(key) => key"
                  :sort="true"
                  :touchStartThreshold="2"
                  :scroll="true"
                  ghost-class="ghostColumn"
                  chosen-class="chosenGroupClass"
                  drag-class="dragClass"
                  group="todo"
                  handle=".dragBar"
                  filter=".undrag"
                  class="column gap-xs"
                  @start="todoDragging = true"
                  @end="todoDragging = false"
                  @change="dragTodo_sort(i)"
                  :style="`${todoDragging ? 'min-height: 62px;' : ''}`"
                >
                  <template #item="{ element }">
                    <div
                      v-show="!hidecompletedTodo(element)"
                      class="column no-wrap hovered-item hover-border radius-xs"
                    >
                      <div
                        class="row no-wrap gap-xs items-start q-px-xs radius-xs todo_in_card relative-position"
                        @mouseenter="hoverOn = `todo_${element.id}`"
                        @mouseleave="hoverOn = null"
                      >
                        <div
                          v-if="
                            calc_auth(
                              `${
                                authBase.of === 'card' ? 'card' : 'card_todo'
                              }`,
                              'order',
                              authBase.of
                            ) || isCreator
                          "
                          class="hover-show transition"
                        >
                          <q-icon name="drag_indicator" class="dragBar" />
                        </div>
                        <q-checkbox
                          v-model="element.status"
                          size="xs"
                          dense
                          :disable="
                            !calc_auth(
                              `${
                                authBase.of === 'card' ? 'card' : 'card_todo'
                              }`,
                              'status',
                              authBase.of
                            )
                          "
                          class="q-pt-xs"
                          @update:model-value="statusChange(i, element)"
                        >
                        </q-checkbox>
                        <span
                          :class="`
                            ${
                              element.status ? 'op-3 line-through' : ''
                            } q-space q-px-xs
                            ${
                              element?.color_marker != 'clear'
                                ? `text-${element.color_marker}`
                                : ''
                            }`"
                        >
                          {{ element.content }}
                        </span>
                        <template
                          v-if="
                            calc_auth(
                              `${
                                authBase.of === 'card' ? 'card' : 'card_todo'
                              }`,
                              'content',
                              authBase.of
                            ) || isCreator
                          "
                        >
                          <q-popup-proxy cover class="border radius-xs q-pa-xs">
                            <q-input
                              v-model="element.content"
                              autofocus
                              autogrow
                              dense
                              square
                              filled
                              @keyup.enter="updateTodoFn(i, element)"
                            >
                              <template v-slot:append>
                                <q-btn
                                  flat
                                  round
                                  dense
                                  size="sm"
                                  icon="check"
                                  @click="updateTodoFn(i, element)"
                                />
                              </template>
                            </q-input>
                          </q-popup-proxy>
                        </template>
                        <q-btn
                          v-if="
                            calc_auth(
                              `${
                                authBase.of === 'card' ? 'card' : 'card_todo'
                              }`,
                              'content',
                              authBase.of
                            ) ||
                            calc_auth(
                              `${
                                authBase.of === 'card' ? 'card' : 'card_todo'
                              }`,
                              'delete',
                              authBase.of
                            ) ||
                            isCreator
                          "
                          round
                          dense
                          flat
                          size="sm"
                          icon="more_vert"
                          class="hover-show transition"
                        >
                          <!-- 更新 Todo 菜单 -->
                          <q-menu class="radius-sm">
                            <q-list bordered dense class="radius-sm q-pa-xs">
                              <template
                                v-if="
                                  calc_auth(
                                    `${
                                      authBase.of === 'card'
                                        ? 'card'
                                        : 'card_todo'
                                    }`,
                                    'content',
                                    authBase.of
                                  ) || isCreator
                                "
                              >
                                <q-item>
                                  <q-item-section>
                                    <div
                                      class="row no-wrap items-center gap-sm"
                                    >
                                      <q-icon
                                        v-for="marker in colorMarks"
                                        :key="marker"
                                        v-close-popup
                                        dense
                                        :size="
                                          element.color_marker === marker
                                            ? '18px'
                                            : '12px'
                                        "
                                        flat
                                        round
                                        padding="none"
                                        :color="marker"
                                        :name="
                                          element.color_marker === marker
                                            ? 'mdi-checkbox-marked-circle'
                                            : 'mdi-checkbox-blank-circle'
                                        "
                                        class="cursor-pointer"
                                        @click="
                                          updateTodoColorMarker(
                                            i,
                                            element,
                                            marker
                                          )
                                        "
                                      />
                                    </div>
                                  </q-item-section>
                                </q-item>
                                <q-separator spaced class="op-3" />
                                <q-item
                                  clickable
                                  v-ripple
                                  class="radius-xs"
                                  @click.stop="addAttachment(i, element)"
                                >
                                  <q-item-section side class="q-pr-sm">
                                    <q-icon size="xs" name="attachment" />
                                  </q-item-section>
                                  <q-item-section>附加文件</q-item-section>
                                </q-item>
                              </template>
                              <template
                                v-if="
                                  calc_auth(
                                    `${
                                      authBase.of === 'card'
                                        ? 'card'
                                        : 'card_todo'
                                    }`,
                                    'delete',
                                    authBase.of
                                  ) || isCreator
                                "
                              >
                                <q-separator spaced class="op-3" />
                                <q-item
                                  clickable
                                  v-ripple
                                  class="radius-xs"
                                  @click.stop="deleteTodoFn(i, element)"
                                >
                                  <q-item-section side class="q-pr-sm">
                                    <q-icon size="xs" name="close" />
                                  </q-item-section>
                                  <q-item-section>删除</q-item-section>
                                </q-item>
                              </template>
                            </q-list>
                          </q-menu>
                          <!-- 更新 Todo 菜单结束 -->
                        </q-btn>
                      </div>
                      <template v-if="element.attachment?.length > 0">
                        <div
                          class="row no-wrap gap-xs items-center q-pl-lg q-ml-md"
                        >
                          <q-btn
                            color="orange"
                            icon="attachment"
                            dense
                            rounded
                            size="xs"
                            padding="xs sm"
                            flat
                            :label="element.attachment?.length"
                          >
                            <q-popup-proxy
                              class="radius-sm"
                              ref="attachmentPopup"
                            >
                              <FileList
                                :todo="element"
                                :todogroup="i"
                                @removeFile="removeFile"
                                @click="clickAttachmentItem()"
                              />
                            </q-popup-proxy>
                          </q-btn>
                          <q-btn
                            v-if="
                              calc_auth(
                                `${
                                  authBase.of === 'card' ? 'card' : 'card_todo'
                                }`,
                                'content',
                                authBase.of
                              ) || isCreator
                            "
                            color="orange"
                            icon="add"
                            dense
                            round
                            size="xs"
                            flat
                            @click.stop="addAttachment(i, element)"
                          >
                          </q-btn>
                        </div>
                      </template>
                      <q-popup-proxy
                        v-if="
                          calc_auth(
                            `${authBase.of === 'card' ? 'card' : 'card_todo'}`,
                            'content',
                            authBase.of
                          ) ||
                          calc_auth(
                            `${authBase.of === 'card' ? 'card' : 'card_todo'}`,
                            'delete',
                            authBase.of
                          ) ||
                          isCreator
                        "
                        context-menu
                      >
                        <q-list bordered dense class="radius-sm q-pa-xs">
                          <template
                            v-if="
                              calc_auth(
                                `${
                                  authBase.of === 'card' ? 'card' : 'card_todo'
                                }`,
                                'content',
                                authBase.of
                              ) || isCreator
                            "
                          >
                            <q-item>
                              <q-item-section>
                                <div class="row no-wrap items-center gap-sm">
                                  <q-icon
                                    v-for="marker in colorMarks"
                                    :key="marker"
                                    dense
                                    :size="
                                      element.color_marker === marker
                                        ? '18px'
                                        : '12px'
                                    "
                                    flat
                                    round
                                    padding="none"
                                    :color="marker"
                                    :name="
                                      element.color_marker === marker
                                        ? 'mdi-checkbox-marked-circle'
                                        : 'mdi-checkbox-blank-circle'
                                    "
                                    class="cursor-pointer"
                                    @click="
                                      updateTodoColorMarker(i, element, marker)
                                    "
                                  />
                                </div>
                              </q-item-section>
                            </q-item>
                            <q-separator spaced class="op-3" />
                            <q-item
                              clickable
                              v-ripple
                              class="radius-xs"
                              @click.stop="addAttachment(i, element)"
                            >
                              <q-item-section side class="q-pr-sm">
                                <q-icon size="xs" name="attachment" />
                              </q-item-section>
                              <q-item-section>附加文件</q-item-section>
                            </q-item>
                          </template>
                          <template
                            v-if="
                              calc_auth(
                                `${
                                  authBase.of === 'card' ? 'card' : 'card_todo'
                                }`,
                                'delete',
                                authBase.of
                              ) || isCreator
                            "
                          >
                            <q-separator spaced class="op-3" />
                            <q-item
                              clickable
                              v-ripple
                              class="radius-xs"
                              @click.stop="deleteTodoFn(i, element)"
                            >
                              <q-item-section side class="q-pr-sm">
                                <q-icon size="xs" name="close" />
                              </q-item-section>
                              <q-item-section>删除</q-item-section>
                            </q-item>
                          </template>
                        </q-list>
                      </q-popup-proxy>
                    </div>
                  </template>
                  <template
                    v-if="
                      calc_auth(
                        `${authBase.of === 'card' ? 'card' : 'card_todo'}`,
                        'create',
                        authBase.of
                      ) || isCreator
                    "
                    #footer
                  >
                    <div
                      class="row no-wrap gap-xs items-start q-pr-sm todo_in_card relative-position hovered-item border-placeholder"
                      style="order: 999"
                      @blur="todo_add_ing = false"
                    >
                      <div class="op-0">
                        <q-icon name="drag_indicator" class="dragBar" />
                      </div>
                      <template v-if="todo_add_ing != i.id">
                        <div
                          class="row items-center q-space cursor-pointer"
                          @click="todo_add_ing = i.id"
                        >
                          <q-icon
                            name="add"
                            size="15px"
                            class="cursor-pointer q-pt-xs"
                          />
                          <q-space />
                        </div>
                      </template>
                      <q-checkbox
                        v-else
                        v-model="todo_params.data.status"
                        size="xs"
                        dense
                        class="q-pt-xs"
                        :disable="!todo_params.data.content"
                        @update:model-value="statusChange(i, element)"
                      >
                      </q-checkbox>
                      <ClasslessInput
                        v-if="todo_add_ing === i.id"
                        v-model="todo_params.data.content"
                        :auth="
                          calc_auth(
                            `${authBase.of === 'card' ? 'card' : 'card_todo'}`,
                            'create',
                            authBase.of
                          ) || isCreator
                        "
                        :baseClass="`q-space q-px-xs border-bottom`"
                        :autofocus="true"
                        @update="createTodoFn(i)"
                        @ctrlEnter="ctrlEnter"
                        @cannel="todo_add_ing = false"
                      ></ClasslessInput>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </template>
        </draggable>
      </template>
      <template
        v-if="
          calc_auth(authBase.collection, 'create', authBase.of) || isCreator
        "
      >
        <div v-if="createTodogroup_ing" class="q-px-sm">
          <div class="full-width q-pa-xs">
            <q-input
              v-model="params.data.name"
              dense
              square
              autofocus
              type="text"
              placeholder="待办分组名称"
              @keyup.esc="createTodogroup_ing = false"
              @keyup.ctrl.enter="createTodogroupFn()"
              ref="add_todogroup"
              @click="focus_add_todogroup"
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
        <div
          v-if="!createTodogroup_ing && todogroups?.length === 0"
          class="absolute-full column flex-center"
        >
          <div class="fit column flex-center">
            <div class="column no-wrap">
              <q-btn
                flat
                icon="add"
                label="新建清单分组"
                class="border"
                @click="(params.data.name = ''), (createTodogroup_ing = true)"
              />
            </div>
          </div>
          <q-space />
        </div>
      </template>
    </template>
    <q-dialog v-model="add_attachment_dialog" persistent>
      <q-card bordered style="min-width: 360px">
        <q-card-section class="q-pa-xs">
          <StrapiUpload
            :bordered="false"
            :label="`附加文件`"
            class="no-padding fit"
            color="transparent"
            accept=".jpg,.png,.mp4,.mov,.m4v,.jpeg,.png,.webp,.svg,.avi,.pdf,.ppt,.pptx,.doc,.docx"
            @uploaded="attachFile"
          ></StrapiUpload>
        </q-card-section>
        <q-card-actions align="left" class="q-pa-xs border-top">
          <q-btn flat label="取消" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, toRef, toRefs, watchEffect, watch, computed } from "vue";
import {
  createTodogroup,
  updateTodogroup,
  deleteTodogroup,
  createTodo,
  updateTodo,
  deleteTodo,
} from "src/api/strapi/project.js";
import { updateUserTodogroups } from "src/api/strapi.js";
import draggable from "vuedraggable";
import ClasslessInput from "src/components/Utilits/ClasslessInput.vue";
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import FileList from "src/components/Utilits/FileList.vue";

import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { useQuasar } from "quasar";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
import PersonTip from "./tips/PersonTip.vue";
import ProjectTip from "./tips/ProjectTip.vue";
const { userId, me } = useMatedate;

const $q = useQuasar();
const projectStore = useProjectStore();
const userStore = useUserStore();

const props = defineProps({
  kanban_id: {
    type: Number,
    default: NaN,
  },
  attach_to: {
    type: Number,
    default: -1,
  },
  belong_to: {
    type: Object,
    default() {
      return {};
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
      return {};
    },
  },
});

const { kanban_id, attach_to, belong_to, isCreator, isPrivate, uiOptions } =
  toRefs(props);

const authBase = computed(() => {
  let res;
  let isInCard;
  if (projectStore.card) {
    const members = projectStore.card.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
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
  return res;
});

const hidecompletedTodo = (i) => {
  return (
    uiOptions.value?.find((i) => i.val === "hidecompletedTodo").enable &&
    i.status
  );
};
const moveTarget = ref();
const createTodogroup_ing = ref(false);
const params = ref({
  attach_to: attach_to.value,
  data: {
    name: "",
  },
});
const emit = defineEmits([
  "todoUpdate",
  "todogroupSort",
  "todogroupUpdate",
  "deleteTodogroup",
  "createTodogroup",
  "todoCreated",
  "todoSort",
  "todoitemUpdate",
  "disableAction",
]);
const todogroups = ref();
watchEffect(() => {
  if (attach_to.value === -1) {
    let ___ = projectStore.init?.todogroups;
    todogroups.value = kanban_id.value
      ? ___?.filter((i) => i.kanban?.id == kanban_id.value) || []
      : ___;
  } else {
    todogroups.value = belong_to.value.todogroups || [];
  }
});
const attachmentPopup = ref();
const clickAttachmentItem = () => {
  attachmentPopup.value.hide();
};
const loading = ref(false);
const createTodogroupFn = async () => {
  if (loading.value) return;
  loading.value = true;
  if (!params.value.data.name) {
    createTodogroup_ing.value = false;
    return;
  }
  if (kanban_id.value) {
    params.value.data.kanban = kanban_id.value;
  }
  if (attach_to.value === -2) {
    params.value.project_id = belong_to.value.id;
  }
  if (attach_to.value === -3) {
    params.value.card_id = belong_to.value.id;
  }
  let res = await createTodogroup(params.value);
  if (res?.data) {
    if (attach_to.value === -1) {
      projectStore.init.todogroups.push(res.data);
    }
    if (attach_to.value === -2 || attach_to.value === -3) {
      // todogroups.value.push(res.data);
      emit("createTodogroup", res.data);
    }
    params.value.data.name = "";
    createTodogroup_ing.value = false;
    loading.value = false;
  }
};

const toggle_updateTodogroup = (i) => {
  updateTodogroup_target.value = i.id;
  params.value.data.name = i.name;
};
const updateTodogroup_target = ref();
const updateTodogroupFn = async (i) => {
  if (!params.value.data.name) return;
  if (kanban_id.value) {
    params.value.data.kanban = kanban_id.value;
  }
  if (attach_to.value === -2) {
    params.value.project_id = belong_to.value.id;
  }
  if (attach_to.value === -3) {
    params.value.card_id = belong_to.value.id;
  }
  let res = await updateTodogroup(i.id, params.value);
  if (res) {
    if (attach_to.value === -1) {
      Object.assign(i, res.data);
    } else {
      emit("todogroupUpdate", todogroups.value, res.data);
    }
    updateTodogroup_target.value = null;
    params.value.data.name = "";
  }
};
const dragTodo_sort = async (i) => {
  let sort = i.todos.map((i) => i.id);
  let params = {
    attach_to: attach_to.value,
    data: {
      todos: sort,
    },
  };
  if (attach_to.value === -2) {
    params.project_id = belong_to.value.id;
  }
  if (attach_to.value === -3) {
    params.card_id = belong_to.value.id;
  }
  // console.log(params);
  let res = await updateTodogroup(i.id, params);
  if (res?.data) {
    // Object.assign(i, res.data);
    emit("todoSort", res.data, sort);
  }
};
const dragTodogroup_sort = async (i) => {
  dragging.value = false;
  let params;
  if (attach_to.value === -1) {
    params = {
      data: {
        todogroups: todogroups.value.map((i) => i.id),
      },
    };
    let res = await updateUserTodogroups(userStore.userId, params);
    if (res) {
      // Object.assign(i, res.data);
    }
  }
  if (attach_to.value === -2) {
    emit("todoUpdate", todogroups.value);
  }
  if (attach_to.value === -3) {
    // emit('todoUpdate',todogroups.value)
    emit("todogroupSort", todogroups.value);
  }
};
const rf_deleteTodogroup = ref(false);
const rf_deleteTodogroupFn = (i) => {
  rf_deleteTodogroup.value = true;
  deleteTodogroupFn(i);
};
const deleteTodogroupFn = async (i) => {
  if (i.todos?.length > 0 && !rf_deleteTodogroup.value) {
    $q.notify({
      message: "分组内包含待办事项，请使用强制删除或清空内部待办后再删除",
      color: "red",
    });
    return;
  } else {
    let res;
    if (attach_to.value === -1) {
      res = await deleteTodogroup(i.id, -1);
      function isSameId(element) {
        return element.id == i.id;
      }
      if (res) {
        var index = projectStore.init.todogroups.findIndex(isSameId);
        if (index != -1) {
          projectStore.init.todogroups.splice(index, 1);
        }
      }
    }
    if (attach_to.value === -2) {
      res = await deleteTodogroup(i.id, -2, belong_to.value.id);
    }
    if (attach_to.value === -3) {
      res = await deleteTodogroup(i.id, -3, false, belong_to.value.id);
    }
    if (res && !res.error) {
      // todogroups.value = todogroups.value.filter(g => g.id != i.id)
      emit("deleteTodogroup", todogroups.value, i);
      rf_deleteTodogroup.value = false;
    }
  }
};

const todo_params = ref({
  data: {
    content: "",
    status: false,
  },
});
const todo_add_ing = ref(false);
const createTodoFn = async (i, attach) => {
  if (attach != "keepCreate") {
    todo_add_ing.value = false;
  }

  // todo_params.value 坑能有脏数据，这里不重置，直接赋值
  let create_params = {
    data: {},
  };
  if (!todo_params.value.data.content) {
    todo_add_ing.value = false;
    return;
  }
  if (attach_to.value === -2) {
    create_params.project_id = belong_to.value.id;
  }
  if (attach_to.value === -3) {
    create_params.card_id = belong_to.value.id;
  }
  create_params.data.todogroup = i.id;
  create_params.data.content = todo_params.value.data.content;
  let res = await createTodo(create_params);
  if (res?.data) {
    todo_params.value.data.content = "";
    if (attach_to.value === -1) {
      i.todos.push(res.data); // todo 待验证
    } else {
      emit("todoCreated", i.id, res.data);
    }
  }
};

const ctrlEnter = async () => {
  todo_add_ing.value = true;
};
const oldVal = ref(null);
const focusOn = ref(null);
const onFocuson = (todo) => {
  oldVal.value = todo.content;
  focusOn.value = todo.id;
};

const updateTodoContent = (element) => {
  if (element.status) return;
  updateTodo_target.value = `todo_${element.id}`;
};

const updateTodoFn = async (i, todo) => {
  todo_params.value.data = todo;
  if (attach_to.value === -2) {
    todo_params.value.project_id = belong_to.value.id;
  }
  if (attach_to.value === -3) {
    todo_params.value.card_id = belong_to.value.id;
  }
  todo_params.value.todogroup = i.id;
  let res = await updateTodo(todo.id, todo_params.value);
  if (res.data) {
    // Object.assign(todo, res.data);
    focusOn.value = null;
    updateTodo_target.value = null;
    emit("todoitemUpdate", i.id, res.data);
    setTimeout(() => {
      // 延时重置，否则UI闪烁
      todo_params.value.data = {};
    }, 50);
    return res.data;
  }
};
const deleteTodoFn = async (i, todo) => {
  oldVal.value = null;
  let res;
  if (attach_to.value === -1) {
    res = await deleteTodo(todo.id, i.id);
    if (res) {
      const index = i.todos.indexOf(todo);
      if (index > -1) {
        i.todos.splice(index, 1);
      }
    }
  }
  if (attach_to.value === -2) {
    res = await deleteTodo(todo.id, i.id, belong_to.value.id);
    if (res) {
      emit("todoUpdate", todogroups.value);
    }
  }
  if (attach_to.value === -3) {
    res = await deleteTodo(todo.id, i.id, false, belong_to.value.id);
    if (res) {
      emit("todoDeleted", i.id, todo.id);
    }
  }
};

const statusChange = (i, todo) => {
  todo_params.value = {
    data: { status: todo.status },
  };
  updateTodoFn(i, todo);
};
const updateTodoColorMarker = (i, element, marker) => {
  let todo = element;
  todo.color_marker = marker;
  updateTodoFn(i, todo);
};

const add_attachment_dialog = ref(false);
const add_attachment_props = ref();
const addAttachment = (group, todo) => {
  add_attachment_dialog.value = true;
  add_attachment_props.value = {
    todogroup: group,
    todo: todo,
  };
};
const attachFile = async (files) => {
  // console.log(files);
  const fileIds = (files.length > 0 && files.map((i) => i.id)) || [];
  let { todogroup, todo } = add_attachment_props.value;
  todo.attachment = todo.attachment
    ? [...todo.attachment, ...fileIds]
    : fileIds;
  let res = await updateTodoFn(todogroup, todo);
  if (res) {
    console.log("res", res);
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

const _updateTodoFn = async (todogroup, todo) => {
  let res = await updateTodo(todo.id, todo_params.value);
  if (res.data) {
    // Object.assign(todo, res.data);
    focusOn.value = null;
    updateTodo_target.value = null;
    emit("todoitemUpdate", i.id, res.data);
    setTimeout(() => {
      // 延时重置，否则UI闪烁
      todo_params.value.data = {};
    }, 50);
    return res.data;
  }
};
const removeFile = async (todogroup, todo, file_id) => {
  const todo_attachments = todo.attachment?.filter((i) => i.id != file_id);
  const attachmentsList =
    todo_attachments?.length > 0 ? todo_attachments.map((i) => i.id) : [];

  todo.attachment = attachmentsList;

  console.log(todo, file_id, todo_params.value);
  let res = await updateTodoFn(todogroup, todo);
  if (res) {
    console.log("res", res);
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

const hoverOn = ref(null);
const updateTodo_target = ref();
const dragging = ref(false);
const todoDragging = ref(false);

const add_todo = ref();
const focus_add_todo = () => {
  add_todo.value.focus();
};
const add_todogroup = ref();
const focus_add_todogroup = () => {
  add_todogroup.value.focus();
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
</script>

<style lang="scss">
.todo_in_card textarea {
  min-height: 24px !important;
  line-height: 24px !important;
  padding-top: 0px !important;
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
