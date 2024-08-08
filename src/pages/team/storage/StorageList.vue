<template>
  <q-scroll-area v-if="storages" class="fit">
    <q-list class="full-width q-pa-xs">
      <q-item
        v-for="i in storages"
        :key="i.id"
        clickable
        v-ripple
        class="radius-xs overflow-hidden"
        :class="activeStorage === i.id ? 'border active-sublistitem' : 'border-placeholder'"
        :active-class="`${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`"
        @click="enterStorage(i.id)"
      >
        <q-item-section side>
          <AzureIcon v-if="i.type === 'azure_blob'" />
          <q-icon v-else name="mdi-server-network" />
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
        <q-item-section side>
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="more_vert"
            @mouseenter="disableParentFn = true"
            @mouseleave="disableParentFn = false"
          >
            <q-menu class="radius-sm">
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
                  <q-item-section class="q-pr-md">{{ $t('rename') }}</q-item-section>
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
                  <q-item-section class="q-pr-md">{{ $t('delete') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
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
              <q-item-section class="q-pr-md">{{ $t('rename') }}</q-item-section>
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
              <q-item-section class="q-pr-md">{{ $t('delete') }}</q-item-section>
            </q-item>
          </q-list>
        </q-popup-proxy>
        <div
          v-if="activeStorage === i.id"
          class="absolute-left bg-primary"
          style="width: 3px"
        ></div>
      </q-item>
      <q-item
        v-if="!creating"
        clickable
        v-ripple
        class="hovered-item radius-xs"
      >
        <q-item-section side>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section class="hover-show transition">
          {{ $t('create_storage') }}
        </q-item-section>
        <q-menu class="radius-sm" anchor="bottom end" self="top end">
          <q-list dense bordered class="radius-sm q-pa-xs">
            <q-item
              clickable
              class="radius-xs"
              v-close-popup
              @click="createStorageFn('local')"
            >
              <q-item-section side
                ><q-icon name="mdi-server-network" size="sm"
              /></q-item-section>
              <q-item-section class="text-no-wrap">{{ $t('default_storage') }}</q-item-section>
            </q-item>
            <q-separator spaced />
            <q-item
              clickable
              class="radius-xs"
              v-close-popup
              @click="createStorageFn('azure_blob')"
            >
              <q-item-section side>
                <AzureIcon />
              </q-item-section>
              <q-item-section class="text-no-wrap">Azure Blob</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
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
            :placeholder="$t('storage_name')"
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
    <q-dialog v-model="azureCreating" persistent ref="azureCreatingRef">
      <q-card>
        <q-toolbar class="border-bottom">
          <q-toolbar-title class="q-pr-xl">
            {{ $t('fill_azure_info') }}
          </q-toolbar-title>
          <q-btn
            flat
            unelevated
            round
            dense
            size="sm"
            icon="close"
            v-close-popup
          />
        </q-toolbar>
        <q-card-section class="column no-wrap gap-sm">
          <q-input
            v-model="create_parmas.data.name"
            square
            filled
            dense
            type="text"
            :label="$t('storage_name')"
          />
          <q-separator spaced />
          <q-input
            v-model="azureInfo.accountName"
            square
            filled
            dense
            type="text"
            label="accountName"
          />
          <q-input
            v-model="azureInfo.accountKey"
            square
            filled
            dense
            type="text"
            label="accountKey"
          />
          <q-input
            v-model="azureInfo.EndpointSuffix"
            square
            filled
            dense
            type="text"
            label="EndpointSuffix"
          />
          <q-input
            v-model="azureInfo.containerName"
            square
            filled
            dense
            type="text"
            label="containerName"
          />
          <q-input
            v-model="azureInfo.directoryName"
            square
            filled
            dense
            type="text"
            label="directoryName"
          />
          <q-input
            v-model="azureInfo.endSlash"
            square
            filled
            dense
            type="text"
            label="endSlash"
          />
        </q-card-section>
        <q-card-section class="row no-wrap items-center q-pa-sm border-top">
          <q-space />
          <q-btn
            color="primary"
            padding="xs md"
            :label="$t('confirm')"
            @click="createFn(azureInfo)"
          />
        </q-card-section>
        <template v-if="loading">
          <div class="absolute-full bg-black op-5"></div>
          <div class="absolute-full bg-black column flex-center">{{ $t('please_wait') }}</div>
        </template>
      </q-card>
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { fetch_MmMe } from "src/hooks/global/useFetchme.js";

import {
  createStorage,
  updateStorage,
  deleteStorage,
} from "src/api/strapi/project.js";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { useCardname } from "src/hooks/project/useCardname.js";
import AzureIcon from "../components/widgets/icons/AzureIcon.vue";
import {userStore, mm_wsStore, teamStore, uiStore} from 'src/hooks/global/useStore.js';

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

const mm_user_id = ref();
fetch_MmMe()
  .then((res) => {
    mm_user_id.value = res.id;
  })
  .catch((e) => console.error(e));

const disableParentFn = ref(false);
const activeStorage = ref();
const route_params = computed(() => Number(route.params?.storage_id));
const enterStorage = async (storage_id) => {
  if (
    !teamStore.project?.id ||
    route_params.value === storage_id ||
    disableParentFn.value
  )
    return;
  activeStorage.value = storage_id;
  await router.push(`/teams/projects/${teamStore.project.id}/storage/${storage_id}`);
  uiStore.showMainContentList = false;
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
    type: "local",
  },
});
const updateTarget = ref();
const update_parmas = ref({
  data: {
    name: "",
  },
});
const loading = ref(false);
const azureCreating = ref(false);
const azureCreatingRef = ref(void 0);
const azureInfo = ref({
  accountName: "",
  accountKey: "",
  EndpointSuffix: "",
  containerName: "",
  directoryName: "",
  endSlash: "",
});
const createFn = async (azureInfo) => {
  if (loading.value) return;
  creating.value = false;
  loading.value = true;
  if (belonged.value === "project") {
    create_parmas.value.data.assign_project = teamStore.project.id;
  }
  if (belonged.value === "card") {
    create_parmas.value.data.assign_card = card.value.id;
  }
  if (belonged.value === "user") {
    create_parmas.value.data.assign_user = user.value.id;
  }
  if (azureInfo) {
    create_parmas.value.data.azureInfo = azureInfo;
  }
  const res = await createStorage(create_parmas.value);
  if (res) {
    azureCreatingRef.value.hide();
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
        chat_Msg.props.strapi.data.project_id = teamStore.project.id;
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
const createStorageFn = (type) => {
  create_parmas.value.data.type = type;
  if (type === "local") {
    creating.value = true;
  } else if (type === "azure_blob") {
    azureCreating.value = true;
  }
};
const cancelCreate = () => {
  creating.value = false;
  create_parmas.value.data.name = "";
};
const deleteFn = async (i) => {
  if (activeStorage.value === i.id) {
    await router.push(`/teams/projects/${teamStore.project.id}/storage`);
  }
  await deleteStorage(i.id);
  if (belonged.value === "user") {
    userStore.storages = userStore.storages.filter((j) => j.id !== i.id);
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
      chat_Msg.props.strapi.data.project_id = teamStore.project.id;
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
        chat_Msg.props.strapi.data.project_id = teamStore.project.id;
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
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data.is === "storage" &&
          strapi.data.project_id === teamStore.project.id &&
          strapi.data.action === "storage_created"
        ) {
          teamStore.project.storages.push(strapi.data.storage);
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
          strapi.data.project_id === teamStore.project.id &&
          strapi.data.action === "storage_deleted"
        ) {
          teamStore.project.storages = teamStore.project.storages.filter(
            (i) => i.id !== strapi.data.storage_id
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
          strapi.data.project_id === teamStore.project.id &&
          strapi.data.action === "storage_updated"
        ) {
          let index = teamStore.project.storages.findIndex(
            (j) => j.id === strapi.data.storage.id
          );
          if (index !== -1) {
            teamStore.project.storages[index] = strapi.data.storage;
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
