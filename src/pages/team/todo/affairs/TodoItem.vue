<template>
  <div v-if="todo" data-no-dragscroll class="hovered-item relative-position q-px-xs radius-xs row no-wrap items-start gap-xs dragBar todo-item"
    :class="`
        ${$q.dark.mode ? 'bg-grey-9' : 'bg-white'}
        ${todo.status ? 'op-3' : ''}
        ${isFocused ? 'border-info border-solid border-xs' : ''}
    `"
  >
    <q-checkbox v-model="todo.status" dense class="q-mt-xs" />
    <div class="column no-wrap gap-xs q-space">
        <InputDiv
            v-model="todo.content"
            :auth="card ? useAuths('create', authCollections) : uiStore.app === 'affairs'"
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
            @update="updateTodoFn(i, null)"
            @ctrlEnter="updateTodoFn(i, null)"
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
    <div class="absolute-right q-pa-xs undrag hover-show transition">
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
    <div
        class="absolute-left full-height z-fab"
        :class="`${edgeStyle.highlight ? 'highlight transition' : ''}`"
        :style="`${edgeStyle.style}`"
    ></div>
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
import { ref, toRefs, toRaw, computed } from 'vue'
import InputDiv from 'src/components/Utilits/InputDiv.vue'
import { uiStore } from 'src/hooks/global/useStore';
import {deleteTodo, updateTodo} from "src/api/strapi/project.js";
import TodoMenu from './TodoMenu.vue'
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import FileList from "src/components/Utilits/FileList.vue";
import { clac_cardEdgeStyle } from "src/hooks/team/useCard.js";
import { authCollections } from "./useAffairs.js";

const props = defineProps({
    group: {
        type: Object,
        required: true
    },
    todo: {
        type: Object,
        required: true
    },
    card: {
        type: Object,
        required: true
    },
});
const emit = defineEmits(['todoDeleted']);
const { group, todo, card } = toRefs(props);
const _todo = toRaw(todo.value);

const { style, highlight } = clac_cardEdgeStyle(todo.value);
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
    Object.assign(todo.value, res.data);
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
</script>

<style scoped>
.todo-item {
    border: 1px solid rgba(255, 0, 0, 0);
}
.todo-item:hover {
    border: 1px solid rgb(201, 201, 201);
}
.highlight {
  width: 5px;
}
.todo-item:hover .highlight {
  width: 2px;
}
</style>