<template>
  <div v-if="todo" data-no-dragscroll
    class="hovered-item relative-position q-px-xs radius-xs row no-wrap items-start gap-xs dragBar todo-item"
    :class="`
        ${dense ? '' : $q.dark.mode ? 'bg-grey-9' : 'bg-white'}
        ${todo.status ? 'op-3' : ''}
        ${isFocused ? 'border-info border-solid border-xs' : ''}
    `"
  >
    <q-checkbox v-model="todo.status" dense class="q-mt-xs" @update:model-value="updateTodoFn()"
      @mouseover="emit('hoveredBtn', true)" @mouseleave="emit('hoveredBtn', false)"
    />
    <div class="column no-wrap gap-xs q-space">
        <InputDiv
            v-model="todo.content"
            :auth="card ? useAuths('content', authCollections) : uiStore.app === 'affairs'"
            :baseClass="`q-space q-pa-xs`"
            :autofocus="false"
            class="undrag"
            :class="`
                ${todo.status ? 'text-grey-5' : ''}
                ${
                    todo?.color_marker !== 'clear'
                    ? `text-${todo.color_marker}`
                    : ''
                }
            `"
            @update="updateTodoFn()"
            @ctrlEnter="updateTodoFn()"
            @ESC="cancelUpdateTodo"
            @onFocus="onFocus"
            @onBlur="onBlur"
        />
        <template v-if="todo.attachment?.length > 0">
            <div class="row no-wrap gap-xs items-center">
                <q-btn
                    color="orange"
                    icon="attachment"
                    dense
                    rounded
                    size="xs"
                    padding="xs sm"
                    flat
                    :label="todo.attachment?.length"
                >
                <q-popup-proxy
                    class="radius-sm"
                    ref="attachmentPopup"
                >
                    <FileList
                        :list="todo.attachment"
                        @removeFile="removeFile"
                    />
                </q-popup-proxy>
                </q-btn>
            </div>
        </template>
    </div>
    <div class="absolute-right q-pa-xs undrag todo-menu-btn transition"
      @mouseover="emit('hoveredBtn', true)" @mouseleave="emit('hoveredBtn', false)"
    >
        <q-btn flat dense size="sm" round icon="mdi-dots-vertical" >
            <q-menu class="radius-sm shadow-24">
                <TodoMenu
                    :todo="todo"
                    @deleteTodo="deleteTodoFn"
                    @updateTodoColorMarker="updateTodoColorMarker"
                    @addAttachment="addAttachment"
                />
            </q-menu>
        </q-btn>
    </div>
    <!-- 重要度、紧急度 左边框颜色标记 -->
    <div class="absolute-left full-height z-fab">
      <div :class="`${edgeStyle.highlight ? 'edge-highlight transition q-mt-xs' : ''}`" :style="`${edgeStyle.style}`">
        <q-tooltip class="radius-sm no-padding">
          <q-list bordered dense class="radius-sm" :class="$q.dark.mode ? 'bg-black text-white' : 'bg-grey-1 text-black'">
            <q-item>
              <q-item-section side>重要度：</q-item-section>
              <q-item-section>{{ todo.importance }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section side>紧急度：</q-item-section>
              <q-item-section>{{ todo.urgency }}</q-item-section>
            </q-item>
          </q-list>
        </q-tooltip>
      </div>
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
  </div>
</template>

<script setup>
import { ref, toRefs, toRaw, computed, watch } from 'vue'
import InputDiv from 'src/components/Utilits/InputDiv.vue'
import { uiStore, mm_wsStore } from 'src/hooks/global/useStore';
import {deleteTodo, updateTodo} from "src/api/strapi/project.js";
import TodoMenu from './TodoMenu.vue'
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import FileList from "src/components/Utilits/FileList.vue";
import { clac_cardEdgeStyle } from "src/hooks/team/useCard.js";
import { authCollections } from "./useAffairs.js";

const props = defineProps({
    group: {
        type: Object
    },
    todo: {
        type: Object
    },
    card: {
        type: Object
    },
    displayType: {
        type: String,
        default: 'todo'
    },
    dense: {
        type: Boolean
    }
});
const emit = defineEmits(['todoDeleted', 'hoveredBtn']);
const { group, todo, card } = toRefs(props);
const _todo = toRaw(todo.value);

const edgeStyle = computed(() => clac_cardEdgeStyle(todo.value));

const cancelUpdateTodo = () => {
    todo.value.content = _todo.content;
}
const updating = ref(false);
const todo_params = ref({
  data: {
    content: todo.value?.content,
    status: false,
  },
  props: {}
});
const updateTodoFn = async () => {
  if(updating.value) return;
  updating.value = true;
  todo_params.value.data = todo.value;
  let res = await updateTodo(todo.value?.id, todo_params.value);
  updating.value = false;
  if (res?.data) {
    todo.value = res.data;
    setTimeout(() => {
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
const updateTodoColorMarker = (color) => {
    todo.value.color_marker = color;
    updateTodoFn();
}
const add_attachment_dialog = ref(false);
const add_attachment_props = ref();
const addAttachment = () => {
  add_attachment_dialog.value = true;
  add_attachment_props.value = {
    todogroup: group.value,
    todo: todo.value,
  };
};
const attachFile = async (files) => {
    console.log(files);
    const fileIds = (files.length > 0 && files.map((i) => i.id)) || [];
    const exitsIds = todo.value?.attachment?.map((i) => i.id);
    const newIds = exitsIds?.length > 0 ? [...fileIds, ...exitsIds] : fileIds;
    todo.value.attachment = newIds;
    console.log('todo.value',files);
    await updateTodoFn();
    todo_params.value.data = {
        content: todo.value?.content,
        status: false,
    };
    setTimeout(() => {
        add_attachment_dialog.value = false;
    }, 50);
};
const removeFile = async (file_id) => {
    todo.value.attachment = todo.value.attachment?.filter(
        (i) => i.id !== file_id
    );
};

const isFocused = ref(false);
const onFocus = () => {
    isFocused.value = true;
}
const onBlur = () => {
    isFocused.value = false;
}

const deleteTodoFn = async () => {
  let res = await deleteTodo(todo.value?.id);
  if (res?.data) {
    emit("todoDeleted", todo.value?.id);
  }
}

watch(mm_wsStore, () => {
  if (mm_wsStore.event && mm_wsStore.event.event === "thread_updated") {
    const _thread = JSON.parse(mm_wsStore.event.data.thread);
    if (_thread.id === todo.value?.mm_thread?.id) {
      todo.value.mm_thread = _thread;
    }
  }
},{ immediate: true, deep: true });
</script>

<style scoped>
.todo-item {
    border: 1px solid rgba(255, 0, 0, 0);
}
.todo-item:hover {
    border: 1px solid rgb(201, 201, 201);
}
.todo-item .todo-menu-btn {
  opacity: 0;
}
.todo-item:hover .todo-menu-btn {
  opacity: 1;
}
.edge-highlight {
  width: 5px;
  height: 20px;
  border-radius: 5px;
  transform: translateX(-3px);
}
.todo-item:hover .edge-highlight {
  width: 3px;
  transform: translateX(-6px);
}
</style>