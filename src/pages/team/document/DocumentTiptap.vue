<template>
  <TipTap
    v-if="by_info && document"
    :key="document.id"
    :jsonContent="document.jsonContent"
    :editable="
      !teamStore.shareInfo && !readOnly &&
      (by_info.user_id ||
        useAuths('jsonContent', ['card', 'card_document']))
    "
    :need="'json'"
    :square="true"
    :withSaveBtb="true"
    :withImageBtb="true"
    :contentStyle="contentStyle"
    :autofocus="!islocked"
    class="items-center"
    @tiptapUpdate="tiptapUpdate"
    @tiptapBlur="tiptapBlur"
    @tiptapReady="tiptapReady()"
    @tiptapDestroy="tiptapDestroy()"
  >
    <template v-if="showClose" v-slot:left-btn>
      <q-btn dense flat icon="mdi-chevron-left" @click="close" />
    </template>
    <template v-if="islocked && !readOnly" v-slot:locker>
      <div class="absolute-full bg-black op-5" />
      <div class="absolute-full q-pa-md">
        <q-toolbar class="transparent radius-sm blur-xs border-dashed border-op-sm">
          <q-toolbar-title>
            <span>{{ $t('document_locked_tip') }}</span>
          </q-toolbar-title>
          <q-btn dense flat color="primary" padding="xs md"
            :label="$t('document_unlock')" class="q-mr-sm"
            @click="showUnlock = true"
          />
          <q-btn dense color="primary" padding="xs md"
            :label="$t('read_only_mode')"
            @click="toggleReadOnly"
          />
        </q-toolbar>
        <q-dialog v-model="showUnlock">
          <q-card bordered>
            <q-item class="q-pa-md q-my-lg">
              <q-item-section top side>
                <q-avatar size="4rem" icon="mdi-information-outline" class="text-deep-orange" />
              </q-item-section>
              <q-item-section class="font-medium" style="line-height: 1.5;">
                {{ $t('document_unlock_tip') }}
              </q-item-section>
            </q-item>
            <q-card-actions align="right">
              <q-btn padding="xs md" flat :label="$t('cancel')" color="primary" v-close-popup />
              <q-space />
              <q-btn-group class="border">
                <q-btn :label="$t('confirm')" color="brown" v-close-popup @click="unlock" />
                <q-btn dense color="primary" padding="xs md"
                  :label="$t('read_only_mode')"
                  @click="toggleReadOnly"
                />
              </q-btn-group>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </template>
  </TipTap>
</template>

<script setup>
import {computed, ref, toRefs, watch, watchEffect, onMounted, onUnmounted} from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";

import {updateDocument} from "src/api/strapi/project.js";
import {send_MattersMsg} from "src/pages/team/hooks/useSendmsg.js";
import localforage from "localforage";
import {mm_wsStore, teamStore, uiStore, userStore} from "src/hooks/global/useStore.js";
import {isEqual} from "lodash-es";
import {i18n} from 'src/boot/i18n.js';

const $t = i18n.global.t;

const userId = computed(() => teamStore.init?.id);
const props = defineProps({
  by_info: {
    type: Object,
    default: null,
  },
  contentStyle: {
    type: String,
    default: 'max-height: unset;',
  },
  showClose: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
}
const { by_info } = toRefs(props);
const document = ref(null);
watchEffect(() => {
  document.value = teamStore.active_document;
})
const readOnly = ref(false);
const toggleReadOnly = () => {
  readOnly.value = !readOnly.value;
};
const islocked = computed(() => document.value?.is_locked);

const updateChatMsg = ref({});
const jsonContent = ref({});
const updateDocumentFn = async () => {
  if (!jsonContent.value) return;
  uiStore.edittingDocument = document.value.id;
  const isChanged = !isEqual(document.value.jsonContent, jsonContent.value);
  // console.log("isChanged", isChanged);
  if (!isChanged) return;
  let params = {
    document_id: document.value.id,
    data: {
      jsonContent: jsonContent.value,
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

  let res = await updateDocument(document.value.id, params);
  if (res) {
    updateChatMsg.value = {
      props: {
        strapi: {
          data: {
            is: "document",
            action: "DocumentContentUpdate",
            document_id: document.value.id,
            by_user: userId.value,
            body: res.data,
          },
        },
      },
    };

    if (by_info.value.project_id) {
      updateChatMsg.value.body = `${userStore.me.username} ${$t('changed_project_props')}'${teamStore.project.name}' ${$t('inner_document')}'${document.value.title}' ${$t('of_content')}`;
    }
    if (by_info.value.card_id) {
      updateChatMsg.value.body = `${userStore.me.username} ${$t('changed_card_props')}'${teamStore.card.name}' ${$t('inner_document')}'${document.value.title}'${document.value.title}' ${$t('of_content')}`;
    }
    if (by_info.value.user_id) {
      process_documentContent_change(res.data);
    }
    await send_chat_Msg(updateChatMsg.value);
    setTimeout(() => {
      localforage.removeItem(`__document_${document.value.id}`);
    }, 3000);
  }
};

const count = ref(15);
let intervalId = null;
const startCountdown = () => {
  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      await updateDocumentFn();
    }
  }, 1000);
};

const tiptapUpdate = async (val) => {
  jsonContent.value = val;
  count.value = 15;
  startCountdown();
};
const tiptapBlur = async (val) => {
  console.log("tiptapBlur", val);
  jsonContent.value = val;
  await updateDocumentFn();
};
const setDocumentLockedStatus = async (status) => {
  let params = {
    document_id: document.value.id,
    data: {
      is_locked: status
    },
  };
  await updateDocument(document.value.id, params);
}
const tiptapIsReady = ref(false);
const tiptapReady = async () => {
  if(islocked.value || tiptapIsReady.value) return;
  tiptapIsReady.value = true;
  // await setDocumentLockedStatus(true);
}
const showUnlock = ref(false);
const unlock = async () => {
  await setDocumentLockedStatus(false);
  document.value.is_locked = false;
}
const tiptapIsDestroy = ref(false);
const tiptapDestroy = async () => {
  if(islocked.value || tiptapIsDestroy.value) return;
  tiptapIsDestroy.value = true;
  // await unlock();
}
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
  updateChatMsg.value = null;
};

const process_documentContent_change = (val) => {
  // console.log("val", val);
  if (by_info.value.project_id) {
    teamStore.project.project_documents =
      teamStore.project.project_documents.map((i) =>
        i.id === val.id ? val : i
      );
  }
  if (by_info.value.card_id) {
    teamStore.card.card_documents = teamStore.card.card_documents.map((i) => {
      return i.id === val.id ? val : i;
    });
  }
  if (by_info.value.user_id) {
  }
};

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "thread_updated") {
      const _thread = JSON.parse(mm_wsStore.event.data.thread);
      // console.log("message.event", message);
      if (_thread.id === document.value?.mm_thread?.id) {
        document.value.mm_thread = _thread;
        const _params = {
          data: {
            mm_thread: _thread,
          },
        };
        console.log("updateDocument");
        await updateDocument(document.value.id, _params);
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
