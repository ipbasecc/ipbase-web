<template>
  <div
    v-if="element"
    class="dragItem column no-wrap"
    :class="`
      ${active ? 'border-info radius-xs border-solid border-xs' : 'border-placeholder'}
      ${todo_add_ing ? '' : 'hovered-item'}
      ${element.mm_thread && teamStore.thread?.id === element.mm_thread?.id ? 'border-green radius-xs' : ''}
    `"
  >
    <div
      class="column no-wrap hovered-item radius-xs relative-position"
      :class="
        inCard
          ? 'hover-border'
          : `
            ${displayType === 'todo' ? $q.dark.mode ? 'bg-darker' : 'bg-grey-3' : ''}
            ${ element.status ? 'op-5' : '' }
            ${displayType === 'note' ? 'q-pa-sm' : 'q-px-xs'}
          border`
      "
    >
      <div
        class="row no-wrap gap-xs items-start q-px-xs radius-xs todo_in_card relative-position dragBar"
        @mouseenter="hoverOn = `todo_${element.id}`"
        @mouseleave="hoverOn = null"
      >
        <span v-if="displayType === 'todo'" :style="`height: ${autoSize}px`" class="flex flex-center">
          <q-checkbox
            v-model="element.status"
            :size="`${autoSize}px`"
            dense
            :disable="
              (inCard &&
                !useAuths('status', ['card_todo', 'todo'])) ||
              uiStore.isShared
            "
            :color="teamStore.thread?.id === element.mm_thread?.id ? 'white' : ''"
            @update:model-value="statusChange(element)"
          >
          </q-checkbox>
        </span>
        <div class="column no-wrap q-space" :style="$q.screen.gt.xs ? '' : 'line-height: 32px;'">
          <div
            class="column no-wrap undrag"
            :class="`
                ${element.status ? 'op-3 line-through' : ''}
                ${
                  element?.color_marker !== 'clear' && displayType === 'todo'
                    ? `text-${element.color_marker}`
                    : ''
                }
            `"
          >
            <template
              v-if="
                !inCard ||
                ((useAuths('content', ['card_todo', 'todo']) ||
                  isCreator) &&
                  (!uiStore.edittingTodo ||
                    uiStore.edittingTodo === element.id))
              "
            >
              <TodoInput
                :content="element.content"
                :auth="true"
                :autofocus="false"
                :todo="element"
                class="undrag"
                @onBlur="onBlur"
                @onFocus="onFocus"
                @ctrlEnter="updateContent"
                @cannel="cancelEdit"
              />
            </template>
            <span v-else class="q-pa-xs">{{ element.content }}</span>
          </div>
          <template v-if="element.attachment?.length > 0 || element.mm_thread">
            <div class="row no-wrap gap-xs items-center">
              <template v-if="element.mm_thread && !uiStore.isShared">
                <ThreadBtn
                  :thread="element.mm_thread"
                  @enterThread="enterThread"
                />
              </template>
              <template v-if="element.attachment?.length > 0">
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
                    @hide="afterAttachmentPopuClose()"
                  >
                    <FileList
                      :list="element.attachment"
                      @removeFile="removeFile"
                    />
                  </q-popup-proxy>
                </q-btn>
                <q-btn
                  v-if="
                    !inCard ||
                    useAuths('content',['card_todo', 'todo']) ||
                    isCreator
                  "
                  color="orange"
                  icon="add"
                  dense
                  round
                  size="xs"
                  flat
                  @click.stop="addAttachment(todogroup, element)"
                >
                </q-btn>
              </template>
            </div>
          </template>
        </div>
        <span
          :style="`height: ${autoSize}px`"
          class="flex flex-center"
          @mouseenter="hideAddTodo"
          @mouseleave="showAddTodo"
        >
          <q-btn
            v-if="element.fingerprint ||
              !inCard ||
              useAuths('content', ['card_todo', 'todo']) ||
              useAuths('delete', ['card_todo', 'todo']) ||
              isCreator
            "
            round
            dense
            flat
            size="sm"
            icon="more_vert"
            class="hover-show transition"
          >
            <!-- 更新 _todo 菜单 -->
            <q-menu class="radius-sm">
              <TodoMenu
                :element
                :todogroup
                :isCreator
                :isFeedbackOwner="element.fingerprint === window?.fingerprint"
                :inCard
                @updateTodoColorMarker="updateTodoColorMarker"
                @addAttachment="addAttachment"
                @deleteTodoFn="deleteTodoFn"
              />
            </q-menu>
            <!-- 更新 _todo 菜单结束 -->
          </q-btn>
        </span>
      </div>

      <div
        v-if="active && !$q.screen.gt.xs"
        class="row no-wrap items-center q-py-xs border-top"
      >
        <q-btn
          flat
          no-caps
          dense
          :label="$t('cancel')"
          padding="xs sm"
          @click.stop="cancelEdit"
        />
        <q-space />
        <q-btn
          dense
          no-caps
          color="primary"
          :label="$t('confirm')"
          padding="xs sm"
          @click="updateContent"
        />
      </div>
      <div v-if="displayType === 'note'"
        :class="displayType === 'note' ? `bg-${element.color_marker}` : ''"
        class="absolute-full z-unfab op-1"
      >
      </div>
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
      <q-inner-loading :showing="updating" color="primary">
        <q-spinner-dots
          color="primary"
          size="1em"
        />
      </q-inner-loading>
    </div>
    <slot />
    <q-popup-proxy context-menu>
      <TodoMenu
        :element
        :todogroup
        :isCreator
        :inCard
        @updateTodoColorMarker="updateTodoColorMarker"
        @addAttachment="addAttachment"
        @deleteTodoFn="deleteTodoFn"
      />
    </q-popup-proxy>
  </div>
</template>

<script setup>
import {computed, ref, toRefs, watch} from "vue";
import {createTodo, deleteTodo, updateTodo} from "src/api/strapi/project.js";
import ThreadBtn from "src/pages/team/components/widgets/ThreadBtn.vue";
import FileList from "src/components/Utilits/FileList.vue";
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import TodoInput from "./TodoInput.vue";
import TodoMenu from "./TodoMenu.vue";

import {mm_wsStore, teamStore, uiStore} from "src/hooks/global/useStore.js";
import {todoDeleted} from "src/hooks/team/useCard.js";

import {useQuasar} from 'quasar'

const props = defineProps({
  uiOptions: {
    type: Object,
    default() {
      return null;
    },
  },
  card: {
    type: Object,
    default() {
      return null;
    },
  },
  element: {
    type: Object,
    default() {
      return null;
    },
  },
  todogroup: {
    type: Object,
    default() {
      return null;
    },
  },
  authBase: {
    type: Object,
    default() {
      return null;
    },
  },
  byInfo: {
    type: Object,
    default() {
      return null;
    },
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  inCard: {
    type: Boolean,
    default: true,
  },
  isFeedback: {
    type: Boolean,
    default: true,
  },
  displayType: {
    type: String,
    default: 'todo',
  },
});
const emit = defineEmits([
  "todoUpdate",
  "todoSort",
  "todoDeleted",
  "editing",
  "unediting",
  "hideAddTodo",
  "showAddTodo",
]);
const $q = useQuasar();
const autoSize = $q.screen.gt.xs ? 30 : 40

const {
  uiOptions,
  element,
  todogroup,
  authBase,
  byInfo,
  isCreator,
  inCard,
  card,
  isFeedback
} = toRefs(props);
const authBaseOf = computed(() =>
  authBase.value?.of === "card" ? "todo" : "card_todo"
);
const active = ref(false);
watch(active, () => {
  if (active.value) {
    uiStore.disable_shortcut = true
    emit("editing");
  } else {
    uiStore.disable_shortcut = false
    emit("unediting");
    setTimeout(() => {
      set_edittingTodo(void 0);
    }, 30);
  }
});
const onFocus = () => {
  active.value = true;
  set_edittingTodo(element.value?.id);
};
const cancelEdit = () => {
  active.value = void 0;
  set_edittingTodo(void 0);
};
const set_edittingTodo = (_id) => {
  uiStore.edittingTodo = _id;
};
const todo_params = ref({
  data: {
    content: "",
    status: false,
  },
  props: {}
});
const hoverOn = ref(null);

const onBlur = (content) => {
  active.value = false;
  if (element.value.content !== content) {
    updateContent(content);
  }
};
const updateContent = (content) => {
  let _todo = element.value;
  _todo.content = content;
  updateTodoFn(_todo);
  set_edittingTodo(void 0);
};

const statusChange = async (todo) => {  
  await updateTodoFn({ id: todo.id, status: todo.status });
};
const updating = ref(false);
const updateTodoFn = async (todo) => {
  updating.value = true;

  todo_params.value.data = todo;
  if (card.value) {
    todo_params.value.props = {
      card_id: card.value.id
    };
  }
  if(isFeedback.value){
    todo_params.value.props = {
      fingerprint: window?.fingerprint
    };
  }
  let res = await updateTodo(todo.id, todo_params.value);
  updating.value = false;
  if (res?.data) {
    if (card.value || teamStore.card) {
      const _card = card.value || teamStore.card;
    }
    setTimeout(() => {
      // 延时重置，否则UI闪烁
      todo_params.value = {
        data: {
          content: "",
          status: false,
        },
      };
    }, 50);
    return res.data;
  }
};
const updateTodoColorMarker = (element, marker) => {
  let todo = element;
  todo.color_marker = marker;
  updateTodoFn(todo);
};
const updateTodoThread = async (_todo, _thread) => {
  const params = {
    data: { mm_thread: _thread },
  };
  await updateTodo(_todo.id, params);
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
const attachmentPopup = ref();
const clickAttachmentItem = () => {
  attachmentPopup.value?.hide();
};

const oldVal = ref(null);
const deleteTodoFn = async (i, todo) => {
  oldVal.value = null;
  let props = {}
  if(uiStore.isShared){
    props.fingerprint = window?.fingerprint
  }
  let res = await deleteTodo(todo.id, props);
  if (res?.data) {    
    if (card.value || teamStore.card) {
      const _card = card.value || teamStore.card;
    }
    emit("todoDeleted", i.id, todo.id);
  }
};
const attachFile = async (files) => {
  // console.log(files);
  const fileIds = (files.length > 0 && files.map((i) => i.id)) || [];
  let { todo } = add_attachment_props.value;
  todo.attachment = todo.attachment
    ? [...todo.attachment, ...fileIds]
    : fileIds;
  let res = await updateTodoFn(todo);
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

// 删除附件时，在附件组件内完成数据更新后，此处不要立即更新，这会导致整个Card数据更新从而关闭附件列表，且会造成VUE组件卸载错误
// 因此在附件组件挂载时读取列表props后内部使用自有数据，在附件条目删除后先记录待删除数据，在附件菜单关闭后再执行后端数据操作
const pendingTodo = ref();
const removeFile = async (file_id) => {
  const todo_attachments = element.value.attachment?.filter(
    (i) => i.id !== file_id
  );
  let _todo = element.value;
  delete _todo.attachment;
  _todo.attachment =
    todo_attachments?.length > 0 ? todo_attachments.map((i) => i.id) : [];

  // console.log(todo, file_id, todo_params.value);
  pendingTodo.value = _todo;
};
const afterAttachmentPopuClose = async () => {
  if (!pendingTodo.value) return;
  await updateTodoFn(pendingTodo.value);
  pendingTodo.value = void 0;
};
const enterThread = (thread) => {
  // console.log("thread", thread);
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
const showAddTodo = () => {
  emit('showAddTodo')
}
const hideAddTodo = () => {
  emit('hideAddTodo')
}

const todo_add_ing = ref(void 0);
const todo_creating = ref(false);
const show_addTodo_ofGroup = ref(void 0);
const create_params = ref({
  todogroup_id: todogroup.value.id,
  before: void 0,
  data: {
    content: void 0,
    status: false
  }
});

const createAddTodo = (id) => {
  todo_add_ing.value = id
}
const syncContent = (val) => {
  console.log('syncContent', val)
  create_params.value.data.content = val
}
const createTodoFn = async (i, props) => {
  todo_creating.value = true;
  // console.log('window.fingerprint', window.fingerprint)
  if (teamStore.shareInfo) {
    create_params.value.shareInfo = teamStore.shareInfo;
    create_params.value.data.fingerprint = window.fingerprint;
  }
  create_params.value.before = i.id;
  console.log('create_params.value', create_params.value)
  if (!create_params.value?.data?.content || create_params.value?.data?.content === '') return
  let res = await createTodo(create_params);
  create_params.value.data.content = "";
  if (res?.data) {
    // backend send ws data but
    // always create at here, when get ws create event, check exits item, current user no need create
    const todoIndex = i.todos.findIndex(t => t.id === element.value?.id)
    i.todos = i.todos.splice(todoIndex + 1, 0, res?.data);
    // i.todos = [...i.todos, res.data];
    if(props === 'keepCreate'){
      todo_add_ing.value = res?.data.id
      await createTodoFn(res?.data)
    } else {
      cannelCreateTodo();
    }
  }
  return res?.data;
};
const cannelCreateTodo = () => {
  todo_creating.value = false;
  todo_add_ing.value = null
}

watch(
  mm_wsStore,
  () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "thread_updated") {
      const _thread = JSON.parse(mm_wsStore.event.data.thread);
      // console.log("message.event", message);
      if (_thread.id === element.value?.mm_thread?.id) {
        element.value.mm_thread = _thread;
        updateTodoThread(element.value, _thread);
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.auto-height textarea {
  height: auto !important;
}
</style>
