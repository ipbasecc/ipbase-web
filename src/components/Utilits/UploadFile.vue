<template>
  <OssUploader
    :label="label"
    :maxFiles="maxFiles"
    :accept="accept"
    :autoUpload="autoUpload"
    :bordered
    @filesOfUploaded="fileUploaded"
    :class="classRef"
  />
</template>
<script setup>
import { ref, inject } from "vue";
import OssUploader from "src/components/Utilits/OssUploader.vue";
import { createUploadFile } from "src/apollo/api/api.js";
import { toRefs } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "点击按钮选择文件，或拖拽文件到下方",
  },
  accept: {
    type: String,
    default: ".jpg,.png,.mp4,.mov,.m4v,.jpeg,.png,.webp,.svg,.avi",
  },
  MaxTotalSize: {
    type: Number,
    default: 20480000000,
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

const imageType = inject("imageType");

const fileId = ref();

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
  console.log("接收到文件：", val);

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
