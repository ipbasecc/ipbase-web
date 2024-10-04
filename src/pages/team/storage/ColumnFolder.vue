<template>
  <q-splitter
    v-model="splitterModel"
    unit="px"
    :limits="limits"
    class="absolute-full"
    ref="separatorRef"
  >
    <template v-slot:before>
      <div
        class="absolute-full q-mb-xs"
        :class="
          storage_idRef === teamStore.active_folder
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
          :splitterModel
          :readOnly
          @enterFolder="enterFolder"
          @previewFile="previewFile"
          @storageUpdate="storageUpdate"
          @folderRemove="folderRemove"
          @closeSubFolder="closeSubFolder"
          @removeItem="removeItem"
        >
          <template
            v-if="
              !readOnly &&
              storage_idRef === teamStore.active_folder &&
              teamStore.create_folder_ing &&
              useAuths('sub_folders', [authBase?.collection])
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
              :placeholder="$t('folder_name')"
              ref="new_folder"
              @click.stop="focusNewFolder()"
              @keyup.enter="createStorageFn()"
              @keyup.esc="teamStore.create_folder_ing = false"
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
        <q-popup-proxy v-if="!teamStore.shareInfo" contextMenu ref="contextMenu">
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
              <q-item-section>{{ $t('new_folder') }}</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
        <!-- {{ teamStore.project?.id }} -->
      </div>
    </template>
    <template v-slot:separator>
      <div class="fit" :class="isEnter ? 'bg-primary' : ''"></div>
    </template>
    <template v-slot:after>
      <ColumnFolder
        v-if="folder"
        :subs="folder"
        :storage_id="folder.id"
        belonged="storage"
      />
      <FileViewer
        v-if="file && removeItemId !== file.id"
        :file
        :by_width="true"
        @fullscreenWeb="fullscreenWeb"
      />
      <!-- todo 此处需要增加显示文件元数据 -->
    </template>
  </q-splitter>
</template>

<script setup>
import {
  ref,
  watch,
  toRefs,
  computed,
  nextTick,
  inject,
  watchEffect,
  onMounted,
  onUnmounted,
} from "vue";
import FolderContainer from "./FolderContainer.vue";
import ColumnFolder from "./ColumnFolder.vue";
import { createStorage } from "src/api/strapi/project.js";
import { useFetchStorage } from "src/hooks/project/useFetchStorage.js";
import FileViewer from "../../../components/VIewComponents/FileViewer.vue";
import {
  userStore,
  teamStore,
  uiStore,
} from "src/hooks/global/useStore.js";

const userId = computed(() => teamStore.init?.id);

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
  readOnly: {
    type: Boolean,
    default: false,
  },
});
const splitterModel = ref(240);
const limits = ref([180, 800]);
const { subs: subsRef, storage_id: storage_idRef, belonged } = toRefs(props);
const by = inject("by");
const authBase = ref({
  collection: "",
  of: "",
});
const card_users_ids = computed(() =>
  teamStore.card?.card_members?.map((i) => i.by_user.id)
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
    if (card_users_ids.value?.includes(current_user_id.value)) {
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
  contextMenu.value?.hide();
};
const opened_folder = ref();

const createFolder = () => {
  teamStore.create_folder_ing = true;
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

    teamStore.active_folder = val.id;
    opened_folder.value = val.id;
  }
};
const file = ref();
const previewFile = (val) => {
  file.value = val;
};
// todo 需要进一步优化，ws通知其他同时打开着当前storage的用户重新获取当前storage的数据
const storageUpdate = async (res) => {
  folder.value = process_floderInner(res);
};
const folderRemove = (id) => {
  // console.log("folderRemove", id);
  subsRef.value.sub_folders = subsRef.value.sub_folders.filter(
    (i) => i.id !== id
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
  // params.value.project_id = teamStore.project.id;
  loading.value = true;
  if (belonged.value === "project") {
    params.value.data.assign_project = teamStore.project.id;
  } else if (belonged.value === "card") {
    params.value.data.assign_card = teamStore.card.id;
  } else if (belonged.value === "user") {
    params.value.data.assign_user = userStore.userId;
  } else if (belonged.value === "storage") {
    params.value.data.assign_storage = storage_idRef.value;
  }

  console.log("params", params.value);
  let res = await createStorage(params.value);
  if (res) {
    // subsRef.value.sub_folders.push(res.data);
    teamStore.create_folder_ing = false;
    params.value.data.name = "";
    loading.value = false;
  }
};
const closeSubFolder = () => {
  folder.value = null;
  opened_folder.value = null;
};
const removeItemId = ref()
const removeItem = (i) => {
  removeItemId.value = i.file?.id
};

const restore = splitterModel.value;
const _projectLeftDrawer = uiStore.projectLeftDrawer;
const fullscreenWeb = (state) => {
  splitterModel.value = state ? 0 : restore;
  limits.value = state ? [0, 0] : [180, 800];
  uiStore.projectLeftDrawer = state ? false : _projectLeftDrawer;
};


const val = computed(() => teamStore.income);
watch(val, async(newVal) => {
  if(!newVal) return;
  const { team_id, parent_storage_id, data } = val.value?.data;
  if(teamStore.team?.id === Number(team_id)){
    const _sub_folders_ids = subsRef.value.sub_folders.map(i => i.id);
    if(val.value.event === 'storage:updated'){
      if(_sub_folders_ids.includes(Number(data.id))){
        subsRef.value.sub_folders = subsRef.value.sub_folders.map(i => {
          if(i.id === Number(data.id)){
            return data;
          }
          return i;
        });
      }
    }
    if(val.value.event === 'storage:created' && storage_idRef.value === Number(parent_storage_id)){
      subsRef.value.sub_folders = [
        ...subsRef.value.sub_folders,
        data,
      ];
    }
    if(val.value.event === 'storage:removed'){
      if(_sub_folders_ids.includes(Number(data.removed_storage_id))){
        subsRef.value.sub_folders = subsRef.value.sub_folders.filter(
          (i) => i.id !== Number(data.removed_storage_id)
        );
      }
      if (storage_idRef.value === Number(data.removed_storage_id)) {
        folder.value = null;
      }
    }
    if(val.value.event === 'file:removed'){
      const _sub_files_ids = subsRef.value.storage_files.map(i => i.id);
      if(_sub_files_ids.includes(Number(data.removed_file_id))){
        subsRef.value.storage_files = subsRef.value.storage_files.filter(
          (i) => i.id !== Number(data.removed_file_id)
        );
      }
    }
    if(val.value.event === 'file:batchCreated'){
      if(!data || data?.length === 0) return;
      data.map(i => {
        if(i.storage_id === storage_idRef.value){
          subsRef.value.storage_files.push(i);
        }
      })
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
const isEnter = ref(false);
const separatorRef = ref(null);
onMounted(() => {
  const separatorElement = separatorRef.value?.$el.querySelector(
    ".q-splitter__separator"
  );
  if (!separatorElement) {
    console.error("没有找到class为q-splitter__separator的div");
    return;
  }

  separatorElement.addEventListener("mouseenter", () => {
    isEnter.value = true;
  });

  separatorElement.addEventListener("mouseleave", (event) => {
    if (!event.buttons) {
      // 如果鼠标没有按下
      isEnter.value = false;
    } else {
      setTimeout(() => {
        isEnter.value = false;
      }, 10000);
    }
  });
});
onUnmounted(() => {
  const separatorElement = separatorRef.value?.$el.querySelector(
    ".q-splitter__separator"
  );
  if (separatorElement) {
    separatorElement.removeEventListener("mouseenter", () => {});
    separatorElement.removeEventListener("mouseleave", () => {});
    separatorElement.removeEventListener("mousedown", () => {});
  }
  document.removeEventListener("mouseup", () => {});
});
</script>
