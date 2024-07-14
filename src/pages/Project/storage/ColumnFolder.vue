<template>
  <q-splitter
    v-model="splitterModel"
    unit="px"
    :limits="[180, 800]"
    class="absolute-full"
  >
    <template v-slot:before>
      <div
        class="absolute-full q-mb-xs"
        :class="
          storage_idRef == projectStore.active_folder
            ? 'border-xs border-solid border-primary'
            : 'border-placeholder'
        "
        @click="hideContextMenu()"
      >
        <!-- <span class="op-3">{{ subsRef }}</span> -->
        <FolderContainer
          :sub_files="subsRef.storage_files"
          :sub_folders="subsRef.sub_folders"
          :storage_id="storage_idRef"
          :opened_folder="opened_folder"
          :belonged="belonged"
          :by
          :authBase
          @enterFolder="enterFolder"
          @storageUpdate="storageUpdate"
          @folderRemove="folderRemove"
          @closeSubFolder="closeSubFolder"
        >
          <template
            v-if="
              storage_idRef == projectStore.active_folder &&
              projectStore.create_folder_ing &&
              calc_auth(authBase?.collection, 'sub_folders', authBase?.of)
            "
            v-slot:create_folder
          >
            <q-input
              v-model="params.data.name"
              dense
              square
              filled
              autofocus
              type="text"
              placeholder="文件夹名字"
              ref="new_folder"
              @click.stop="focusNewFolder()"
              @keyup.enter="createStorageFn()"
              @keyup.esc="projectStore.create_folder_ing = false"
            >
              <template v-slot:append>
                <q-btn
                  color="primary"
                  flat
                  dense
                  size="sm"
                  round
                  icon="check"
                  @click="createStorageFn()"
                />
              </template>
            </q-input>
          </template>
        </FolderContainer>
        <q-popup-proxy contextMenu ref="contextMenu">
          <q-list dense bordered class="radius-sm q-pa-xs">
            <q-item
              clickable
              v-ripple
              class="radius-xs"
              @click="createFolder()"
              v-close-popup
            >
              <q-item-section side>
                <q-icon name="create_new_folder" />
              </q-item-section>
              <q-item-section>新建文件夹</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
        <!-- {{ projectStore.project?.id }} -->
      </div>
    </template>
    <template v-slot:after>
      <ColumnFolder
        v-if="folder"
        :subs="folder"
        :storage_id="folder.id"
        belonged="storage"
      />
    </template>
  </q-splitter>
</template>

<script setup>
import { ref, watch, toRefs, nextTick, inject, watchEffect } from "vue";
import FolderContainer from "./FolderContainer.vue";
import ColumnFolder from "./ColumnFolder.vue";
import { createStorage } from "src/api/strapi/project.js";
import { useFetchStorage } from "src/hooks/project/useFetchStorage.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
import { computed } from "vue";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
const { userId } = useMatedate;

const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const emit = defineEmits(["storageUpdate"]);
const props = defineProps({
  subs: {
    type: Object,
    default() {
      return {};
    },
  },
  storage_id: {
    type: Number,
    default: NaN,
  },
  belonged: {
    type: String,
    default: "storage",
  },
});
const splitterModel = ref(240);
const { subs: subsRef, storage_id: storage_idRef, belonged } = toRefs(props);
const by = inject("by");
const authBase = ref({
  collection: "",
  of: "",
});
const card_users_ids = computed(() =>
  projectStore.card.card_members.map((i) => i.by_user.id)
);
const current_user_id = computed(() => userId?.value);
watchEffect(() => {
  if (by === "project") {
    authBase.value = {
      collection: "storage",
      of: "project",
    };
  }
  if (by === "card") {
    if (card_users_ids.value.includes(current_user_id.value)) {
      authBase.value = {
        collection: "storage",
        of: "card",
      };
    } else {
      authBase.value = {
        collection: "card_storage",
        of: "project",
      };
    }
  }
});
const folder = ref();
const new_folder = ref();
const focusNewFolder = () => {
  nextTick(() => {
    new_folder.value.focus();
  });
};
const contextMenu = ref();
const hideContextMenu = () => {
  contextMenu.value.hide();
};
const opened_folder = ref();

const createFolder = () => {
  projectStore.create_folder_ing = true;
  focusNewFolder();
};

const process_floderInner = (folder) => {
  return {
    id: folder.id,
    storage_files:
      folder.storage_files?.map((i) => ({
        ...i,
        url: i.file?.url,
        ext: i.file?.ext,
      })) || [],
    sub_folders: folder.sub_folders || [],
  };
};

const enterFolder = async (val) => {
  // console.log(val);
  // let res = await findOneStorageFn(val.id);
  let res = await useFetchStorage(val.id);
  if (res) {
    // console.log("useFetchStorage", res);
    folder.value = res;

    projectStore.active_folder = val.id;
    opened_folder.value = val.id;
  }
};
// todo 需要进一步优化，ws通知其他同时打开着当前storage的用户重新获取当前storage的数据
const storageUpdate = async (res) => {
  folder.value = process_floderInner(res);
};
const folderRemove = (id) => {
  // console.log("folderRemove", id);
  subsRef.value.sub_folders = subsRef.value.sub_folders.filter(
    (i) => i.id != id
  );
  if (folder.value?.id === id) {
    folder.value = null;
  }
};

let params = ref({
  // storage_id: storage_idRef.value,
  data: {
    name: "",
  },
});
const loading = ref(false);
const createStorageFn = async () => {
  if (loading.value || !params.value.data.name) return;
  // params.value.project_id = projectStore.project.id;
  loading.value = true;
  if (belonged.value === "project") {
    params.value.data.assign_project = projectStore.project.id;
  } else if (belonged.value === "card") {
    params.value.data.assign_card = projectStore.card.id;
  } else if (belonged.value === "user") {
    params.value.data.assign_user = userStore.userId;
  } else if (belonged.value === "storage") {
    params.value.data.assign_storage = storage_idRef.value;
  }

  console.log("params", params.value);
  let res = await createStorage(params.value);
  if (res) {
    // subsRef.value.sub_folders.push(res.data);
    projectStore.create_folder_ing = false;
    params.value.data.name = "";
    loading.value = false;

    let chat_Msg;
    if (projectStore.card) {
      chat_Msg = {
        body: `${userStore.me.username}在卡片：${projectStore.card.name}下 ID为：${storage_idRef.value}的文件夹内新建了文件夹：${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "storage",
              by_user: userStore.userId,
              card_id: projectStore.card.id,
              storage_id: storage_idRef.value,
              action: "create_storage",
              storage: res.data,
            },
          },
        },
      };
    } else {
      chat_Msg = {
        body: `${userStore.me.username}在“项目文件内”，ID为：${storage_idRef.value}的文件夹内新建了文件夹：${res.data.name}`,
        props: {
          strapi: {
            data: {
              is: "storage",
              by_user: userStore.userId,
              project_id: projectStore.project.id,
              storage_id: storage_idRef.value,
              action: "create_storage",
              storage: res.data,
            },
          },
        },
      };
    }
    send_chat_Msg(chat_Msg);
  }
};
const closeSubFolder = () => {
  folder.value = null;
  opened_folder.value = null;
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};
watch(mm_wsStore, async () => {
  if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
    let post =
      mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
    if (!post) return;
    let strapi = post?.props?.strapi;
    if (strapi) {
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "create_storage"
      ) {
        // console.log("create_storage");
        // subsRef.value.sub_folders.push(strapi.data.storage);
        subsRef.value.sub_folders = [
          ...subsRef.value.sub_folders,
          strapi.data.storage,
        ];
      }
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "storage_remove"
      ) {
        // console.log("storage_remove", strapi.data.folder_id);
        subsRef.value.sub_folders = subsRef.value.sub_folders.filter(
          (i) => i.id != strapi.data.folder_id
        );
        if (folder.value?.id === strapi.data.folder_id) {
          folder.value = null;
        }
      }
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "fileChange_storage"
      ) {
        // console.log("fileChange_storage", strapi.data.changed_data);
        subsRef.value.storage_files = strapi.data.changed_data.files;
        subsRef.value.sub_folders = strapi.data.changed_data.sub_folders;
      }
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "fileUploaded_storage"
      ) {
        // console.log("fileUploaded_storage", strapi.data.changed_data);
        const sub_files = subsRef.value?.storage_files;
        if (sub_files) {
          subsRef.value.storage_files = [
            ...subsRef.value?.storage_files,
            ...strapi.data.changed_data.files,
          ];
        } else {
          subsRef.value.storage_files = strapi.data.changed_data.files;
        }
      }
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "fileRemoved_storage"
      ) {
        // console.log("fileRemoved_storage", strapi.data.changed_data);
        subsRef.value.storage_files = subsRef.value.storage_files.filter(
          (i) => i.id != strapi.data.fileRemoved_fileID
        );
      }
      if (
        strapi.data?.is === "storage" &&
        strapi.data.storage_id === storage_idRef.value &&
        strapi.data.action === "subfloder_created"
      ) {
        subsRef.value.sub_folders.push(strapi.data.subfloder);
      }
    }
  }
});
watch(
  storage_idRef,
  () => {
    if (storage_idRef.value) {
      folder.value = null;
    }
  },
  { immediate: false, deep: false }
);
</script>
