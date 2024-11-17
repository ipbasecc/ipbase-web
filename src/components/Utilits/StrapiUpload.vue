<template>
  <q-uploader v-if="!teamStore.$storageCapacityExceeded"
    flat
    v-bind="$attrs"
    :bordered="bordered"
    :multiple="maxFiles !== 1"
    :accept="allowedFormatsVideoExt"
    :max-files="maxFiles"
    :label="label"
    :readonly="readonly"
    :color="color || readonly
        ? ($q.dark.mode ? 'grey-8' : 'grey-4')
        : 'primary'
    "
    :class="classRef"
    class="overflow-hidden"
    @added="addFiles"
    @rejected="onRejected"
  />
  <div v-else class="flex flex-center" style="min-width: 24rem; min-height: 8rem;">
    {{ $t('storage_capactiy_exceeded') }}
  </div>
</template>

<script setup>
import { ref, toRefs, computed } from "vue";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import localforage from "localforage";
import { teamStore, userStore } from "src/hooks/global/useStore.js";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: ".jpg,.png,.mp4,.mov,.m4v,.jpeg,.png,.webp,.svg,.avi",
  },
  maxFiles: {
    type: Number,
    default: 10,
  },
  remoteFloder: {
    type: String,
    default: "test/",
  },
  needUpload: {
    type: Boolean,
    default: false,
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  bordered: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["uploaded"]);

const {
  maxFiles,
  accept,
  label,
  readonly,
  class: classRef,
  color,
  bordered,
} = toRefs(props);

const allowedFormatsVideoExt = computed(() => teamStore.card?.type === 'classroom' ? '.mp4,.mov,.m4v,.flv,.webm' : accept.value);

const me = ref(userStore.me);
if (!me.value) {
  localforage.getItem("__strapi_me").then((res) => {
    me.value = res;
  });
}
const addFiles = async (val) => {
  // console.log("complateFiles", val);
  let res = await confirmUpload(val, me.value);
  if (res) {
    emit("uploaded", res);
  }
};

const onRejected = (files) => {
  console.log('rejected files:', files);
  
  const reasons = files.map(file => {
    if (file.failedPropValidation === 'accept') {
      return `仅接受 "${allowedFormatsVideoExt.value}" 格式`;
    }
    if (file.failedPropValidation === 'max-file-size') {
      return `文件 "${file.name}" 超出大小限制`;
    }
    return `文件 "${file.name}" 上传失败`;
  });

  $q.notify({
    color: 'negative',
    position: 'top',
    message: reasons.join('\n'),
    timeout: 3000,
    multiLine: true
  });
};
</script>

<style lang="scss" scoped></style>
