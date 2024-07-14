<template>
  <q-layout view="lHr lpR lFr" container class="absolute-full">
    <q-header
      class="transparent"
      :class="
        $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
      "
    >
      <q-bar
        class="row flex-center transparent"
        :class="showRootpost ? '' : 'border-bottom'"
        style="height: 2.3rem"
      >
        <div class="row no-wrap gap-xs q-py-xs" style="width: 650px">
          <q-btn
              v-if="!$q.screen.gt.xs"
              flat
              dense
              icon="close"
              @click="uiStore.showMainContentList = true"
          />
          {{ document?.title }}
          <q-space />
          <q-btn
            v-if="!readOnly"
            flat
            dense
            icon="save"
            @click="saveEditor()"
          />
          <ThreadBtn
            v-if="document?.mm_thread"
            :thread="document?.mm_thread"
            :show="true"
            :rounded="false"
            @enterThread="enterThread"
          />
        </div>
      </q-bar>
    </q-header>
    <q-drawer
      v-if="document?.mm_thread"
      v-model="rightDrawerOpen"
      side="right"
      :width="460"
      overlay
    >
      <ThreadContainer
        :showRootpost="false"
        :showToolbar="false"
        :chatInfo
        @closeThread="closeThread"
      />
    </q-drawer>

    <q-page-container>
      <q-page>
        <q-scroll-area class="absolute-full">
          <div ref="editorRef" class="q-space article q-pa-md" />
        </q-scroll-area>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup>
import {
  ref,
  toRaw,
  toRefs,
  computed,
  watch,
  watchEffect,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import EditorJS from "@editorjs/editorjs";
// 导入全部常用插件
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import InlineCode from "@editorjs/inline-code";
import Embed from "@editorjs/embed";
import LinkTool from "@editorjs/link";
import Marker from "@editorjs/marker";
import Table from "@editorjs/table";
import Raw from "@editorjs/raw";
import Delimiter from "@editorjs/delimiter";
import Quote from "@editorjs/quote";
import ImageTool from "@editorjs/image";
import Warning from "@editorjs/warning";
import Paragraph from "@editorjs/paragraph";
import Checklist from "@editorjs/checklist";
import DragDrop from "editorjs-drag-drop";

import { useQuasar } from "quasar";
import useMmws from "src/stores/mmws.js";
import useTeamStore from "src/stores/team.js";

import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";

import { db } from "src/boot/dexie.js";

import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import useUserStore from "src/stores/user.js";
import ThreadBtn from "src/pages/team/components/widgets/ThreadBtn.vue";
import ThreadContainer from "src/pages/team/chat/ThreadContainer.vue";
import {uiStore} from 'src/hooks/global/useStore';

const { me } = useGetMyMatedate;

const mm_wsStore = useMmws();
const teamStore = useTeamStore();
const userStore = useUserStore();
const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false,
  },
  document: {
    type: Object,
    default() {
      return {};
    },
  },
  showRootpost: {
    type: Boolean,
    default: false,
  },
});

const editorRef = ref(null);
const { readOnly, document } = toRefs(props);
const document_id = computed(() => document.value.id);
const initData = ref();

const getCache = async () => {
  return await db.documents.get(document_id.value);
};
const addCache = async (val) => {
  return await db.documents.add({ id: document_id.value, data: val });
};
const putCache = async (val) => {
  return await db.documents.put({ id: document_id.value, data: val });
};

const $q = useQuasar();
watchEffect(() => {
  initData.value = document.value.jsonContent;
});
let editor = void 0;
const initialized = ref(false);
const init = () => {
  editor = new EditorJS({
    holder: editorRef.value,
    data: initData.value,
    autofocus: true,
    placeholder: readOnly.value ? '' : '开始输入你的文档内容',
    tools: {
      header: {
        class: Header,
        inlineToolbar: true,
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      // add custom tags or overwrite default tools of editorjs by using the same
      // name (eg. `bold` or `italic`)
      list: List,
      code: Code,
      inlineCode: InlineCode,
      embed: Embed,
      linkTool: LinkTool,
      marker: Marker,
      table: Table,
      raw: Raw,
      delimiter: {
        class: Delimiter,
        config: {
          content: "---",
        },
      },
      quote: Quote,
      image: {
        class: ImageTool,
        config: {
          // 用户选择的本地图片
          uploader: {
            async uploadByFile(file) {
              let res = await customUploadByFile(file);
              if (res) {
                return {
                  success: 1,
                  file: {
                    url: res,
                  },
                };
              }
            },
            // 用户复制粘贴的图片
            async uploadByUrl(url) {
              // console.log('uploadUrl',url);
              // todo 需要先将远程url文件保存到OSS，之后返回OSS中的url，这里直接使用的是原始远程url
              return {
                success: 1,
                file: {
                  url: url,
                },
              };
            },
          },
        },
      },
      warning: Warning,
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      // ... 其他插件
    },
    readOnly: readOnly.value,
    i18n: {
      messages: {
        ui: {
          blockTunes: {
            toggler: {
              "Click to tune": "点击调整",
              "or drag to move": "或拖拽移动",
            },
          },
          inlineToolbar: {
            converter: {
              "Convert to": "转换为：",
            },
          },
          toolbar: {
            toolbox: {
              Add: "添加",
            },
          },
        },

        /**
         * Section for translation Tool Names: both block and inline tools
         */
        toolNames: {
          Text: "文本",
          Heading: "标题",
          List: "列表",
          Warning: "警告",
          Checklist: "清单",
          Quote: "引用",
          Code: "代码",
          Delimiter: "分割线",
          "Raw HTML": "HTML代码",
          Table: "表格",
          Link: "链接",
          Marker: "标记",
          Bold: "加醋",
          Italic: "倾斜",
          InlineCode: "行内代码",
        },

        /**
         * Section for passing translations to the external tools classes
         */
        tools: {
          /**
           * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
           * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
           */
          warning: {
            // <-- 'Warning' tool will accept this dictionary section
            Title: "标题",
            Message: "信息",
          },

          /**
           * Link is the internal Inline Tool
           */
          link: {
            "Add a link": "添加一个链接",
          },
          /**
           * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
           */
          stub: {
            "The block can not be displayed correctly.": "当前无法显示的区块",
          },
        },

        /**
         * Section allows to translate Block Tunes
         */
        blockTunes: {
          /**
           * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
           * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
           *
           * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
           */
          delete: {
            Delete: "删除",
          },
          moveUp: {
            "Move up": "上移",
          },
          moveDown: {
            "Move down": "下移",
          },
        },
      },
    },
    logLevel: "ERROR",
    onReady: () => {
      uiStore.disable_shortcut = true
      new DragDrop(editor);
      initialized.value = true;
    },

    onChange: (api, event) => {
      if (!readOnly.value && initialized.value) {
        api.saver.save().then(async (savedData) => {
          // 如果内容包含图片，不能保存到缓存，这里预处理
          const _data = JSON.parse(JSON.stringify(savedData));
          await putCache(_data);
        });
      }
    }
  });
};
const render_wsChange = () => {
  if (initialized.value) {
    // editor?.render(val);
  }
};
const customUploadByFile = async (file) => {
  const files = [file];
  // console.log('customUploadByFile',files);
  const imageUrl = await confirmUpload(files, me);
  const url = JSON.parse(JSON.stringify(imageUrl));
  // progressCallback('success', { file: { url: imageUrl } });
  return url[0].attributes.url;
};
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  editor.destroy();
  uiStore.disable_shortcut = false
});
const emit = defineEmits(["documentUpdate"]);
// 保存编辑器实例
const saveEditor = () => {
  if (readOnly.value) return;
  editor
    .save()
    .then(async (data) => {
      emit("documentUpdate", data);
    })
    .catch((error) => {
      console.log("Saving failed: ", error);
    });
};

// 切换只读模式
const toggleReadOnly = () => {
  readOnly.value = !readOnly.value;
  editor.readOnly.toggle(readOnly.value);
};

const rightDrawerOpen = ref(false);
const chatInfo = computed(() => ({
  mm_channel_id: teamStore.project?.mm_channel?.id,
  post_id: document.value?.mm_thread?.id,
}));
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
  teamStore.thread = rightDrawerOpen.value ? document.value?.mm_thread : null;
};
const enterThread = () => {
  toggleRightDrawer();
};
const closeThread = () => {
  rightDrawerOpen.value = false;
  teamStore.thread = null;
};

const wsChange_bySelf = ref(true);

watch(
  [initData, initialized],
  async () => {
    if (initData.value && initialized.value) {
      let cache = await getCache();
      // console.log(cache);
      if (!cache) {
        const _data = structuredClone(toRaw(initData.value));
        await addCache(_data);
      }
      if (!wsChange_bySelf.value) {
        // 原始数据改变、且 是被其他人修改
        // 弹出提示框，点击后显示最新内容
        $q.notify({
          message:
            "文档内容以改变，是否查看新内容？  ---  如果你也在修改此文档，注意备份",
          color: "primary",
          position: "top",
          multiLine: true,
          actions: [
            {
              label: "查看",
              color: "white",
              handler: () => {
                render_wsChange(initData.value);
              },
            },
          ],
        });
      }
    }
    if (!initData.value) {
    }
  },
  { immediate: false, deep: true }
);
watch(
  mm_wsStore,
  () => {
    // console.log(mm_wsStore.event);
    if (mm_wsStore.event?.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (
        strapi?.data.document_id === document.value.id &&
        strapi.data.action === "DocumentContentUpdate"
      ) {
        wsChange_bySelf.value = false;
      }
    }
  },
  { immediate: false, deep: true }
);
</script>
