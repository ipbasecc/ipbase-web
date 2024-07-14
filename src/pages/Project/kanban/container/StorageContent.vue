<template>
  <div v-if="projectStore.card" class="fit column no-wrap article">
    <!-- 附加存储在新建card时默认会直接创建、此处仅防止万一真没有存储时，用户可以手动附加 -->
    <template v-if="!projectStore.card.storage">
      <div class="fit column flex-center">
        <div class="column no-wrap items-start">
          <h4>附加存储</h4>
          <span class="op-5"
            >当前卡片尚未附加任何存储，您可以在此为其附加一个存储功能，以便可以在卡片内附加文件</span
          >
          <div class="radius-xs border q-pa-xs q-my-xl">
            <q-input
              v-model="attachStorage_params.data.name"
              dense
              square
              filled
              type="text"
              placeholder="存储名称"
              @keyup.enter="attachStorage()"
              style="min-width: 18rem"
            >
              <template v-slot:append v-if="attachStorage_params.data.name">
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="add"
                  @click="attachStorage()"
                />
              </template>
            </q-input>
          </div>
          <q-btn
            color="primary"
            icon="check"
            label="确认"
            padding="xs xl xs sm"
            :disable="!attachStorage_params.data.name"
            @click="attachStorage()"
          />
        </div>
      </div>
    </template>
    <template v-else>
      <q-bar class="transparent border-bottom q-px-xs" style="height: 2.3rem">
        <q-btn
          v-if="calc_auth('card_storage', 'sub_folders', authBase.of)"
          flat
          dense
          icon="folder"
          label="新建文件夹"
          :disable="!projectStore.active_folder"
          padding="xs sm"
          class="text-no-wrap"
          @click="createFolder()"
        />
        <q-btn
          v-if="
            projectStore.selected?.length > 0 &&
            calc_auth('card_storage', 'modify', authBase.of)
          "
          flat
          dense
          icon="delete"
          label="删除"
          class="text-no-wrap"
          @click="batch_remove()"
        />
        <q-space />
        <q-btn
          v-if="calc_auth('project', 'manageRole', authBase.of)"
          flat
          dense
          padding="sm"
          icon="tune"
          @click="card_setting = true"
        />
      </q-bar>
      <div
        v-if="calc_auth('card_storage', 'read', authBase.of)"
        class="full-height row no-wrap"
      >
        <ColumnFolder
          :subs="subs"
          :storage_id="projectStore.card?.storage?.id"
          belonged="card"
          class="q-space"
        />
      </div>
    </template>
    <q-dialog
      v-if="calc_auth('project', 'manageRole', authBase.of)"
      v-model="card_setting"
      persistent
    >
      <q-card bordered style="min-width: 61dvw">
        <CardSettings :isCard="true" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watchEffect, computed, inject } from "vue";

import {
  updateCard,
  createStorage,
  updateStorage,
  deleteStorage,
  findCard,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";

import CardSettings from "src/pages/Project/Card/components/CardSettings.vue";

import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";

import ColumnFolder from "src/pages/Project/components/widgets/ColumnFolder.vue";

import _ from "lodash";
import useMmws from "src/stores/mmws.js";
const mm_wsStore = useMmws();

const projectStore = useProjectStore();
const userStore = useUserStore();
const $q = useQuasar();
const route = useRoute();

const card_setting = ref(false);
const cardRef = ref(projectStore.card);
const subs = computed(() => ({
  sub_files: projectStore.card.storage?.files || [],
  sub_folders: projectStore.card.storage?.sub_folders || [],
}));

const authBase = inject("authBase");

const subs_key = ref(0);

const getCard = async (card_id) => {
  let res = await findCard(card_id, projectStore.project.id);
  if (res) {
    console.log(res?.data);
    subs_key.value++;

    projectStore.card = res.data;
    projectStore.activedCard_id = res?.data?.id;
    projectStore.cards = projectStore.cards.map(
      (i) => (i.id === cardRef.value.id && res?.dat) || i
    );
  }
};

const updateParmars = reactive({
  project_id: route.params.proj_id,
  data: {},
});

const updateCardFn = async () => {
  let res = await updateCard(cardRef.value.id, updateParmars);
  if (res?.data) {
    return res.data;
  } else {
    $q.notify("保存出错");
  }
};

const createFolder = () => {
  projectStore.create_folder_ing = true;
};
const attachStorage_params = ref({
  project_id: projectStore.project.id,
  card_id: projectStore.card.id,
  data: {
    name: `${projectStore.card.name}的存储`,
    belonged_card: projectStore.card.id,
  },
});
const attachStorage = async () => {
  if (!attachStorage_params.value.data.name) return;
  let res = await createStorage(attachStorage_params.value);
  if (res) {
    projectStore.card.storage = res.data;

    let chat_Msg = {
      body: `${userStore.me.username}为：${projectStore.card.name}附加了存储：${res.data.name}`,
      props: {
        strapi: {
          data: {
            is: "card",
            by_user: userStore.userId,
            card_id: projectStore.card.id,
            action: "fileChange_card_storage",
          },
        },
      },
    };
    send_chat_Msg(chat_Msg);
  }
};

const batch_remove = async () => {
  if (projectStore.selected.length === 0) return;
  let file_msg;
  const pcss_files = async () => {
    let files = projectStore.selected.filter((i) => i.url);
    if (files.length === 0) return true;
    file_msg = `文件：${files.map((i) => i.name)}`;
    if (files.length > 0) {
      let remove_storageFiles = files.map((i) => Number(i.id));
      // 使用then来处理removeFile的结果，如果成功，返回true，否则返回false
      return removeFile(remove_storageFiles)
        .then((result) => {
          if (result) {
            return true;
          } else {
            return false;
          }
        })
        .catch((error) => {
          // 使用catch来处理removeFile的错误，打印错误信息，返回false
          console.error(error);
          return false;
        });
    }
  };
  let folder_msg;
  const pcss_folders = async () => {
    let folders = projectStore.selected.filter((i) => !i.url);
    if (folders.length === 0) return true;
    folder_msg = `文件夹：${folders.map((i) => i.name)}`;
    if (folders.length > 0) {
      let promieses = folders.map((i) => {
        console.log(i);
        // 使用then来处理removeFolder的结果，如果成功，返回true，否则返回false
        return removeFolder(i)
          .then((result) => {
            if (result) {
              return true;
            } else {
              return false;
            }
          })
          .catch((error) => {
            // 使用catch来处理removeFolder的错误，打印错误信息，返回false
            console.error(error);
            return false;
          });
      });
      // 使用Promise.all来等待所有的promises都完成，然后检查它们的结果，如果都成功，返回true，否则返回false
      return Promise.all(promieses)
        .then((results) => {
          if (results.every((r) => r)) {
            return true;
          } else {
            return false;
          }
        })
        .catch((error) => {
          // 使用catch来处理Promise.all的错误，打印错误信息，返回false
          console.error(error);
          return false;
        });
    }
  };
  // 使用await来等待pcss_files和pcss_folders的结果，如果都为true，才执行send_chat_Msg
  let __ = await pcss_folders();
  if (__) {
    let _ = await pcss_files();
    if (_) {
      let chat_Msg = {
        body: `${userStore.me.username} 删除了 ${file_msg} ${folder_msg}`,
        props: {
          strapi: {
            data: {
              is: "card",
              by_user: userStore.userId,
              card_id: projectStore.card.id,
              action: "fileChange_card_storage",
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  }
};

const updateStorage_params = ref({
  project_id: projectStore.project.id,
  card_id: projectStore.card.id,
  storage_id: null,
});
watchEffect(() => {
  updateStorage_params.value.storage_id = projectStore?.active_folder;
});

const removeFile = async (remove_storageFiles) => {
  if (remove_storageFiles.length === 0) return;
  updateStorage_params.value.data = {
    remove_storageFiles: remove_storageFiles,
  };
  let res_upload = await updateStorage(
    projectStore.active_folder,
    updateStorage_params.value
  );
  if (res_upload) {
    return true;
  }
};
const removeFolder = async (folder) => {
  if (!folder.id) return;
  let res_remove = await deleteStorage(
    folder.id,
    projectStore.project.id,
    projectStore.card.id
  );
  if (res_remove) {
    return true;
  }
};

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

// watch(mm_wsStore, async () => {
//     // console.log(mm_wsStore.event);
//     if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
//         let post = mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
//         if(!post) return
//         let strapi = post?.props?.strapi;
//         if(strapi){
//             const getCard_actions = ['storage_remove'];

//             const card_matched = strapi.data?.card_id === cardRef.value.id;
//             const action_matched = getCard_actions.includes(strapi.data.action);

//             if(card_matched && action_matched) {
//                 await getCard(projectStore.card.id);
//             }
//         }
//     }
// }, { immediate: true, deep: true });
</script>
