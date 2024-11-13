<template>
  <q-uploader v-if="!teamStore.storageCapacityExceeded"
    flat
    v-bind="$attrs"
    :bordered="bordered"
    :multiple="maxFiles !== 1"
    :accept="accept"
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
  />
  <div v-else class="flex flex-center" style="min-width: 24rem; min-height: 8rem;">
    {{ $t('storage_capactiy_exceeded') }}
  </div>
</template>

<script setup>
import { ref, toRefs } from "vue";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import localforage from "localforage";
import { teamStore, userStore } from "src/hooks/global/useStore.js";

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
</script>

<style lang="scss" scoped></style>
