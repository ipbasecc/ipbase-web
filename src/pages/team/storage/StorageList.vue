<template>
  <q-scroll-area v-if="storages" class="fit">
    <q-list class="full-width q-pa-xs">
      <VueDraggable v-model="storages"
        :disabled="!sortAuth" :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" group="groups"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="radius-sm column no-wrap"
        @sort="orderStorages"
      >
        <template v-for="i in storages" :key="i.id">
          <q-item
            clickable
            v-ripple
            class="col radius-xs hovered-item overflow-hidden q-pa-sm"
            :class="activeStorage === i.id ? 'border active-sublistitem' : 'border-placeholder op-7'"
            :active-class="`${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`"
            style="min-height: 40px;"
            @click="enterStorage(i.id)"
          >
            <q-item-section side class="dragBar q-pr-sm">
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
            <q-item-section side class="hover-show transition absolute-right z-fab q-mr-xs">
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
        </template>
      </VueDraggable>
      <div class="radius-sm column no-wrap" v-if="!teamStore.shareInfo">
        <q-item
          v-if="!creating"
          clickable
          v-ripple
          class="col radius-xs hovered-item overflow-hidden"
          :class="storages?.length === 0 ? 'active-sublistitem border-dashed border-op-xl border-xs' : 'hovered-item'"
          style="min-height: 40px;"
        >
          <q-item-section side class="q-pr-sm q-mr-xs">
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
      </div>
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
import { ref, toRefs, watch, computed, nextTick, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetch_MmMe } from "src/hooks/global/useFetchme.js";
import { createStorage,  updateStorage,  deleteStorage,  updateProject,} from "src/api/strapi/project.js";
import { VueDraggable } from 'vue-draggable-plus'
import AzureIcon from "../components/widgets/icons/AzureIcon.vue";
import { teamStore, uiStore} from 'src/hooks/global/useStore.js';

import { i18n } from 'src/boot/i18n.js';
const $t = i18n.global.t;

const props = defineProps({
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
  sortAuth: {
    type: Boolean,
    default: false,
  },
  by_info: {
    type: Object,
    default() {
      return {
        by: "project",
      };
    },
  },
});
const { belonged, card, user, sortAuth, by_info } = toRefs(props);
const storages = ref([]);

const create_parmas = ref({
  data: {
    name: "",
    type: "local",
  },
});
watchEffect(() => {
  switch (by_info.value?.by) {
    case "project":
      storages.value = teamStore.project?.storages || [];
      create_parmas.value.data.assign_project = teamStore.project.id;
      break;
    case "card":
      // storages.value = [teamStore.card?.storage] || [];
      create_parmas.value.data.assign_card = card.value.id;
      break;
    case "user":
      storages.value = teamStore.init?.storages || [];
      break;
    default:
      create_parmas.value.data.assign_project = teamStore.project.id;
      storages.value = teamStore.project?.storages || []
  }
});
const route = useRoute();
const router = useRouter();

const mm_user_id = ref();
fetch_MmMe()
  .then((res) => {
    mm_user_id.value = res.id;
  })
  .catch((e) => console.error(e));

const disableParentFn = ref(false);
const activeStorage = computed(() => teamStore.active_storage_id);
const route_params = computed(() => Number(route.params?.storage_id));
const enterStorage = async (storage_id) => {
  if (
    !teamStore.project?.id ||
    route_params.value === storage_id ||
    disableParentFn.value
  )
    return;
  teamStore.active_storage_id = storage_id;
  await router.push(`/teams/projects/${teamStore.project.id}/storage/${storage_id}`);
  uiStore.showMainContentList = false;
};

watch(
  route_params,
  () => {
    if (route_params.value) {
      teamStore.active_storage_id = route_params.value;
    }
  },
  { immediate: true, deep: false }
);

const creating = ref(false);
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
  if (azureInfo) {
    create_parmas.value.data.azureInfo = azureInfo;
  }
  const res = await createStorage(create_parmas.value);
  if (res) {
    azureCreatingRef.value.hide();
    create_parmas.value.data.name = "";
    if (by_info.value?.by === "user") {
      if(teamStore?.init?.storages?.length > 0){
        teamStore.init.storages.push(res.data);
      } else {
        teamStore.init.storages = [res.data];
      }
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
    teamStore.init.storages = teamStore.init.storages.filter((j) => j.id !== i.id);
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
      let index = teamStore.init.storages.findIndex((j) => j.id === i.id);
      if (index !== -1) {
        teamStore.init.storages[index] = res.data;
      }
    }
  }
};
const process_orderData = (val) => {
    storages.value = val.map((i) =>
      storages.value.find((j) => j.id === i
    )
  );
};
const orderStorages = async () => {
  // console.log(event);
  await nextTick();
  let res;
  let Msg_body;

  const _storages_ids = storages.value.map((i) => i.id);
  // card只会绑定一个根存储，这里不需要有排序逻辑
  if (by_info.value?.by === "project") {
    const project_id = teamStore.project?.id;
    let params = {
      data: {
        storages: _storages_ids,
      }
    };
    res = await updateProject(project_id, params);
    Msg_body = res?.data.storages.map((i) => i.id);
  }
  if (by_info.value?.by === "user") {
    Msg_body = res.data.user_documents.map((i) => i.id);
  }

  if (res) {
    if (by_info.value?.by === "user") {
      process_orderData(Msg_body);
    }
  }
};

const val = computed(() => teamStore.income);
watch(val, async(newVal) => {
  if(!newVal) return;
  const { team_id, data } = val.value?.data;
  const _storage_ids = storages.value.map(i => i.id);
  if(teamStore.team?.id === Number(team_id)){
    if(val.value.event === 'storage:updated'){
      if(_storage_ids.includes(Number(data.id))){
        if(by_info.value?.by === "project") {
          const index = teamStore.project.storages.findIndex(i => i.id === Number(data.id));
          teamStore.project.storages[index] = data;
        } else if(by_info.value?.by === "user") {
          const index = teamStore.init.storages.findIndex(i => i.id === Number(data.id));
          teamStore.init.storages[index] = data;
        }
      }
    }
    // 新建逻辑处理在src/pages/team/wsWatcher.js文件中
    if(val.value.event === 'storage:removed'){
      if(_storage_ids.includes(Number(data.removed_storage_id))){
        if(by_info.value?.by === "project") {
          teamStore.project.storages = teamStore.project.storages.filter(
            (i) => i.id !== Number(data.removed_storage_id)
          );
        } else if(by_info.value?.by === "user") {
          teamStore.init.storages = teamStore.init.storages.filter(
            (i) => i.id !== Number(data.removed_storage_id)
          );
        }
      }
    }
  }
});
</script>

<style lang="scss" scoped></style>
