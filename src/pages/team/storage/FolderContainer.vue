<template>
  <div class="absolute-full" :class="`drop-zone_${storage_idRef}`">
    <drag-select v-model="selected" class="fit">
      <q-scroll-area
        :class="`fit drop-zone_${storage_idRef}`"
        @mouseenter="teamStore.active_folder = storage_idRef"
        @mouseleave="showUpdateArea = false"
        @click="clickColumn()"
      >
        <q-list
          v-if="masterList"
          dense
          class="q-pa-xs"
          :style="`width: ${splitterModel}px`"
        >
          <slot v-if="teamStore.create_folder_ing" name="create_folder"></slot>

          <drag-select-option
            v-for="(i, index) in masterList.list"
            :key="i.id"
            :value="i"
          >
            <q-item
              clickable
              v-ripple
              class="radius-xs hovered-item q-px-sm q-py-none"
              @click.stop="clickItem(i, index)"
              @mouseenter="openItemMenu = i.id"
              :class="`${isSelected(i.id) ? selectedStyle : unselectedStyle} ${
                opened_folderRef === i.id ? highlightStyle : ''
              }`"
            >
              <q-item-section v-if="isSelected(i.id)" side>
                <q-icon name="task_alt" color="green" size="xs" />
              </q-item-section>
              <q-item-section v-else side>
                <q-icon :name="i.file ? 'mdi-file' : 'mdi-folder'" size="xs" />
              </q-item-section>
              <q-item-section>{{ i.name }}</q-item-section>
              <q-item-section v-if="i.color_marker?.length > 0" side>
                <div class="row no-wrap">
                  <q-icon
                    v-for="j in i.color_marker?.filter((k) => k !== 'clear')"
                    :key="j"
                    name="mdi-checkbox-blank-circle"
                    :color="j"
                    class="cursor-pointer"
                    size="12px"
                  ></q-icon>
                </div>
              </q-item-section>
              <q-item-section
                side
                class="hover-show transition absolute-right"
                @mouseenter="unEnter = true"
                @mouseleave="unEnter = false"
              >
                <div class="q-pr-sm">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    round
                    color="primary"
                    icon="more_vert"
                    @click="moreMenuIndex = index"
                  >
                    <q-menu
                      class="radius-sm"
                      :ref="setMoreMenu(index)"
                      @mouseenter="disable_clickOutside = true"
                      @mouseleave="disable_clickOutside = false"
                    >
                      <q-list bordered dense class="radius-sm q-pa-xs">
                        <q-item v-if="!i.file">
                          <q-item-section>
                            <div class="row no-wrap gap-sm">
                              <q-icon
                                v-for="marker in colorMarks"
                                :key="marker"
                                dense
                                :size="
                                  i?.color_marker === marker ? '24px' : '16px'
                                "
                                flat
                                round
                                padding="none"
                                :color="marker"
                                :name="
                                  i?.color_marker === marker
                                    ? 'mdi-checkbox-marked-circle'
                                    : 'mdi-checkbox-blank-circle'
                                "
                                class="cursor-pointer"
                                @click="setCardColor(i, marker)"
                              />
                            </div>
                          </q-item-section>
                        </q-item>
                        <q-item
                          v-if="i.file"
                          clickable
                          v-ripple
                          v-close-popup
                          class="radius-xs"
                          @click.stop="downloadItem(i)"
                        >
                          <q-item-section side>
                            <q-icon size="sm" name="download" />
                          </q-item-section>
                          <q-item-section>{{ $t('download') }}</q-item-section>
                        </q-item>
                        <q-item
                          v-if="useAuths('files', [authBase?.collection])"
                          clickable
                          v-ripple
                          v-close-popup
                          class="radius-xs"
                          @click.stop="removeItem(i)"
                        >
                          <q-item-section side>
                            <q-icon size="sm" name="delete" />
                          </q-item-section>
                          <q-item-section>{{ $t('delete') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-item-section>
              <q-menu
                v-if="openItemMenu === i.id"
                class="radius-sm"
                context-menu
              >
                <q-list bordered dense class="radius-sm q-pa-xs">
                  <q-item v-if="!i.file">
                    <q-item-section>
                      <div class="row no-wrap gap-sm">
                        <q-icon
                          v-for="marker in colorMarks"
                          :key="marker"
                          dense
                          :size="i?.color_marker === marker ? '24px' : '16px'"
                          flat
                          round
                          padding="none"
                          :color="marker"
                          :name="
                            i?.color_marker === marker
                              ? 'mdi-checkbox-marked-circle'
                              : 'mdi-checkbox-blank-circle'
                          "
                          class="cursor-pointer"
                          @click="setCardColor(i, marker)"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="i.file"
                    clickable
                    v-ripple
                    v-close-popup
                    class="radius-xs"
                    @click.stop="downloadItem(i)"
                  >
                    <q-item-section side>
                      <q-icon size="sm" name="download" />
                    </q-item-section>
                    <q-item-section>{{ $t('download')}}</q-item-section>
                  </q-item>
                  <q-item
                    v-if="useAuths('files', [authBase?.collection])"
                    clickable
                    v-ripple
                    v-close-popup
                    class="radius-xs"
                    @click.stop="removeItem(i)"
                  >
                    <q-item-section side>
                      <q-icon size="sm" name="delete" />
                    </q-item-section>
                    <q-item-section>{{ $t('delete')}}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </drag-select-option>
        </q-list>
        <div
          v-if="isActivedFolder && showUpdateArea"
          class="bg-primary column flex-center absolute-full op-2"
        >
          {{ $t('drag_here_upload') }}
        </div>
      </q-scroll-area>
    </drag-select>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
  watch,
  watchEffect,
  computed,
  inject,
} from "vue";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import {
  createStorage,
  updateStorage,
  deleteStorage,
  createStorageFile_batch,
  deleteStorageFile,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { downloadFile } from "src/hooks/utilits.js";
import { useQuasar } from "quasar";

import { onClickOutside } from "@vueuse/core";
import { userStore, mm_wsStore, teamStore, uiStore } from "src/hooks/global/useStore.js";

const emit = defineEmits([
  "enterFolder",
  "storageUpdate",
  "folderRemove",
  "closeSubFolder",
  "previewFile",
  "removeItem"
]);
const $q = useQuasar();

const me = userStore.me;
const props = defineProps({
  sub_files: {
    type: Array,
    default() {
      return [];
    },
  },
  sub_folders: {
    type: Array,
    default() {
      return [];
    },
  },
  storage_id: {
    type: Number,
    default: NaN,
  },
  opened_folder: {
    type: Number,
    default: NaN,
  },
  belonged: {
    type: String,
    default: "storage",
  },
  authBase: {
    type: Object,
    default() {
      return {};
    },
  },
  splitterModel: {
    type: Number,
    default: NaN,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});
const {
  belonged,
  opened_folder: opened_folderRef,
  storage_id: storage_idRef,
  sub_folders: sub_foldersRef,
  sub_files: sub_filesRef,
  authBase,
  splitterModel,
  readOnly
} = toRefs(props);

const by = inject("by");

const isActivedFolder = computed(
  () => teamStore.active_folder === storage_idRef.value
);
// const masterList = ref();
const openItemMenu = ref();

// 点击更多按钮后，点击UI其它位置关闭下拉菜单
const moreMenu = ref({});
const moreMenuIndex = ref();
// 鼠标进入下拉列表内禁止点击外部关闭事件，否则对应菜单点击事件未执行菜单就被关闭
const disable_clickOutside = ref(false);
const setMoreMenu = (index) => (el) => {
  moreMenu.value[index] = el;
};
onClickOutside(
  moreMenu,
  () =>
    !disable_clickOutside.value && moreMenu.value[moreMenuIndex.value]?.hide()
);

const disable_dragSelect = ref(false);

// 定义响应式数据
const masterList = reactive({
  list: [],
  lastSelectedIndex: -1, // 记录上一次选中的索引
});
watchEffect(() => {
  disable_dragSelect.value = teamStore.create_folder_ing;
  masterList.list = [...sub_foldersRef.value, ...sub_filesRef.value];
});

const selected = ref([]);
const selected_ids = ref();
const batch_selected = ref([]);
const batch_selected_ids = ref([]);
const isSelected = (id) => {
  let __ =
    !opened_folderRef.value &&
    (selected_ids.value?.includes(id) ||
      batch_selected_ids.value?.includes(id));
  return __;
};
const selectedStyle = ref("bg-selected border-xs border-solid border-primary");
const highlightStyle = ref("bg-selected border-xs border-solid border-primary");
const unselectedStyle = ref("border-placeholder");
watchEffect(() => {
  selected_ids.value = selected.value.map((i) => i.id);
  if (batch_selected_ids.value.length > 0) {
    teamStore.selected = [
      ...selected.value.filter((i) => !batch_selected_ids.value.includes(i.id)),
      ...batch_selected.value,
    ];
  } else {
    teamStore.selected = selected.value;
  }
});
const clear_selected = () => {
  teamStore.selected = [];
  selected.value = [];
  selected_ids.value = [];
  batch_selected.value = [];
  batch_selected_ids.value = [];
  masterList.lastSelectedIndex = -1;
};

const updateStorage_params = ref({
  data: {},
});

const checkSupport = (file) => {
  // 根据 file 的名称提取出文件扩展
  const extension = file.name.split(".").pop().toLowerCase();
  // 检查文件扩展是否在支持的扩展列表中
  return uiStore.suportExts.includes(extension);
};

// 定义响应式数据
const files = ref([]);
// 定义上传文件的方法
const onDrop = async (e, storage_id) => {
  console.log('onDrop',e);
  if(teamStore.shareInfo) return
  uiStore.unsupportFiles = e.filter(i => !checkSupport(i));
  if(uiStore.unsupportFiles?.length > 0){
    uiStore.showUnsupportFiles = true
  }
  //storage_id: 如果上传的是文件夹，那么首先创建文件夹，再将文件上传至文件夹内，新建的文件夹即这里的storage_id

  files.value = e.filter(i => checkSupport(i));
  if(files.value?.length === 0 || !files.value) return
  // console.log('files.value onDrop',files.value);

  try {
    // 等待confirmUpload函数的结果
    let res = await confirmUpload(files.value, me);
    if (res) {
      const create_storageFile_params = res.map((i) => ({
        storage_id: storage_id || storage_idRef.value,
        file_id: i.id,
        name: i.attributes.name,
      }));
      // console.log('create_storageFile_params',create_storageFile_params);
      const batchCreated = await createStorageFile_batch(
        create_storageFile_params
      );
      if (batchCreated?.data) {
        $q.notify("文件已上传");
        let chat_Msg = {};
        chat_Msg.props = {
          strapi: {
            data: {
              is: "storage",
              by_user: userStore.userId,
              storage_id: storage_id || storage_idRef.value,
              action: "fileUploaded_storage",
              changed_data: {
                files: batchCreated.data,
              },
            },
          },
        };
        if (!storage_id) {
          if (belonged.value === "card") {
            // todo 需要补充card名称
            chat_Msg.body = `${userStore.me?.username}向卡片${teamStore.card.id}上传了文件`;
            chat_Msg.props.strapi.data.card_id = teamStore.card.id;
          } else if (belonged.value === "project") {
            chat_Msg.body = `${userStore.me?.username}向“项目文件”上传了文件`;
            chat_Msg.props.strapi.data.project_id = teamStore.project.id;
          }
        } else {
          // todo 需要补充文件夹名称
          chat_Msg.body = `${userStore.me?.username}向文件夹${storage_idRef.value}上传了文件`;
        }
        // await send_chat_Msg(chat_Msg);
        // emit('storageUpdate',res_upload.data)
        return batchCreated.data;
      }
      // let files_ids = res.map(i => Number(i.id));
      // updateStorage_params.value.data = {
      //     new_storageFiles: files_ids
      // }
      // let res_upload = await updateStorage(storage_id || storage_idRef.value,updateStorage_params.value)
      // if(res_upload) {
      // }
      return res;
    }
  } catch (e) {
    // 处理错误
    console.error(e);
  }
};
let params = ref({
  // storage_id: storage_idRef.value,
  data: {
    name: "",
  },
});
const loading = ref(false);
const createStorageFn = async (folder, storage_id) => {
  // console.log(folder);
  if (loading.value) return;
  loading.value = true;
  params.value.data.name = folder.name;
  if (belonged.value === "project") {
    params.value.data.assign_project = teamStore.project.id;
  } else if (belonged.value === "card") {
    params.value.data.assign_card = teamStore.card.id;
  } else if (belonged.value === "user") {
    params.value.data.assign_user = userStore.userId;
  } else if (belonged.value === "storage") {
    params.value.data.assign_storage = storage_id;
  }

  let res = await createStorage(params.value);
  if (res) {
    let chat_Msg = {};
    chat_Msg.props = {
      strapi: {
        data: {
          is: "storage",
          by_user: userStore.userId,
          storage_id: storage_id,
          action: "subfloder_created",
          subfloder: res.data,
        },
      },
    };
    if (belonged.value === "card") {
      // todo 需要补充文件夹名称
      chat_Msg.body = `${userStore.me?.username}在卡片 - ${teamStore.card.name} 内新建了文件夹：`;
      chat_Msg.props.strapi.data.card_id = teamStore.card.id;
    } else if (belonged.value === "project") {
      // todo 需要补充文件夹名称
      chat_Msg.body = `${userStore.me?.username}在“项目文件”内新建了文件夹：`;
      chat_Msg.props.strapi.data.project_id = teamStore.project.id;
    } else {
      // todo 需要补充文件夹、新建的文件夹名称
      chat_Msg.body = `${userStore.me?.username}在文件夹${storage_idRef.value}内新建了文件夹：`;
    }
    // await send_chat_Msg(chat_Msg);

    params.value.data.name = "";
    loading.value = false;
    return res.data;
  }
};

const enterFolder = (folder) => {
  emit("enterFolder", folder);
};
const previewFile = (file) => {
  emit("previewFile", file);
};

const closeSubFolder = () => {
  emit("closeSubFolder");
};
const downloadItem = (i) => {
  if (i.file.url) {
    if($q.platform.is.electron){
      windowAPI.downloadFile(i.file.url,i.name)
    } else {
      downloadFile(i.file.url);
    }
  }
};
const unEnter = ref(false);
const clickItem = (i, index) => {
  if (unEnter.value) return;
  if (i.file) {
    closeSubFolder();
    previewFile(i.file);
  } else if (!isctrl.value && !isshift.value) {
    emit("previewFile", null);
    enterFolder(i);
  }
  handleClick(index);
};

const removeItem = (i) => {
  // console.log('removeItem',i);
  if (i.file) {
    removeFile(i);
  } else {
    removeFolder(i);
  }
  emit("removeItem", i);
};
const removeFile = async (file) => {
  let remove = await deleteStorageFile(file.id);
  if (remove) {
    let chat_Msg = {};
    if (belonged.value === "card") {
      chat_Msg.body = `${userStore.me?.username}删除了卡片 - ${teamStore.card.name} 内的文件 ${file.name}`;
    } else if (belonged.value === "project") {
      chat_Msg.body = `${userStore.me?.username}删除了“项目文件”内的文件 ${file.name}`;
    } else {
      chat_Msg.body = `${userStore.me?.username}删除了文件夹${storage_idRef.value}内的文件 ${file.name}`;
    }
    chat_Msg.props = {
      strapi: {
        data: {
          is: "storage",
          by_user: userStore.userId,
          storage_id: storage_idRef.value,
          action: "fileRemoved_storage",
          fileRemoved_fileID: file.id,
        },
      },
    };
    if (belonged.value === "card") {
      chat_Msg.props.strapi.data.card_id = teamStore.card.id;
    } else if (belonged.value === "project") {
      chat_Msg.props.strapi.data.project_id = teamStore.project.id;
    }
    // emit('storageUpdate',res_update.data)
    // await send_chat_Msg(chat_Msg);
  }
};
const removeFolder = async (folder) => {
  // console.log('removeFolder');
  let res_remove = await deleteStorage(folder.id);
  if (res_remove) {
    // console.log('res_remove',res_remove);
    // emit('folderRemove',folder.id);
    let chat_Msg = {};
    chat_Msg.props = {
      strapi: {
        data: {
          is: "storage",
          by_user: userStore.userId,
          storage_id: storage_idRef.value,
          folder_id: folder.id,
          action: "storage_remove",
        },
      },
    };
    if (belonged.value === "card") {
      chat_Msg.body = `${userStore.me?.username}删除了卡片 - ${teamStore.card.name} 内的文件夹 ${folder.name}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card.id;
    } else if (belonged.value === "project") {
      chat_Msg.body = `${userStore.me?.username}删除了“项目文件”内的文件夹 ${folder.name}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project.id;
    } else {
      // todo 需要补充文件夹名称
      chat_Msg.body = `${userStore.me?.username}删除了文件夹${storage_idRef.value}内的文件夹 ${folder.name}`;
    }
    // await send_chat_Msg(chat_Msg);
  }
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
const setCardColor = async (i, color) => {
  // console.log('c',i.color_marker);
  if(teamStore.shareInfo) return
  if (!i.color_marker) {
    i.color_marker = [color];
  } else if (color === "clear") {
    i.color_marker = [];
  } else if (i.color_marker?.includes(color)) {
    i.color_marker = i.color_marker.filter((i) => i !== color);
  } else {
    i.color_marker = [...i.color_marker, color];
  }
  updateStorage_params.value.data = {
    color_marker: i.color_marker,
  };

  let res = await updateStorage(i.id, updateStorage_params.value);
  if (res) {
    // masterList.list = masterList?.list.map((j) => ({
    //     ...j,
    //     color_marker: j.id === i.id && color || j.color_marker
    // }))
    let chat_Msg = {
      body: `${userStore.me?.username}修改了文件夹 - ${i.name} 的颜色标记`,
      props: {
        strapi: {
          data: {
            is: "folder",
            by_user: userStore.userId,
            folder_id: i.id,
            action: "update_folder_color",
            color: i.color_marker,
          },
        },
      },
    };
    // await send_chat_Msg(chat_Msg);
  }
};
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};


const val = computed(() => teamStore.income);
watch(val, async(newVal) => {
  if(!newVal) return;
  const { team_id, storage_id, data } = val.value?.data;
  if(teamStore.team?.id === Number(team_id)){
    if(val.value.event === 'storage:updated' && sub_foldersRef.value.id === Number(data.id)){
      masterList.list = masterList?.list.map((i) => ({
        ...i,
        color_marker: i.id === Number(data.id) ? data?.color :i.color_marker,
      }));
    }
  }
});

watch(
  mm_wsStore,
  () => {
    // console.log(mm_wsStore.event);
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        const getCard_actions = [
          "update_folder_color",
          "fileChange_card_storage",
        ];
        const all_folders = masterList?.list
          ?.filter((i) => !i.file)
          .map((j) => j.id);

        const isFolder = strapi.data?.is === "folder";
        const folder_matched = all_folders?.includes(strapi.data?.folder_id);
        const action_matched = getCard_actions.includes(strapi.data?.action);

        if (isFolder && folder_matched && action_matched) {
          masterList.list = masterList?.list.map((i) => ({
            ...i,
            color_marker:
              (i.id === strapi.data?.folder_id && strapi.data?.color) ||
              i.color_marker,
          }));
        }
      }
    }
  },
  { immediate: true, deep: true }
);

// 定义一个响应式的引用，指向div元素
const dropZone = ref(null);

// 定义一个响应式的标志，表示是否显示拖拽区域
const showUpdateArea = ref(false);
// 拖拽进入事件
const handleDragEnter = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  if(teamStore.shareInfo) return
  // 设置标志为true
  showUpdateArea.value = true;
  teamStore.active_folder = storage_idRef.value;
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
  dropZone.value.style.pointerEvents = "auto";
};

// 拖拽移动事件
const handleDragOver = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  if(teamStore.shareInfo) return
  // 设置标志为true
  showUpdateArea.value = true;
  teamStore.active_folder = storage_idRef.value;
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
};

// 拖拽离开事件
const handleDragLeave = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  if(teamStore.shareInfo) return
  // 判断事件目标是否是div元素本身
  if (e.target === dropZone.value) {
    // 设置标志为false
    showUpdateArea.value = false;
    // 设置活动文件夹为null
    teamStore.active_folder = null;
  }
};

// 拖拽释放事件
const droped = ref(false);
const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if(teamStore.shareInfo) return
  if (droped.value) return;
  droped.value = true;
  if (showUpdateArea.value) {
    droped.value = false;
    let items_asfile = e.dataTransfer?.files;
    let items_asitem = e.dataTransfer?.items;
    let files = [];
    let folders = [];
    for (let i = 0; i < items_asfile.length; i++) {
      if (items_asfile[i].type !== "") {
        files.push(items_asfile[i]);
      } else {
        let folder = items_asitem[i].webkitGetAsEntry();
        if (folder.isDirectory) {
          folders.push(folder);
        }
      }
    }
    if (files.length > 0) {
      await onDrop(files);
    }
    if (folders.length > 0) {
      console.log("handleDrop folders", folders);
      for (const folder of folders) {
        console.log("handleDrop folder", folder);
        await batch_upload(folder, storage_idRef.value);
      }
    }
  }
  showUpdateArea.value = false;
  teamStore.active_folder = null;
};

const batch_upload = async (folder, _storage_id) => {
  const res = await process_folder(folder, _storage_id);
  if (res) {
    const queryFolders = Array.from(res.folders);
    if (queryFolders?.length > 0) {
      for (const folder of queryFolders) {
        console.log("queryFolders folder", folder);
        await batch_upload(folder, res.folderID_inStrapi);
      }
    }
  }
};

const process_folder = async (folder, _folderID_inStrapi) => {
  let new_process;
  const create_folder = await createStorageFn(folder, _folderID_inStrapi);
  if (create_folder) {
    const res = await uploadFilesInFolder(folder, create_folder.id);
    console.log("process_folder res", res);
    if (res) {
      new_process = {
        folderID_inStrapi: create_folder.id,
        folders: res.folders,
      };
    }
  }
  console.log("process_folder", new_process);
  return new_process;
};

const uploadFilesInFolder = async (folder, _folderID_inStrapi) => {
  let dirReader = folder.createReader();

  let files = [];
  let folders = [];
  await new Promise((resolve) => {
    dirReader.readEntries(async (entries) => {
      let promises = [];

      for (const i of entries) {
        if (i.isFile) {
          promises.push(
            new Promise((resolve) => {
              i.file((file) => {
                resolve(file);
              });
            })
          );
        } else {
          folders.push(i);
        }
      }
      files = await Promise.all(promises);

      if (files.length > 0) {
        await onDrop(files, _folderID_inStrapi);
      }
      resolve();
    });
  });
  const _res = {
    files: files,
    folders: folders,
  };
  console.log("uploadFilesInFolder", _res);
  return _res;
};

// 监听键盘
const isshift = ref(false);
const isctrl = ref(false);
const keyDown = () => {
  // 键盘按下事件
  document.onkeydown = (e) => {
    //事件对象兼容
    let e1 = e || event || window.event || arguments.callee.caller.arguments[0];
    //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40  回车：13   ctrl：17   shift：16
    switch (e1.keyCode) {
      case 16:
        e.preventDefault();
        isshift.value = true; // 如果shift按下就让他按下的标识符变为true
        break;
      case 17:
        e.preventDefault();
        isctrl.value = true; // 如果ctrl按下就让他按下的标识符变为true
        break;
    }
  };
  // 键盘抬起事件
  document.onkeyup = (e) => {
    //事件对象兼容
    let e1 = e || event || window.event || arguments.callee.caller.arguments[0];
    switch (e.keyCode) {
      case 16:
        e.preventDefault();
        masterList.lastSelectedIndex = "";
        isshift.value = false; // 如果shift抬起下就让他按下的标识符变为false
        break;
      case 17:
        e.preventDefault();
        isctrl.value = false; // 如果ctrl抬起下就让他按下的标识符变为false
        break;
    }
  };
};

// 定义点击事件处理函数
const handleClick = (index) => {
  // 获取当前点击的元素
  const item = masterList.list[index];
  // 判断按键类型
  if (isctrl.value) {
    emit("closeSubFolder");
    // console.log('ctrlKey');
    // 按住Ctrl键，切换当前元素的选中状态，不影响其他元素
    if (batch_selected_ids.value.includes(item.id)) {
      batch_selected_ids.value = selected_ids.value.filter((i) => i !== item.id);
      batch_selected.value = selected.value.filter((i) => i.id !== item.id);
    } else {
      batch_selected.value.push(item);
      batch_selected_ids.value.push(item.id);
    }
    // 更新上一次选中的索引
    masterList.lastSelectedIndex = index;
  } else if (isshift.value) {
    emit("closeSubFolder");
    // console.log('shiftKey');
    // 按住Shift键，选中当前元素和上一次选中元素之间的所有元素，不影响其他元素
    // 获取起始和结束的索引
    let start;
    let end;
    if (masterList.lastSelectedIndex === -1) {
      masterList.lastSelectedIndex = index;
      selected.value = [masterList.list[index]];
      selected_ids.value = [masterList.list[index].id];
      start = index;
    } else {
      batch_selected.value = [];
      batch_selected_ids.value = [];
      start = masterList.lastSelectedIndex;
      end = index;
    }
    // 遍历并选中元素
    for (let i = start; i <= end; i++) {
      batch_selected.value.push(masterList.list[i]);
      batch_selected_ids.value.push(masterList.list[i].id);
    }
  } else {
    // 没有按键，只选中当前元素，取消其他元素的选中状态
    // 遍历并重置元素
    for (let i = 0; i < masterList.list.length; i++) {
      batch_selected.value = [masterList.list[index]];
      batch_selected_ids.value = [masterList.list[index].id];
    }
    // 更新上一次选中的索引
    masterList.lastSelectedIndex = index;
  }
};

const clickColumn = () => {
  teamStore.active_folder = storage_idRef.value;
  openItemMenu.value = null;
  // console.log('removeSelected');
  batch_selected.value = [];
  batch_selected_ids.value = [];
  closeSubFolder();
};

watchEffect(() => {
  if (isActivedFolder.value) {
    keyDown();
  }
});
// 在组件挂载时，绑定事件监听器到div元素上
onMounted(() => {
  if(!readOnly.value){
    // 获取div元素的引用
    dropZone.value = document.querySelector(`.drop-zone_${storage_idRef.value}`);
    // 绑定事件监听器到div元素上
    dropZone.value.addEventListener("dragenter", handleDragEnter, false);
    dropZone.value.addEventListener("dragover", handleDragOver, false);
    dropZone.value.addEventListener("dragleave", handleDragLeave, false);
    dropZone.value.addEventListener("drop", handleDrop, false);
  }
});

// 在组件卸载时，移除事件监听器
onUnmounted(() => {
  teamStore.active_folder = null;
  if(!readOnly.value) {
    // 移除事件监听器
    dropZone.value.removeEventListener("dragenter", handleDragEnter, false);
    dropZone.value.removeEventListener("dragover", handleDragOver, false);
    dropZone.value.removeEventListener("dragleave", handleDragLeave, false);
    dropZone.value.removeEventListener("drop", handleDrop, false);
  }
});
</script>
<style>
.drag-select,
.drag-select__wrapper {
  width: 100%;
  height: 100%;
}
</style>
