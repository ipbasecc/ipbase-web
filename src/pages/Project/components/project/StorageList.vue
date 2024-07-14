<template>
  <q-scroll-area v-if="storages" class="fit">
    <q-list class="full-width q-pa-xs">
      <q-item
        v-for="i in storages"
        :key="i.id"
        clickable
        v-ripple
        class="radius-xs"
        :class="activeStorage === i.id ? 'border' : 'border-placeholder'"
        :active-class="`${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`"
        @click="enterStorage(i.id)"
      >
        <q-item-section side>
          <q-icon name="mdi-server-network" />
        </q-item-section>
        <template v-if="updateTarget === i.id">
          <q-item-section>
            <q-input
              v-model="update_parmas.data.name"
              dense
              flat
              square
              autofocus
              type="text"
              class="full-width"
              @keydown.esc="updateTarget = null"
              @keyup.enter.prevent="updateFn(i)"
          /></q-item-section>
        </template>
        <template v-else>
          <q-item-section>{{ i.name }}</q-item-section>
        </template>
        <q-popup-proxy context-menu class="radius-sm">
          <q-list bordered dense class="radius-sm q-pa-xs">
            <q-item
              clickable
              v-ripple
              v-close-popup
              class="radius-xs"
              @click.stop="changeName(i)"
            >
              <q-item-section side>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section class="q-pr-md">重命名</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              v-close-popup
              class="radius-xs"
              @click.stop="deleteFn(i)"
            >
              <q-item-section side>
                <q-icon name="close" />
              </q-item-section>
              <q-item-section class="q-pr-md">删除</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-item>
      <q-item
        v-if="!creating"
        clickable
        v-ripple
        class="hovered-item radius-xs"
        @click="creating = true"
      >
        <q-item-section side>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section class="hover-show transition">
          新建存储
        </q-item-section>
      </q-item>
      <q-item v-else class="radius-xs border q-pa-xs">
        <q-item-section>
          <q-input
            v-model="create_parmas.data.name"
            dense
            flat
            square
            autofocus
            class="full-width"
            @keydown.esc="cancelCreate()"
            @blur="cancelCreate()"
            @keyup.enter.prevent="createFn()"
            filled
            type="text"
            placeholder="存储名称"
          >
            <template v-slot:prepend>
              <q-item-section side>
                <q-icon name="mdi-server-network" />
              </q-item-section>
            </template>
            <template v-if="create_parmas.data.name" v-slot:append>
              <q-btn
                flat
                round
                dense
                size="xs"
                icon="check"
                :disable="loading"
                @click="createFn()"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";

import { fetch_MmMe } from "src/hooks/global/useFetchme.js";
import { computed } from "vue";

import {
  createStorage,
  updateStorage,
  deleteStorage,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import { useCardname } from "src/hooks/project/useCardname.js";

const props = defineProps({
  storages: {
    type: Array,
    default() {
      return [];
    },
  },
  belonged: {
    type: String,
    default: "project",
  },
  card: {
    type: Object,
    default() {
      return {};
    },
  },
  user: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { storages, belonged, card, user } = toRefs(props);
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const mm_user_id = ref();
fetch_MmMe()
  .then((res) => {
    mm_user_id.value = res.id;
  })
  .catch((e) => console.error(e));

const activeStorage = ref();
const route_params = computed(() => Number(route.params?.storage_id));
const enterStorage = async (storage_id) => {
  if (!projectStore.project?.id || route_params.value === storage_id) return;
  activeStorage.value = storage_id;
  router.push(`/projects/${projectStore.project.id}/storage/${storage_id}`);
};

watch(
  route_params,
  () => {
    if (route_params.value) {
      activeStorage.value = route_params.value;
    }
  },
  { immediate: true, deep: false }
);

const creating = ref(false);
const create_parmas = ref({
  data: {
    name: "",
  },
});
const updateTarget = ref();
const update_parmas = ref({
  data: {
    name: "",
  },
});
const loading = ref(false);
const createFn = async () => {
  if (loading.value) return;
  creating.value = false;
  loading.value = true;
  if (belonged.value === "project") {
    create_parmas.value.data.assign_project = projectStore.project.id;
  }
  if (belonged.value === "card") {
    create_parmas.value.data.assign_card = card.value.id;
  }
  if (belonged.value === "user") {
    create_parmas.value.data.assign_user = user.value.id;
  }
  const res = await createStorage(create_parmas.value);
  if (res) {
    create_parmas.value.data.name = "";
    if (belonged.value === "user") {
      userStore.storages.push(res.data);
    } else {
      let chat_Msg = {
        props: {
          strapi: {
            data: {
              is: "storage",
              by_user: userStore.userId,
              action: "storage_created",
              storage: res.data,
            },
          },
        },
      };
      if (belonged.value === "project") {
        chat_Msg.body = `${userStore.me?.username}在“项目文件”中新建了存储: ${res.data?.name}`;
        chat_Msg.props.strapi.data.project_id = projectStore.project.id;
      }
      if (belonged.value === "card") {
        chat_Msg.body = `${userStore.me?.username}为卡片:${useCardname(
          card.value
        )}新建了存储: ${res.data?.name}`;
        chat_Msg.props.strapi.data.card_id = card.value.id;
      }
      await send_chat_Msg(chat_Msg);
    }
    loading.value = false;
  }
};
const cancelCreate = () => {
  creating.value = false;
  create_parmas.value.data.name = "";
};
const deleteFn = async (i) => {
  let res = await deleteStorage(i.id);
  if (belonged.value === "user") {
    userStore.storages = userStore.storages.filter((j) => j.id != i.id);
  } else {
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: "storage",
            by_user: userStore.userId,
            action: "storage_deleted",
            storage_id: i.id,
          },
        },
      },
    };
    if (belonged.value === "project") {
      chat_Msg.body = `${userStore.me?.username}在“项目文件”中删除了存储: ${i.name}`;
      chat_Msg.props.strapi.data.project_id = projectStore.project.id;
    }
    if (belonged.value === "card") {
      chat_Msg.body = `${userStore.me?.username}为删除了卡片:${useCardname(
        card.value
      )}的存储: ${i.name}`;
      chat_Msg.props.strapi.data.card_id = card.value.id;
    }
    await send_chat_Msg(chat_Msg);
  }
};
const changeName = (i) => {
  update_parmas.value.data.name = i.name;
  updateTarget.value = i.id;
};
const updateFn = async (i) => {
  if (loading.value) return;
  updateTarget.value = null;
  loading.value = true;
  let res = await updateStorage(i.id, update_parmas.value);
  if (res) {
    loading.value = false;
    create_parmas.value.data.name = "";
    if (belonged.value === "user") {
      userStore.storages.push(res.data);
      let index = userStore.storages.findIndex((j) => j.id === i.id);
      if (index !== -1) {
        userStore.storages[index] = res.data;
      }
    } else {
      let chat_Msg = {
        props: {
          strapi: {
            data: {
              is: "storage",
              by_user: userStore.userId,
              action: "storage_updated",
              storage: res.data,
            },
          },
        },
      };
      if (belonged.value === "project") {
        chat_Msg.body = `${userStore.me?.username}将“项目文件”中存储: ${i.name}改名为： ${res.data?.name}`;
        chat_Msg.props.strapi.data.project_id = projectStore.project.id;
      }
      if (belonged.value === "card") {
        chat_Msg.body = `${userStore.me?.username}将卡片：${useCardname(
          card.value
        )} 的存储: ${i.name} 改名为: ${res.data?.name}`;
        chat_Msg.props.strapi.data.card_id = card.value.id;
      }
      await send_chat_Msg(chat_Msg);
    }
  }
};
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

watch(
  mm_wsStore,
  async () => {
    // console.log(mm_wsStore.event);
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data.is === "storage" &&
          strapi.data.project_id === projectStore.project.id &&
          strapi.data.action === "storage_created"
        ) {
          projectStore.project.storages.push(strapi.data.storage);
        }
        if (
          strapi.data.is === "storage" &&
          strapi.data.card_id === card.value.id &&
          strapi.data.action === "storage_created"
        ) {
          card.value.storage = strapi.data.storage;
        }
        if (
          strapi.data.is === "storage" &&
          strapi.data.project_id === projectStore.project.id &&
          strapi.data.action === "storage_deleted"
        ) {
          projectStore.project.storages = projectStore.project.storages.filter(
            (i) => i.id != strapi.data.storage_id
          );
        }
        if (
          strapi.data.is === "storage" &&
          strapi.data.card_id === card.value.id &&
          strapi.data.action === "storage_deleted"
        ) {
          card.value.storage = null;
        }
        if (
          strapi.data.is === "storage" &&
          strapi.data.project_id === projectStore.project.id &&
          strapi.data.action === "storage_updated"
        ) {
          let index = projectStore.project.storages.findIndex(
            (j) => j.id === strapi.data.storage.id
          );
          if (index !== -1) {
            projectStore.project.storages[index] = strapi.data.storage;
          }
        }
        if (
          strapi.data.is === "storage" &&
          strapi.data.card_id === card.value.id &&
          strapi.data.action === "storage_updated"
        ) {
          card.value.storage = strapi.data.storage;
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
