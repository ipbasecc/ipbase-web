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
import {ref, toRefs, computed, watch, onBeforeMount, onMounted, nextTick, watchEffect} from 'vue';
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
watchEffect(() => {
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
  element = res;
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
    if (by_info.value?.by === "user") {
      process_createdData(res.data);
    }
    creating.value = false;
    loading.value = false;
    createDocument_title.value = null;
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
    if (by_info.value?.by === "user") {
      process_updatedData(res.data);
    }
  }
};

const process_removedData = (val) => {
  if (by_info.value.project_id) {
    teamStore.project.project_documents = teamStore.project.project_documents.filter(
      (i) => i.id !== val.removed
    )
    documents.value = teamStore.project.project_documents;
  }
  if (by_info.value.card_id) {
    teamStore.card.card_documents = teamStore.card.card_documents.filter(
      (i) => i.id !== val.removed
    )
    documents.value = teamStore.card.card_documents
  }
  if (by_info.value.user_id) {
  }
};
const remove = async (i) => {
  let res = await deleteDocument(i.id);
  if (res) {
    if (by_info.value?.by === "user") {
      process_removedData(res.data);
    }
  }
};

const process_orderData = (val) => {
  documents.value = val.map((i) =>
    documents.value.find((j) => j.id === i)
  );
  if (by_info.value.project_id) {
    teamStore.project.project_documents = documents.value
  }
  if (by_info.value.card_id) {
    teamStore.card.card_documents = documents.value
  }
};

const orderDocuments = async () => {
  // console.log(event);
  await nextTick();
  let res;
  let sort;

  const _documents_ids = documents.value.map((i) => i.id);
  if (by_info.value?.by === "project") {
    const project_id = teamStore.project?.id;
    let params = {
      data: {
        project_documents: _documents_ids,
      }
    };
    res = await updateProject(project_id, params);
  }
  if (by_info.value?.by === "card") {
    let params = {
      data: {
        card_documents: _documents_ids,
      }
    };
    res = await updateCard(teamStore.card?.id, params);
  }
  if (by_info.value?.by === "user") {
    sort = res.data.user_documents.map((i) => i.id);
  }

  if (res && by_info.value?.by === "user") {
    process_orderData(sort);
  }
};
</script>

<style lang="scss" scoped></style>
