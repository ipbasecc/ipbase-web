<template>
  <div class="fit column no-wrap q-space" ref="tiptap">
    <template v-if="isEditable">
      <div
        v-if="show_toolbar && isEditable"
        class="full-width row no-wrap gap-xs items-center justify-start border-bottom q-py-xs q-px-sm"
        :class="`${square ? '' : 'radius-xs'}`"
        :style="`${
          toolbar_onBottom ? 'order: 9999' : ''
        } height: ${toolbarHeight}px`"
      >
        <slot name="left-btn"></slot>
        <template v-for="(i, index) in menu" :key="index">
          <q-separator
            v-if="i.type === '|' && i.always_show"
            spaced
            inset
            vertical
          />
          <q-btn
            v-else-if="
              i.type === 'Botton' &&
              i.always_show &&
              !i.disable &&
              !disable_btn.includes(i.label)
            "
            dense
            flat
            padding="xs"
            @click="i.handler"
          >
            <q-icon size="xs" v-if="i.icon" :name="i.icon" />
            <template v-else-if="i.label">{{ i.label }}</template>
            <template v-else
              ><q-icon size="xs" name="radio_button_checked"
            /></template>
          </q-btn>
          <q-btn
            v-else-if="i.type === 'menu' && i.always_show"
            dense
            flat
            padding="xs"
          >
            <q-icon size="xs" v-if="i.icon" :name="i.icon" />
            <template v-else-if="i.label">{{ i.label }}</template>
            <template v-else
              ><q-icon size="xs" name="radio_button_checked"
            /></template>
            <q-menu>
              <q-list dense style="max-width: 600px">
                <template v-for="(item, index) in i.children" :key="index">
                  <q-item clickable v-close-popup @click="item.handler">
                    <q-item-section
                      class="q-px-md"
                      :class="item.class ? item.class : ''"
                      >{{ item.label }}</q-item-section
                    >
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            v-else-if="i.type === 'set_color' && i.always_show"
            dense
            flat
            padding="xs"
          >
            <q-icon size="xs" v-if="i.icon" :name="i.icon" />
            <template v-else-if="i.label">{{ i.label }}</template>
            <template v-else
              ><q-icon size="xs" name="radio_button_checked"
            /></template>
            <q-popup-proxy>
              <q-card
                class="row gap-xs q-pa-sm border"
                style="max-width: 256px"
              >
                <template v-for="(item, index) in i.children" :key="index">
                  <div
                    class="cursor-pointer"
                    :style="`width: 1.3rem;height: 1.3rem;background-color: ${item.color};padding:1px`"
                    v-close-popup
                    @click="item.handler"
                  />
                </template>
                <div
                  class="col-12 font-small q-pa-xs cursor-pointer q-pt-sm"
                  @click="editor.chain().focus().unsetColor().run()"
                >
                  {{ $t('clean_color') }}
                </div>
              </q-card>
            </q-popup-proxy>
          </q-btn>
          <q-space v-else-if="i.type === 'space'" />
        </template>
        <slot name="more_btn"></slot>
      </div>
      <editor-content
        ref="dropZoneRef"
        class="q-space scroll-y fit"
        :class="styleClass ? styleClass : 'q-pa-md'"
        :editor="editor"
        :style="contentStyle"
      />
    </template>
    <div
      v-else
      class="tiptap"
      :class="`${hideScroll ? '' : 'scroll-y '} ${
        styleClass ? styleClass : 'q-pa-md'
      }`"
      :style="contentStyle"
      v-html="html"
    ></div>
    <slot name="attachments"></slot>
  </div>
</template>

<script setup>
import {
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  toRefs,
  watch,
  computed,
} from "vue";

import { Editor, EditorContent } from "@tiptap/vue-3";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";

import { Extension } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold,  } from '@tiptap/extension-bold'
import { BulletList,  } from '@tiptap/extension-bullet-list'
import { Code,  } from '@tiptap/extension-code'
import { CodeBlock,  } from '@tiptap/extension-code-block'
import { Document } from '@tiptap/extension-document'
import { Dropcursor,  } from '@tiptap/extension-dropcursor'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { HardBreak,  } from '@tiptap/extension-hard-break'
import { Heading,  } from '@tiptap/extension-heading'
import { History,  } from '@tiptap/extension-history'
import { HorizontalRule,  } from '@tiptap/extension-horizontal-rule'
import { Italic,  } from '@tiptap/extension-italic'
import { ListItem,  } from '@tiptap/extension-list-item'
import { OrderedList,  } from '@tiptap/extension-ordered-list'
import { Paragraph,  } from '@tiptap/extension-paragraph'
import { Strike,  } from '@tiptap/extension-strike'
import { Text } from '@tiptap/extension-text'



import "prismjs";
import "prismjs/themes/prism.css";
import { uiStore, userStore } from "src/hooks/global/useStore";
import { useFileDialog } from "@vueuse/core";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import { useDropZone } from "@vueuse/core";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show_toolbar: {
    type: Boolean,
    default: true,
  },
  toolbar_onBottom: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    default: "",
  },
  jsonContent: {
    type: Object,
    default() {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
          },
        ],
      };
    },
  },
  toolbarHeight: {
    type: Number,
    default: 43,
  },
  square: {
    type: Boolean,
    default: true,
  },
  need: {
    type: String,
    default: "html",
  },
  editable: {
    type: Boolean,
    default: true,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  styleClass: {
    type: String,
    default: null,
  },
  contentStyle: {
    type: String,
    default: "",
  },
  asDocument: {
    type: Boolean,
    default: false,
  },
  withSaveBtb: {
    type: Boolean,
    default: false,
  },
  withImageBtb: {
    type: Boolean,
    default: false,
  },
  withAttachBtb: {
    type: Boolean,
    default: false,
  },
  disable_btn: {
    type: Array,
    default() {
      return [];
    },
  },
  hideScroll: {
    type: Boolean,
    default: false,
  },
});

const contentRef = toRef(props, "content");
const jsonContentRef = toRef(props, "jsonContent");
const withSaveBtbRef = toRef(props, "withSaveBtb");
const { withImageBtb, withAttachBtb } = toRefs(props);
const isEditable = toRef(props, "editable");
const needRef = toRef(props, "need");
const { hideScroll } = toRefs(props);
const emit = defineEmits([
  "tiptapBlur",
  "tiptapSave",
  "tiptapClose",
  "tiptapUpdate",
  "tiptapChanged",
  "mmMsgChange",
  "ModEnter"
]);

const tiptap = ref(null);
const editor = ref();
const dropZoneRef = ref();

const tiptapContent = ref();
const cleanHtmlHandler = (val) => {
  return val.replace(/<[^>]*>?/gm, "");
};
const init = () => {
  const _HardBreak = HardBreak.extend({
    addKeyboardShortcuts() {
      return {
        // ↓ 禁用Ctrl + Enter,改为发送消息
        'Mod-Enter': () => {
          tiptapBlur();
          emit("ModEnter");
        },
      }
    },
  })

  editor.value = new Editor({
    content: tiptapContent.value,
    editable: isEditable.value,
    autofocus: props.autofocus,
    editorProps: {
      clipboardTextParser(text, $context) {
        // 在这里处理粘贴的文本
        // 例如，调用 cleanHtmlHandler 处理 HTML
        return cleanHtmlHandler(text);
      },
    },
    extensions: [
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
      Placeholder.configure({
        // Use a placeholder:
        placeholder: t('start_type_tip'),
      }),
      Markdown,
      Extension,
      Blockquote,
      Bold,
      BulletList,
      Code,
      CodeBlock,
      Document,
      Dropcursor,
      Gapcursor,
      _HardBreak,
      Heading,
      History,
      HorizontalRule,
      Italic,
      ListItem,
      OrderedList,
      Paragraph,
      Strike,
      Text
    ],
    // triggered on every change
    onUpdate: () => {
      tiptapUpdate();
      emit("tiptapChanged");
    },
    onBlur({ editor, event }) {
      tiptapBlur();
      uiStore.disable_shortcut = false;
    },
    onFocus({ editor, event }) {
      uiStore.disable_shortcut = true;
    },
  });
};

const sourceContent = ref();
const setSourceContent = () => {
  sourceContent.value = editor.value && editor.value.getJSON();
};
const addImage = (url) => {
  editor.value.commands.createParagraphNear();
  editor.value?.chain().focus().setImage({ src: url }).run();
  editor.value.commands.createParagraphNear();
};
const uploadFiles = () => {};
const { files, open, reset, onChange } = useFileDialog({
  accept: "image/*", // Set to accept only image files
  directory: false, // Select directories instead of files if set true
});

const me = computed(() => userStore.me);
const batchInserImage = async (_files) => {
  const res = await confirmUpload(_files, me.value);
  if (res) {
    const urls = res.map((i) => i.attributes.url);
    urls.forEach((url) => {
      addImage(url);
    });
  }
};
onChange(async (files) => {
  await batchInserImage(files);
});

async function onDrop(files) {
  await batchInserImage(files);
}
const { isOverDropZone } = useDropZone(tiptap, {
  onDrop,
  // specify the types of data to be received.
  dataTypes: ["image/*"],
});

const setCursorToEnd = () => {
  editor.value?.commands.focus("end");
};
onMounted(() => {
  setCursorToEnd();
});

onBeforeMount(() => {
  setSourceContent();
  init();
});

const clear = () => {
  editor.value.commands.clearContent();
};

defineExpose({ clear });

watch(
  [jsonContentRef, contentRef],
  () => {
    if (jsonContentRef.value || contentRef.value) {
      editor.value && editor.value.destroy();
      tiptapContent.value =
        props.need === "json" ? jsonContentRef.value : contentRef.value;
      init();
    }
  },
  { immediate: true, deep: false }
);

const md = computed(() => editor.value?.storage?.markdown?.getMarkdown());
const json = computed(() => editor.value && editor.value.getJSON());
const html = computed(() => editor.value && editor.value.getHTML());

const tiptapBlur = () => {
  
  emit("tiptapClose", html.value);
  const cur = JSON.stringify(json.value);
  const prv = JSON.stringify(tiptapContent.value);
  if (cur === prv) return;
  if (needRef.value === "html") {
    emit("tiptapBlur", html.value);
  }
  if (needRef.value === "json") {
    emit("tiptapBlur", json.value);
  }
  if (needRef.value === "md") {
    emit("tiptapBlur", md.value);
  }
};

// onKeyStroke(["ctrlKey", "s"], (e) => {
//   e.preventDefault();
//   tiptapBlur();
// });

const tiptapUpdate = () => {
  if (needRef.value === "html") {
    emit("tiptapUpdate", html.value);
  }
  if (needRef.value === "json") {
    emit("tiptapUpdate", json.value);
  }
  if (needRef.value === "md") {
    emit("tiptapUpdate", md.value);
  }
};

function checkLastChar(editor) {
  // 获取编辑器中的HTML内容
  let html = editor.getHTML();
  // 去掉HTML标签，只保留文本内容
  let text = html.replace(/<[^>]*>/g, "");
  // 检查是否以@结尾
  return text.endsWith("@");
}

const showMentionList = ref();

watch(
  html,
  () => {
    showMentionList.value = checkLastChar(editor.value);
  },
  { immediate: false, deep: true }
);

onBeforeUnmount(() => {
  editor.value && editor.value.destroy();
});

watch(
  isEditable,
  () => {
    editor.value && editor.value.setEditable(isEditable.value);
  },
  { immediate: true, deep: true }
);

watch(
  contentRef,
  () => {
    if (contentRef.value === "") {
      editor.value && editor.value.commands.setContent(contentRef.value);
    }
  },
  { immediate: false, deep: true }
);

const menu = ref([
  {
    type: "Botton",
    disable: false,
    label: "undo",
    icon: "undo",
    class: "",
    activeClass: "",
    always_show: false,
    handler: () => {
      editor.value.chain().focus().undo().run();
    },
  },
  {
    type: "Botton",
    disable: false,
    label: "redo",
    icon: "redo",
    class: "",
    activeClass: "",
    always_show: false,
    handler: () => {
      editor.value.chain().focus().redo().run();
    },
  },
  {
    type: "|",
    disable: false,
    always_show: false,
  },
  {
    type: "menu",
    disable: false,
    label: "H",
    icon: "title",
    class: "",
    activeClass: "",
    always_show: true,
    children: [
      {
        type: "Botton",
        disable: false,
        label: "H1",
        icon: "format_h1",
        class: "text-h1",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 1 }).run();
        },
      },
      {
        type: "Botton",
        disable: false,
        label: "H2",
        icon: "format_h2",
        class: "text-h2",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        type: "Botton",
        disable: false,
        label: "H3",
        icon: "format_h3",
        class: "text-h3",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 3 }).run();
        },
      },
      {
        type: "Botton",
        disable: false,
        label: "H4",
        icon: "format_h4",
        class: "text-h4",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 4 }).run();
        },
      },
      {
        type: "Botton",
        disable: false,
        label: "H5",
        icon: "format_h5",
        class: "text-h5",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 5 }).run();
        },
      },
      {
        type: "Botton",
        disable: false,
        label: "H6",
        icon: "format_h6",
        class: "text-h6",
        activeClass: "",
        handler: () => {
          editor.value.chain().focus().toggleHeading({ level: 6 }).run();
        },
      },
    ],
  },
  {
    type: "|",
    disable: false,
    always_show: false,
  },
  {
    type: "Botton",
    disable: false,
    label: "B",
    icon: "format_bold",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleBold().run();
    },
  },
  {
    type: "Botton",
    disable: false,
    label: "I",
    icon: "format_italic",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleItalic().run();
    },
  },
  {
    type: "Botton",
    disable: false,
    label: "S",
    icon: "strikethrough_s",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleStrike().run();
    },
  },
  {
    type: "|",
    disable: false,
    always_show: false,
  },
  {
    type: "set_color",
    disable: false,
    label: "Color",
    icon: "format_paint",
    class: "",
    activeClass: "",
    always_show: false,
    children: [
      {
        type: "block",
        disable: false,
        label: "Red",
        icon: "",
        class: "",
        activeClass: "",
        color: "#FF0000",
        handler: () => {
          editor.value.chain().focus().setColor("#FF0000").run();
        },
      },
      {
        type: "block",
        disable: false,
        label: "Green",
        icon: "",
        class: "",
        activeClass: "",
        color: "#00FF00",
        handler: () => {
          editor.value.chain().focus().setColor("#00FF00").run();
        },
      },
      {
        type: "block",
        disable: false,
        label: "Blue",
        icon: "",
        class: "",
        activeClass: "",
        color: "#0000FF",
        handler: () => {
          editor.value.chain().focus().setColor("#0000FF").run();
        },
      },
    ],
  },
  {
    type: "|",
    disable: false,
    always_show: false,
  },
  {
    type: "Botton",
    disable: false,
    label: "BulletList",
    icon: "format_list_bulleted",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleBulletList().run();
    },
  },
  {
    type: "Botton",
    disable: false,
    label: "OrderedList",
    icon: "format_list_numbered",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleOrderedList().run();
    },
  },
  {
    type: "Botton",
    disable: false,
    label: "TaskList",
    icon: "checklist",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => {
      editor.value.chain().focus().toggleTaskList().run();
    },
  },
  {
    type: "space",
    disable: false,
    always_show: true,
  },
  {
    type: "Botton",
    disable: !withImageBtb.value,
    icon: "image",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => open(),
  },
  {
    type: "Botton",
    disable: !withAttachBtb.value,
    icon: "attachment",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => uploadFiles(),
  },
  {
    type: "|",
    disable: !withSaveBtbRef.value,
    always_show: false,
  },
  {
    type: "Botton",
    disable: !withSaveBtbRef.value,
    label: "Save",
    icon: "save",
    class: "",
    activeClass: "",
    always_show: true,
    handler: () => tiptapBlur(),
  },
]);
</script>

<style lang="scss">
.tiptap {
  min-height: 2rem;
}
/* Basic editor styles */
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}
.tiptap:focus {
  outline: none;
}

input[type="checkbox"] {
  margin-right: 4px;
}

.mention {
  border: 1px solid #000;
  border-radius: 0.4rem;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
}
ul[data-type="taskList"] {
  list-style: none;
  padding: 0;

  p {
    margin: 0;
  }

  li {
    display: flex;

    > label {
      flex: 0 0 auto;
      margin-right: 0.5rem;
      user-select: none;
    }

    > div {
      flex: 1 1 auto;
    }

    ul li,
    ol li {
      display: list-item;
    }

    ul[data-type="taskList"] > li {
      display: flex;
    }
  }
}
</style>
