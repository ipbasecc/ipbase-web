<template>
  <OssUploader
    :label="label"
    :maxFiles="maxFiles"
    :accept="accept"
    :autoUpload="autoUpload"
    :bordered
    :max-total-size="MaxTotalSize"
    @filesOfUploaded="fileUploaded"
    :class="classRef"
  />
</template>
<script setup>
import { ref, inject, computed } from "vue";
import OssUploader from "src/components/Utilits/OssUploader.vue";
import { createUploadFile } from "src/apollo/api/api.js";
import { toRefs } from "vue";
import { teamStore } from "src/hooks/global/useStore";

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
  bordered: {
    type: Boolean,
    default: true,
  },
});
const { class: classRef } = toRefs(props);

const emit = defineEmits(["fileUploaded"]);

const fileId = ref();
const MaxTotalSize = computed(() => {
  const limit = teamStore.level_detail?.singal_file_limit;
  if (limit === -1) return null;
  if (limit > 0) return limit * 1024 * 1024 * 1024;
  return 1 * 1024 * 1024 * 1024;
})

const uploadFileParams = ref({
  url: "",
  name: "",
  size: "",
  ext: "",
  caption: "",
  hash: "",
  mime: "",
  provider: "",
  folderPath: "/",
});
const {
  mutate: uploadFileMutate,
  onDone: uploadFileOnDone,
  onError: uploadFileonError,
} = createUploadFile(uploadFileParams);

const Response = ref();
const RespsFile = ref([]);
const uploadFile = (val) => {
  let arr = val;
  // console.log("接收到文件：", val);

  Response.value = arr.map((item) => {
    const newUrl = item.url.res.requestUrls[0].split("?")[0];
    return {
      ...item,
      url: newUrl,
    };
  });
  // console.log("格式化提交对象", Response.value);

  let newArr = Response.value;
  let count = 0;
  let maxCount = val.length;

  const upload = async (file) => {
    uploadFileParams.value = file;
    const { data } = await uploadFileMutate();
    // console.log("文件更新到strapi", data);
    let Resps = data.createUploadFile.data;
    let RespsId = data.createUploadFile.data.id;
    // console.log("Strapi文件ID", RespsId);
    fileId.value = RespsId;
    RespsFile.value.push(Resps);
    count++;
    if (count < maxCount) {
      await upload(newArr[count]);
    } else {
      // console.log("文件已上传");
      emit("fileUploaded", fileId.value, RespsFile.value[0]);
    }
  };
  upload(newArr[count]);
};
const fileUploaded = (val) => {
  uploadFile(val);
};
</script>
