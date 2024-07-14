<template>
  <q-scroll-area v-if="documents" class="fit">
    <q-list>
      <draggable
        :list="documents"
        animation="300"
        :fallbackTolerance="2"
        :force-fallback="true"
        :fallbackOnBody="true"
        :item-key="(key) => key"
        :sort="true"
        :touchStartThreshold="4"
        :scroll="true"
        ghost-class="ghostColumn"
        chosen-class="chosenGroupClass"
        drag-class="dragClass"
        handle=".dragBar"
        group="groups"
        class="radius-sm column no-warp q-pa-xs"
        @change="orderDocuments(documents)"
      >
        <template #item="{ element }">
          <q-item
            clickable
            v-ripple
            class="col radius-xs dragBar hovered-item"
            :class="actived_id === element.id ? 'border' : 'border-placeholder'"
            :active-class="`${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`"
            :active="actived_id === element.id"
          >
            <q-item-section side @click="enterDocument(element)">
              <q-icon :name="findIcon_byType(element.type)"> </q-icon>
            </q-item-section>
            <q-item-section
              @click="enterDocument(element)"
              class="text-no-wrap"
              >{{ element.title }}</q-item-section
            >
            <q-item-section side class="hover-show transition">
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
                      <q-item-section>删除</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
        <template #footer>
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
              新建文档
            </q-item-section>
          </q-item>
          <q-item v-else class="radius-xs border q-pa-xs">
            <q-item-section>
              <q-input
                v-model="createDocument_title"
                dense
                square
                autofocus
                filled
                type="text"
                placeholder="文档名称"
                @keydown.esc="cancelCreate()"
                @keyup.enter="create()"
              >
                <template v-slot:prepend>
                  <q-item-section side>
                    <q-icon name="article" />
                  </q-item-section>
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
        </template>
      </draggable>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";

import draggable from "vuedraggable";

import {
  createDocument,
  deleteDocument,
  updateDocument,
  updateProject,
} from "src/api/strapi/project.js";

import useMmws from "src/stores/mmws.js";

const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const router = useRouter();
const route = useRoute();
const actived_id = computed(() => Number(route.params.document_id));

const props = defineProps({
  documents: {
    type: Array,
    default() {
      return [];
    },
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
const emit = defineEmits(["enterDocument"]);

const { documents, by_info } = toRefs(props);
const types = ref([
  { type: "document", tip: "文档", icon: "article" },
  { type: "pdf", tip: "PDF", icon: "picture_as_pdf" },
  { type: "office", tip: "Office...", icon: "text_snippet" },
  { type: "video", tip: "视频", icon: "video_file" },
]);
const findIcon_byType = (type) => {
  return types.value.find((i) => i.type === type)?.icon;
};

const enterDocument = (element) => {
  if (by_info.value?.project_id) {
    router.push(`/projects/${projectStore.project.id}/document/${element.id}`);
  }
  if (by_info.value?.card_id) {
    emit("enterDocument", element.id);
  }
  if (by_info.value.user_id) {
  }
};

const loading = ref(false);
const creating = ref(false);
const create_params = ref({
  by_info: by_info.value,
  data: {
    name: "",
  },
});
const createDocument_title = ref();
const process_createdData = (val) => {
  if (by_info.value.project_id) {
    if (!projectStore.project?.project_documents) {
      projectStore.project.project_documents = [];
    }
    console.log("process_createdData");
    projectStore.project.project_documents.push(val);
  }
  if (by_info.value?.card_id) {
    if (!projectStore.card?.card_documents) {
      projectStore.card.card_documents = [];
    }
    console.log("process_createdData");
    projectStore.card.card_documents.push(val);
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
  if (res) {
    creating.value = false;
    loading.value = false;

    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "document_created",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：新增了项目文档`;
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：新增了任务文档`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_createdData(res.data);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};

const process_updatedData = (val) => {
  if (by_info.value.project_id) {
    let source = projectStore.project.project_documents;
    projectStore.project.project_documents = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
  }
  if (by_info.value.card_id) {
    let source = projectStore.project.card_documents;
    projectStore.card.card_documents = source.map((i) => {
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
      chat_Msg.body = `${userStore.me.username}：修改了项目文档 - ${document.id}`;
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：修改了任务文档 - ${document.id}`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_updatedData(res.data);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};

const process_removedData = (val) => {
  if (by_info.value.project_id) {
    projectStore.project = {
      ...projectStore.project,
      project_documents: projectStore.project.project_documents.filter(
        (i) => i.id != val.removed
      ),
    };
  }
  if (by_info.value.card_id) {
    projectStore.card = {
      ...projectStore.card,
      card_documents: projectStore.card.card_documents.filter(
        (i) => i.id != val.removed
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
      chat_Msg.body = `${userStore.me.username}：删除了项目文档 - ${document.title}`;
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：删除了任务文档 - ${document.title}`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_removedData(res.data);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};

const process_orderData = (val) => {
  if (by_info.value?.by === "project") {
    projectStore.project.project_documents = val.map((i) =>
      projectStore.project.project_documents.find((j) => j.id == i)
    );
  }
  if (by_info.value?.by === "card") {
  }
  if (by_info.value?.by === "user") {
  }
};
const orderDocuments = async (documents) => {
  if (by_info.value?.by === "project") {
    const project_id = by_info.value.project_id;
    const project_documents_ids_withOrder = documents.map((i) => i.id);
    let params = {
      project_documents: project_documents_ids_withOrder,
    };
    let res;
    let Msg_body;

    if (by_info.value?.by === "project") {
      res = await updateProject(project_id, params);
      Msg_body = res.data.project_documents.map((i) => i.id);
    }
    if (by_info.value?.by === "card") {
    }
    if (by_info.value?.by === "user") {
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
        chat_Msg.body = `${userStore.me.username}：对项目文档进行了排序`;
        chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
      }
      if (by_info.value?.by === "card") {
        chat_Msg.body = `${userStore.me.username}：对任务文档进行了排序`;
        chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
      }
      if (by_info.value?.by === "user") {
        process_orderData(Msg_body);
      } else {
        send_chat_Msg(chat_Msg);
      }
    }
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === projectStore.project?.id ||
            strapi.data?.card_id === projectStore.card?.id) &&
          strapi.data.action === "document_created"
        ) {
          process_createdData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === projectStore.project?.id ||
            strapi.data?.card_id === projectStore.card?.id) &&
          strapi.data.action === "document_updated"
        ) {
          process_updatedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === projectStore.project?.id ||
            strapi.data?.card_id === projectStore.card?.id) &&
          strapi.data.action === "document_removed"
        ) {
          process_removedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          (strapi.data?.project_id === projectStore.project?.id ||
            strapi.data?.card_id === projectStore.card?.id) &&
          strapi.data.action === "document_ordered"
        ) {
          process_orderData(strapi.data.body);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
