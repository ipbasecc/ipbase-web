<template>
  <div class="fit column no-wrap q-space items-center" :class="toolbar_onBottom ? 'reverse' : ''" ref="tiptap">
    <template v-if="isEditable">
      <div v-if="show_toolbar && isEditable"
        class="full-width row no-wrap gap-xs items-center justify-start q-py-xs q-px-sm"
        :class="`${square ? '' : 'radius-xs'}${toolbar_onBottom ? 'border-top' : 'border-bottom'}`"
        :style="`height: ${toolbarHeight}px`"
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
                    :style="`width: 2rem;height: 2rem;background-color: ${item.color};padding:1px`"
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
      <bubble-menu v-if="editor"
        :editor="editor"
        :tippy-options="{ duration: 100, maxWidth: 'none', }"
      >
       <BubbleMenuContent :editor />
      </bubble-menu>
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
    <slot name="locker"></slot>
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
  nextTick
} from "vue";
import useTiptap from './useTiptap.js'

import { Editor, EditorContent, BubbleMenu } from "@tiptap/vue-3";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";

import { Extension, markPasteRule } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold,  } from '@tiptap/extension-bold'
import { BulletList,  } from '@tiptap/extension-bullet-list'
import { Code } from '@tiptap/extension-code'
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
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'

import Commands from './commands.js'
import suggestion from './suggestion.js'

import "prismjs";
import "prismjs/themes/prism.css";
import { uiStore, userStore } from "src/hooks/global/useStore";
import { useFileDialog } from "@vueuse/core";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import { useDropZone } from "@vueuse/core";
import { useI18n } from 'vue-i18n';
import BubbleMenuContent from './BubbleMenu.vue'

const { t } = useI18n();
const menu = ref();

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
  isRender: {
    type: Boolean,
    default: false,
  },
  for: {
    type: String,
    default: "document",
  }
});

const contentRef = toRef(props, "content");
const jsonContentRef = toRef(props, "jsonContent");
const withSaveBtbRef = toRef(props, "withSaveBtb");
const { withImageBtb, withAttachBtb } = toRefs(props);
const isEditable = toRef(props, "editable");

const uiConfig = {
  withSaveBtb: withSaveBtbRef.value,
  withImageBtb: withImageBtb.value,
  withAttachBtb: withAttachBtb.value,
}

const needRef = toRef(props, "need");
const { hideScroll } = toRefs(props);
const emit = defineEmits([
  "tiptapReady",
  "tiptapDestroy",
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
const tiptapReadyCount = ref(0);
const init = () => {

  const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/g
  const CustomStrike = Strike.extend({
    addPasteRules() {
      return [
        markPasteRule({
          find: pasteRegex,
          type: this.type,
        }),
      ]
    },
  })
  const _HardBreak = props.for !== 'chat' ? HardBreak.extend({
    addKeyboardShortcuts() {
      return {
        // ↓ 禁用Ctrl + Enter,改为发送消息
        'Mod-Enter': () => {
          tiptapBlur();
          emit("ModEnter");
        },
      }
    },
  }) : HardBreak;

  editor.value = new Editor({
    content: tiptapContent.value,
    editable: isEditable.value,
    autofocus: props.autofocus,
    editorProps: {
      // clipboardTextParser(text, $context) {
      //   // 在这里处理粘贴的文本
      //   // 例如，调用 cleanHtmlHandler 处理 HTML
      //   return cleanHtmlHandler(text);
      // },
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
      // Strike,
      Text,
      Highlight.configure({ multicolor: true }),
      Underline,
      Superscript,
      Subscript,
      CustomStrike,
      // slash菜单
      // Commands.configure({
      //   suggestion,
      // }),
    ],
    onCreate({ editor }) {
      tiptapReadyCount.value++;
      if(tiptapReadyCount.value === 1){
        emit("tiptapReady");
      }
    },
    // triggered on every change
    onUpdate: () => {
      tiptapUpdate();
      emit("tiptapChanged");
    },
    async onBlur({ editor, event }) {
      await nextTick();
      const editorVal = JSON.stringify(editor.getJSON());
      const sourceVal = JSON.stringify(sourceContent.value);
      // console.log(editorVal, sourceVal);
      
      if(editorVal !== sourceVal){        
        tiptapBlur();
      }
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

const autoSetContent = () => {
  if (jsonContentRef.value || contentRef.value) {
    tiptapContent.value = (props.need === "json" || props.isRender) ? jsonContentRef.value : contentRef.value;
    return tiptapContent.value
  }
}
const applyContent = (newContent) => {
  console.log(editor.value.getJSON(), newContent);
  editor.value && editor.value.commands.setContent(newContent);
  console.log(editor);
}
onBeforeMount(() => {
  autoSetContent();
  setSourceContent();
  init();
  if(editor.value){
    const { editorMenu } = useTiptap(editor, uiConfig);
    menu.value = editorMenu;
  }
});

const clear = () => {
  editor.value.commands.clearContent();
};

watch(
  [jsonContentRef, contentRef],
  () => {
    const newContent = autoSetContent();
    if(newContent){
      applyContent(newContent);
    }
  },
  { immediate: false, deep: true }
);

const md = computed(() => editor.value?.storage?.markdown?.getMarkdown());
const json = computed(() => editor.value && editor.value.getJSON());
const html = computed(() => editor.value && editor.value.getHTML());

const tiptapBlur = () => {
  
  if(!isEditable.value) return;
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

defineExpose({
  tiptapBlur,
  clear
})

const tiptapUpdate = () => {
  if(!isEditable.value) return;
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
  emit("tiptapDestroy");
  if(!isEditable.value) {
    tiptapUpdate();
  }
  editor.value && editor.value.destroy();
});

watch(
  isEditable,
  () => {
    editor.value && editor.value.setEditable(isEditable.value);
  },
  { immediate: true, deep: true }
);

// watch(
//   contentRef,
//   () => {
//     if (contentRef.value === "") {
//       editor.value && editor.value.commands.setContent(contentRef.value);
//     }
//   },
//   { immediate: false, deep: true }
// );


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
.tiptap mark {
  background-color: #faf594;
  border-radius: .4rem;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  padding: .1rem .3rem;
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
code {
  background-color: var(--$primary);
  border-radius: 4px;
  color: #efefef;
  font-size: 0.85rem;
  padding: 0 4px;
  border: 1px solid #979797;
  margin: 0 4px
}
pre>code {
  background-color: unset;
  border-radius: unset;
  color: unset;
  font-size: unset;
  padding: unset;
  border: unset;
  margin: unset;
}
</style>
