<template>
  <q-scroll-area v-if="documents" class="fit">
    <q-list dense class="q-pa-xs">
      <VueDraggable v-model="documents"
        :disabled="!sortAuth" :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        handle=".dragBar" group="groups"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        class="radius-sm column no-wrap"
        @sort="orderDocuments"
      >
        <template v-for="element in documents" :key="element.id">
          <q-item
            clickable
            v-ripple
            class="col radius-xs hovered-item overflow-hidden q-pa-sm"
            :class="actived_id === element.id ? 'border' : 'border-placeholder op-7'"
            :active-class="`${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`"
            :active="actived_id === element.id"
            style="min-height: 40px;"
            @click="enterDocument(element)"
          >
            <q-item-section side top class="dragBar q-pr-sm">
              <q-icon :name="findIcon_byType(element.type)"> </q-icon>
            </q-item-section>
            <q-item-section>
              {{ element.title }}
            </q-item-section>
            <q-item-section
              v-if="!teamStore.shareInfo"
              side top
              class="hover-show transition no-padding absolute-right z-fab q-mr-xs q-mt-sm"
              @mouseenter="unEnter = true"
              @mouseleave="unEnter = false"
            >
              <q-btn flat round dense size="sm" icon="more_vert">
                <q-menu class="radius-sm">
                  <q-list bordered dense class="radius-sm q-pa-xs">
                    <q-item class="no-padding">
                      <q-input
                        dense
                        filled
                        v-model="element.title"
                        autofocus
                        type="text"
                        class="radius-xs"
                        :placeholder="element.title"
                      >
                        <template v-slot:append>
                          <q-btn
                            flat
                            round
                            dense
                            size="xs"
                            icon="check"
                            :disable="loading"
                            v-close-popup
                            @click="update(element)"
                          />
                        </template>
                      </q-input>
                    </q-item>
                    <q-separator spaced />
                    <q-item
                      :clickable="!loading"
                      class="radius-xs no-padding"
                      v-close-popup
                      @click="remove(element)"
                    >
                      <q-item-section side
                        ><q-icon name="delete"
                      /></q-item-section>
                      <q-item-section>{{ $t('delete') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
            <div
              v-if="actived_id === element.id"
              class="absolute-left bg-primary"
              style="width: 3px"
            ></div>
          </q-item>
        </template>
      </VueDraggable>
      <div class="radius-sm column no-wrap" v-if="!teamStore.shareInfo">
        <q-item v-if="!creating"
          clickable
          v-ripple
          class="col radius-xs hovered-item overflow-hidden"
          :class="documents?.length === 0 ? 'active-sublistitem border-dashed border-op-xl border-xs' : 'hovered-item'"
          style="min-height: 40px;"
          @click="creating = true"
        >
          <q-item-section side class="q-pr-sm q-mr-xs">
            <q-icon name="add" />
          </q-item-section>
          <q-item-section class="hover-show transition">
            {{ $t('create_document') }}
          </q-item-section>
        </q-item>
        <q-item v-else class="radius-xs border q-pa-xs"
        >
          <q-item-section>
            <q-input
              v-model="createDocument_title"
              dense
              square
              autofocus
              filled
              type="text"
              :placeholder="$t('create_title')"
              @keydown.esc="cancelCreate()"
              @keyup.enter="create()"
            >
              <template v-slot:prepend>
                <q-icon name="article" size="sm" />
              </template>
              <template v-if="createDocument_title" v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="check"
                  :disable="loading"
                  @click="create()"
                />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </div>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import {ref, toRefs, computed, watch, onBeforeMount, onMounted, nextTick} from 'vue';
import { useRouter, useRoute } from "vue-router";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { VueDraggable } from 'vue-draggable-plus'
import {
  updateCard,
  createDocument,
  deleteDocument,
  updateDocument,
  updateProject,
  getDocument
} from "src/api/strapi/project.js";
import {userStore, mm_wsStore, teamStore, uiStore} from 'src/hooks/global/useStore.js';

import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const router = useRouter();
const route = useRoute();
const actived_id = computed(() => teamStore.active_document?.id);

const props = defineProps({
  by_info: {
    type: Object,
    default() {
      return {
        by: "project",
      };
    },
  },
  sortAuth: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["enterDocument"]);
onMounted(() => {
  uiStore.closeDocumentsList = false
})

const { by_info, sortAuth } = toRefs(props);
const documents = ref([]);
onBeforeMount(() => {
  if(by_info.value?.project_id) {
    documents.value = teamStore.project?.project_documents || [];
  } else if(by_info.value?.card_id) {
    documents.value = teamStore.card?.card_documents || [];
  } else if(by_info.value?.by === "user") {
    documents.value = teamStore.init?.user_documents
  }
});
const types = ref([
  { type: "document", tip: "document", icon: "article" },
  { type: "pdf", tip: "PDF", icon: "picture_as_pdf" },
  { type: "office", tip: "Office...", icon: "text_snippet" },
  { type: "video", tip: "video", icon: "video_file" },
]);
const findIcon_byType = (type) => {
  return types.value.find((i) => i.type === type)?.icon;
};

const unEnter = ref(false);
const fetchDocument = async (document_id) => {
    const {data} = await getDocument(document_id);
    if(data) {
      if(teamStore.card) {
        teamStore.card.card_documents = teamStore.card.card_documents.map(i => {
          if(i.id === document_id) {
            return data
          }
          return i
        });;
      } else if (teamStore.project) {
        teamStore.project.project_documents = teamStore.project.project_documents.map(i => {
          if(i.id === document_id) {
            return data
          }
          return i
        });
      }
    }
    return data
}
const enterDocument = async (element) => {
  if (unEnter.value) return;
  const res = await fetchDocument(element.id);
  teamStore.active_document = res;
  if(!teamStore.card) {
    router.push(`/teams/projects/${teamStore.project?.id}/document/${element.id}`);
    uiStore.showMainContentList = false;
  }
};
onMounted(async() => {
  await nextTick();
  if(route.params.document_id && !teamStore.active_document) {
    // await fetchDocument(route.params.document_id)
  }
})

const loading = ref(false);
const creating = ref(false);
const createDocument_title = ref();
const process_createdData = (val) => {
  if (by_info.value.project_id) {
    if(!teamStore.project?.project_documents){
      teamStore.project.project_documents = []
    }
    if (
      !teamStore.project?.project_documents?.map((i) => i.id)?.includes(val.id)
    ) {
      teamStore.project.project_documents.push(val);
    }
  }
  if (by_info.value?.card_id) {
    if(!teamStore.card?.card_documents){
      teamStore.card.card_documents = []
    }
    if (
      !teamStore.card?.card_documents?.map((i) => i.id)?.includes(val.id)  
    ) {
      teamStore.card.card_documents.push(val);
    }
  }
  if (by_info.value.user_id) {
  }
};
const cancelCreate = () => {
  creating.value = false;
  createDocument_title.value = "";
};
const create = async () => {
  creating.value = true;
  loading.value = true;
  let params = {
    data: {
      title: createDocument_title.value,
    },
  };
  if (by_info.value.project_id) {
    params.project_id = by_info.value.project_id;
  }
  if (by_info.value.card_id) {
    params.card_id = by_info.value.card_id;
  }
  if (by_info.value.user_id) {
    params.user_id = by_info.value.user_id;
  }

  let res = await createDocument(params);
  if (res?.data) {
    if (by_info.value?.by === "user" || !mm_wsStore.online) {
      process_createdData(res.data);
    }
    creating.value = false;
    loading.value = false;
  }
};

const process_updatedData = (val) => {
  if (by_info.value.project_id) {
    let source = teamStore.project?.project_documents;
    teamStore.project.project_documents = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
  }
  if (by_info.value.card_id) {
    let source = teamStore.card?.card_documents;
    teamStore.card.card_documents = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
  }
  if (by_info.value.user_id) {
  }
};
const update = async (document) => {
  loading.value = true;
  let params = {
    data: {
      title: document.title,
    },
  };
  if (by_info.value.project_id) {
    params.project_id = by_info.value.project_id;
  }
  if (by_info.value.card_id) {
    params.card_id = by_info.value.card_id;
  }
  if (by_info.value.user_id) {
    params.user_id = by_info.value.user_id;
  }

  let res = await updateDocument(document.id, params);
  if (res?.data) {
    loading.value = false;
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "document_updated",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：${$t('changed_project_document')} - ${document.id}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：${$t('changed_task_document')} - ${document.id}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_updatedData(res.data);
    } else {
      await send_chat_Msg(chat_Msg);
    }
  }
};

const process_removedData = (val) => {
  if (by_info.value.project_id) {
    teamStore.project = {
      ...teamStore.project,
      project_documents: teamStore.project.project_documents.filter(
        (i) => i.id !== val.removed
      ),
    };
  }
  if (by_info.value.card_id) {
    teamStore.card = {
      ...teamStore.card,
      card_documents: teamStore.card.card_documents.filter(
        (i) => i.id !== val.removed
      ),
    };
  }
  if (by_info.value.user_id) {
  }
};
const remove = async (i) => {
  let res = await deleteDocument(i.id);
  if (res) {
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "document_removed",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：${$t('deleted_project_document')} - ${document.title}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：${$t('deleted_task_document')} - ${document.title}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_removedData(res.data);
    } else {
      await send_chat_Msg(chat_Msg);
    }
  }
};

const process_orderData = (val) => {
  documents.value = val.map((i) =>
    documents.value.find((j) => j.id === i)
  );
};

const orderDocuments = async () => {
  // console.log(event);
  await nextTick();
  let res;
  let Msg_body;

  const _documents_ids = documents.value.map((i) => i.id);
  if (by_info.value?.by === "project") {
    const project_id = teamStore.project?.id;
    let params = {
      project_documents: _documents_ids,
    };
    res = await updateProject(project_id, params);
    Msg_body = res?.data.project_documents.map((i) => i.id);
  }
  if (by_info.value?.by === "card") {
    let params = {
      data: {
        card_documents: _documents_ids,
      }
    };
    res = await updateCard(teamStore.card?.id, params);
    console.log(res);
    
    Msg_body = res?.data.card_documents.map((i) => i.id);
  }
  if (by_info.value?.by === "user") {
    Msg_body = res.data.user_documents.map((i) => i.id);
  }

  if (res) {
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "document_ordered",
            body: Msg_body,
          },
        },
      },
    };
    
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：${$t('sorted_project_document')}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：${$t('sorted_task_document')}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card?.id;
    }

    if (by_info.value?.by === "user") {
      process_orderData(Msg_body);
    } else {
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
    // console.log("mm_wsStore.event", mm_wsStore.event);
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === teamStore.project?.id ||
            strapi.data?.card_id === teamStore.card?.id) &&
          strapi.data.action === "document_created"
        ) {
          process_createdData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === teamStore.project?.id ||
            strapi.data?.card_id === teamStore.card?.id) &&
          strapi.data.action === "document_updated"
        ) {
          process_updatedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === teamStore.project?.id ||
            strapi.data?.card_id === teamStore.card?.id) &&
          strapi.data.action === "document_removed"
        ) {
          process_removedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === teamStore.project?.id ||
            strapi.data?.card_id === teamStore.card?.id) &&
          strapi.data.action === "document_ordered"
        ) {
          console.log('document_ordered', strapi);
          process_orderData(strapi.data.body);
        }
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
