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
    need="json"
    :square="true"
    :withSaveBtb="!saving"
    :withImageBtb="true"
    :contentStyle="contentStyle"
    :autofocus="!islocked"
    :contentChanged
    _for="document"
    class="items-center"
    @contentChanged="contentChanged = true"
    @tiptapUpdate="tiptapUpdate"
    @tiptapBlur="tiptapBlur"
    @tiptapSave="tiptapSave"
    @tiptapReady="tiptapReady()"
    @tiptapDestroy="tiptapDestroy()"
  >
    <template v-if="showClose" v-slot:left-btn>
      <q-btn dense flat icon="mdi-chevron-left" @click="close" />
    </template>
    <template v-slot:more_btn>
      <q-btn flat dense size="sm" class="q-mr-md" :color="saving ? 'primary' : ''" :disable="saving" @click="tiptapSave">
        <q-spinner-dots v-if="saving"
          size="1em"
          :thickness="2"
        />
        <q-icon v-else name="save" />
      </q-btn>
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
import {computed, ref, toRefs, watchEffect} from "vue";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";

import {updateDocument} from "src/api/strapi/project.js";
import localforage from "localforage";
import {teamStore, uiStore} from "src/hooks/global/useStore.js";
import {isEqual} from "lodash-es";
import {i18n} from 'src/boot/i18n.js';

const $t = i18n.global.t;
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

const saving = ref(false);
const withSaveBtb = ref(true);
watchEffect(() => {
  withSaveBtb.value = !saving.value
})
const jsonContent = ref({});
const contentChanged = ref(false)
const updateDocumentFn = async () => {
  if (!jsonContent.value || saving.value || !contentChanged.value) return;
  saving.value = true;
  uiStore.edittingDocument = document.value.id;
  // const isChanged = !isEqual(document.value.jsonContent, jsonContent.value);
  // // console.log("isChanged", isChanged);
  // if (!isChanged) return;
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
  saving.value = false;
  if (res) {
    contentChanged.value = false
    if (by_info.value.user_id) {
      process_documentContent_change(res.data);
    }
    setTimeout(() => {
      localforage.removeItem(`__document_${document.value.id}`);
    }, 3000);
  }
};

const count = ref(8);
const autoSave = (val) => {
  let intervalId = setInterval(async () => {
    jsonContent.value = val;
    count.value--;
    // console.log('tiptapUpdate autoSave', count.value);
    if (count.value < 1) {
      // console.log('Clearing interval');
      clearInterval(intervalId);
      try {
        await updateDocumentFn();
        // console.log('Document updated');
      } catch (error) {
        console.error('Error updating document', error);
      }
    }
  }, 1000);
};

const tiptapUpdate = (val) => {
  // console.log('tiptapUpdate', val);
  jsonContent.value = val;
  count.value = 8;
  autoSave();
};
const tiptapBlur = async (val) => {
  // console.log("tiptapBlur", val);
  jsonContent.value = val;
  await updateDocumentFn();
};
const tiptapSave = async (val) => {
  // console.log("tiptapSave", val);
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

</script>

<style lang="scss" scoped></style>
