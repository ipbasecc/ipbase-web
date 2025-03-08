<template>
  <div class="column no-wrap" :class="toolbar_onBottom ? 'reverse' : ''" ref="tiptap">
    <template v-if="isEditable">
      <div v-if="show_toolbar && isEditable"
        class="radius-top-xs full-width row no-wrap gap-xs items-center justify-start q-py-xs q-px-sm"
        :class="`z-fab
          ${!square ? 'radius-xs' : ''}
          ${isMessageInput ? 'radius-bottom-xs' : ''}
          ${toolbar_onBottom ? 'border-top' : `${miniToolbar ? '' : 'fixed'} border-bottom`}
          ${$q.dark.mode ? 'bg-grey-10' : 'bg-grey-2'}
        `"
        :style="`height: ${toolbarHeight}px`"
      >
        <slot name="left-btn"></slot>
        <BubbleMenuContent v-if="!miniToolbar" :editor :square="true" :bordered="false" :flat="true" class="transparent shadow-none" />
        <template v-else>
          <MiniToolbar
            :menu
            :editor
            :disable_btn
            :saving
            :tiptapSave
          />
        </template>
        <q-space />
        <slot name="more_btn"></slot>
      </div>
      <bubble-menu v-if="editor && show_bubbleMenu" ref="bubble-menuRef"
        :editor="editor"
        :tippy-options="{ duration: 100, maxWidth: 'none', }"
        class="bubble-menu"
      >
       <BubbleMenuContent :editor />
      </bubble-menu>
      <div class="column q-space items-center"
      :class="`${show_toolbar && isEditable && !toolbar_onBottom && !miniToolbar ? 'has_toolbar' : ''}`">
        <editor-content
          ref="dropZoneRef"
          class="tiptapBody q-space full-width"
          :class="`
            ${styleClass ? styleClass : 'q-pa-md'}
            ${toolbar_onBottom ? 'fit' : ''}
          `"
          :editor="editor"
          :style="`${contentStyle} ${show_toolbar ? `'padding-${toolbar_onBottom ? 'bottom' : 'top'}: ${miniToolbar ? '0' : '43'}px'` : ''}`"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
        />
      </div>
    </template>
    <div v-else
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
  onUnmounted,
  ref,
  toRef,
  toRefs,
  watch,
  computed,
  nextTick,
  watchEffect
} from "vue";
import useTiptap from './useTiptap.js'
import { isEmptyLine } from './useTiptap.js'
import { teamStore } from "src/hooks/global/useStore.js";

import { Editor, EditorContent, BubbleMenu } from "@tiptap/vue-3";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { onKeyStroke } from "@vueuse/core";
import { useQuasar } from "quasar";

import { Extension, markPasteRule } from '@tiptap/core'
import { Blockquote } from '@tiptap/extension-blockquote'
import { Bold,  } from '@tiptap/extension-bold'
import { BulletList,  } from '@tiptap/extension-bullet-list'
import { Code } from '@tiptap/extension-code'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
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

import SlashCommand from "./slashExtension.js";

import "prismjs";
import "prismjs/themes/prism.css";
import { uiStore, userStore } from "src/hooks/global/useStore";
import { useFileDialog } from "@vueuse/core";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import { useDropZone } from "@vueuse/core";
import BubbleMenuContent from './BubbleMenu.vue'

import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import htmlLang from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import jsonLang from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import { isRmptyTiptap } from 'src/hooks/utilits.js'

import 'highlight.js/styles/atom-one-dark.css'
import { startImageUpload, handleImageUpload } from "./plugins/upload-images";
import { TextSelection } from 'prosemirror-state'
import MiniToolbar from './MiniToolbar.vue'

const lowlight = createLowlight(common)

lowlight.register('javascript', javascript)
lowlight.register('js', javascript)
lowlight.register('css', css)
lowlight.register('html', htmlLang)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('json', jsonLang)
lowlight.register('typescript', typescript)
lowlight.register('ts', typescript)
lowlight.register('bash', bash)
lowlight.register('sql', sql)

const $q = useQuasar();

const props = defineProps({
  show_toolbar: {
    type: Boolean,
    default: true,
  },
  miniToolbar: {
    type: Boolean,
    default: false,
  },
  show_bubbleMenu: {
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
  withSaveBtn: {
    type: Boolean,
    default: false,
  },
  withImageBtn: {
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
  },
  contentChanged: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  isMessageInput: {
    type: Boolean,
    default: false,
  },
});

const contentRef = toRef(props, "content");
const jsonContentRef = toRef(props, "jsonContent");
const withSaveBtnRef = toRef(props, "withSaveBtn");
const isEditable = toRef(props, "editable");
const needRef = toRef(props, "need");
const {
  withImageBtn,
  withAttachBtb,
  contentChanged,
  saving,
  isMessageInput,
  hideScroll,
  autofocus,
  miniToolbar
} = toRefs(props);

const emit = defineEmits([
  "tiptapReady",
  "tiptapDestroy",
  "tiptapBlur",
  "tiptapSave",
  "tiptapClose",
  "tiptapUpdate",
  "tiptapChanged",
  "mmMsgChange",
  "ModEnter",
  "contentChanged",
  "isEmpty"
]);

const tiptap = ref(null);
const editor = ref();
const dropZoneRef = ref();

const tiptapContent = ref();
const isEmpty = computed(() => isRmptyTiptap(editor.value?.getJSON()))

const tiptapReadyCount = ref(0);
const isSlashCommand = ref(false)
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
  // 1. 增强上传占位符扩展
  const UploadPlaceholder = Extension.create({
    addCommands() {
      return {
        setUploadingPlaceholder: (pos) => ({ state, dispatch }) => {
          // 创建带有唯一ID的占位符
          const placeholderId = `upload-${Date.now()}`
          const placeholder = state.schema.nodes.paragraph.create(
            { id: placeholderId },
            state.schema.text('⏳ 上传中...')
          )
          
          const tr = state.tr
            .insert(pos, placeholder)
            .setMeta('addToHistory', false)
            .setMeta('uploadPlaceholder', {
              from: pos,
              to: pos + placeholder.nodeSize,
              id: placeholderId
            })
          
          if (dispatch) dispatch(tr)
          return true
        },
        
        deleteUploadPlaceholder: (placeholderId) => ({ state, dispatch }) => {
          console.log('placeholderId', placeholderId);
          
          let found = false
          state.doc.descendants((node, pos) => {
            if (node.attrs.id === placeholderId) {
              const tr = state.tr
                .delete(pos, pos + node.nodeSize)
                .setMeta('addToHistory', false)
              
              if (dispatch) dispatch(tr)
              found = true
              return false // 停止遍历
            }
          })
          return found
        }
      }
    }
  })

  editor.value = new Editor({
    content: tiptapContent.value,
    editable: isEditable.value,
    autofocus: autofocus.value,
    editorProps: {
      handleKeyDown: (view, event) => {
        // 检查是否是 Ctrl+Enter 或 Cmd+Enter
        if (props.for === 'chat' && ((event.ctrlKey || event.metaKey) && event.key === 'Enter')) {
          tiptapBlur();
          emit("ModEnter");
          return true;
        }
        return false;
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
      Markdown,
      Extension,
      Blockquote,
      Bold,
      BulletList,
      Code,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
        HTMLAttributes: {
          class: 'code-block'
        }
      }),
      Document,
      Dropcursor,
      Gapcursor,
      HardBreak,
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
      Placeholder.configure({
        placeholder: ({ node }) => {          
          if (node.type.name === 'paragraph' || node.type.name === 'text') {
            return '请输入文本...';
          }
          return '';
        },
      }),
      // slash菜单
      SlashCommand,
      UploadPlaceholder
    ],
    onCreate({ editor }) {
      tiptapReadyCount.value++;
      if(tiptapReadyCount.value === 1){
        emit("tiptapReady");
      }
      setupPasteHandler()
    },
    onCreated: () => {
      console.log('onCreated');
      
      setupPasteHandler()
    },
    onUpdate: async ({ editor, transaction }) => {
      // 检查是否是斜杠触发的更新
      isSlashCommand.value = transaction.steps.some(step => {
        return step.slice?.content?.content?.[0]?.text === '/';
      });
      await nextTick();
      
      if (!isSlashCommand.value) {
        emit("contentChanged", true);
        tiptapUpdate();
      }
      emit("isEmpty", isEmpty.value);
    },
    async onBlur({ editor, event }) {
      const sourceVal = JSON.stringify(sourceContent.value);
      const editorVal = JSON.stringify(editor.getJSON());
      
      const BubbleMenu = document.querySelector('.bubble-menu');
      if(BubbleMenu) return
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

const getClipboardData = (event) => {
  console.log('getClipboardData', event);
  
  if (event.clipboardData?.items) {
    return event.clipboardData.items
  }
  // 兼容Safari
  if (window.ClipboardEvent && event.clipboardData) {
    return event.clipboardData.files
  }
  return []
}
const setupPasteHandler = () => {
  console.log('setupPasteHandler');
  const handlePaste = async (event) => {
    console.log('handlePaste', event);
    // if (!editor.value.isFocused) return

    const items = getClipboardData(event)
    console.log('items', items);
    
    if (!items) return

    let hasImage = false
    const uploadPromises = []

    // 第一遍遍历：同步检测是否存在图片
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        hasImage = true
        event.preventDefault() // 立即阻止默认行为
        break // 发现图片即退出循环
      }
    }

    if (!hasImage) return // 无图片则退出

    // 第二遍遍历：处理所有图片
    // 显示上传占位符
    const pos = editor.value.state.selection.from
    // const placeholderMeta = editor.value.commands.setUploadingPlaceholder(pos)
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        
        // 处理Safari兼容性（可能返回null）
        if (!blob) {
          console.warn('无法获取剪贴板文件数据')
          continue
        }

        const filename = `paste-${Date.now()}.${item.type.split('/')[1] || 'png'}`
        const file = new File([blob], filename, { type: item.type })

        // 收集上传Promise
        uploadPromises.push(
          handleImageUpload(file, editor.value)
        )
      }
    }

    // 等待所有上传完成
    await Promise.allSettled(uploadPromises)
    // editor.value.commands.deleteUploadPlaceholder(placeholderMeta.id)
  }

  document.addEventListener('paste', handlePaste)
  editor.value.on('destroy', () => {
    document.removeEventListener('paste', handlePaste)
  })
}

const isSlashMenuOpen = computed(() => editor.value?.slashMenuOpen || false)
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

const menu = ref();
const uiConfig = ref({});
watchEffect(() => {
  uiConfig.value.withSaveBtn = withSaveBtnRef.value;
  uiConfig.value.withImageBtn = withImageBtn.value;
  uiConfig.value.withAttachBtb = withAttachBtb.value;
  if(editor.value){
    const { editorMenu } = useTiptap(editor, uiConfig.value, uploadFiles, tiptapSave);
    menu.value = editorMenu;
  }
})

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

// 添加防抖函数（避免频繁触发）
const debounce = (fn, delay = 100) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

let insertPos = null
let isBetweenLines = false // 标记是否在两行之间


// 增强版处理函数
const handleDragMove = (event) => {
  if (!editor.value) return

  const view = editor.value.view
  const coords = { left: event.clientX, top: event.clientY }
  
  // 安全获取位置
  const rawPos = view.posAtCoords(coords)?.pos ?? 0

  // 空文档处理
  if (view.state.doc.content.size === 0) {
    insertPos = 0
    return
  } else {
    insertPos = rawPos
  }
}

const debouncedMouseHandler = debounce(handleDragMove, 100)

const onDrop = async (files) => {
  // 确保 editor 是可用的
  if (!editor.value || !files) return;

  if (insertPos === null) return

  // 创建新事务
  const transaction = editor.value.state.tr

  // 当且仅当当前行不为空时插入新行
  let actualInsertPos = insertPos
  if (!isEmptyLine(editor.value, actualInsertPos)) {
    const newNode = editor.value.schema.nodes.paragraph.create()
    transaction.insert(insertPos, newNode)
    // 新行插入后，实际插入位置需要加上新节点的尺寸
    actualInsertPos += newNode.nodeSize
  }

  // 设置选区到实际插入位置
  transaction.setSelection(
    TextSelection.create(
      transaction.doc,
      Math.min(actualInsertPos, transaction.doc.content.size - 1)
    )
  )

  // 应用事务
  editor.value.view.dispatch(transaction)

  // 处理文件上传
  for (const file of files) {
    await startImageUpload(
      file, 
      editor.value.view,
      actualInsertPos, // 使用调整后的位置
      editor.value
    )
  }
  // 重置状态
  insertPos = null
  isBetweenLines = false
};
const { isOverDropZone } = useDropZone(tiptap, {
  onDrop,
  dataTypes: ["image/*"],
});

onMounted(() => {
  document.addEventListener('dragover', (e) => {
    e.preventDefault() // 必须阻止默认行为
    debouncedMouseHandler(e) // 复用相同的处理逻辑
  })
})

onUnmounted(() => {
  if(teamStore.active_document){
    teamStore.active_document = null;
  }
  document.removeEventListener('dragover', (e) => {
    e.preventDefault() // 必须阻止默认行为
    debouncedMouseHandler(e) // 复用相同的处理逻辑
  })
})

const autoSetContent = () => {
  if (jsonContentRef.value || contentRef.value) {
    tiptapContent.value = (props.need === "json" || props.isRender) ? jsonContentRef.value : contentRef.value;
    return tiptapContent.value
  }
}
const applyContent = (newContent) => {
  // console.log(editor.value.getJSON(), newContent);
  editor.value && editor.value.commands.setContent(newContent);
  // console.log(editor);
}
onBeforeMount(() => {
  autoSetContent();
  setSourceContent();
  init();
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
  // console.log('tiptapBlur');
  
  if(!isEditable.value || !contentChanged.value || isSlashCommand.value) return;
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

const getContent = () => {
  if (needRef.value === "html") {
    return html.value;
  }
  if (needRef.value === "json") {
    return json.value;
  }
  if (needRef.value === "md") {
    return md.value;
  }
};

const tiptapSave = () => {
  const content = getContent();
  if(content){
    // console.log('getContent', content)
    emit("tiptapSave", content)
  }
}
const enable_shortcut = ref(false);
const onMouseEnter = () => {
  enable_shortcut.value = true;
}
const onMouseLeave = () => {
  enable_shortcut.value = false;
}
const ControlKey = computed(() => {
  return $q.platform.is.mac ? "metaKey" : "ctrlKey"; // todo，这里需要验证meteKey是否正确
})
onKeyStroke([ControlKey.value, "s"], (e) => {
  if(!enable_shortcut.value) return;
  // console.log('onKeyStroke Tiptap', e);
  if (e[ControlKey.value] && e.key === 's') {
    e.preventDefault();
    tiptapSave();
  }
});

defineExpose({
  tiptapBlur,
  clear,
  isSlashMenuOpen
})

const tiptapUpdate = () => {
  // console.log('contentChanged.value', contentChanged.value, isEditable.value);
  
  if(!isEditable.value || !contentChanged.value || isSlashCommand.value) return;
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
  if(!isEditable.value || !contentChanged.value) {
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
</script>

