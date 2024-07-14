<template>
    <div class="q-pa-xl" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'">
        <OssUploader
            :label="'上传媒体内容'"
            :maxFiles="1"
            :accept="accept"
            :autoUpload="true"
            @filesOfUploaded="mediaUploaded"
            :class="'full-width'"
        />
    </div>
</template>
<script setup>
import { ref, inject } from "vue";
import OssUploader from "src/components/Utilits/OssUploader.vue";
import { createUploadFile } from "src/apollo/api/api.js";

const emit = defineEmits(['mediaUploaded']);

const imageType = inject("imageType");
const videoType = inject('videoType');
const audioType = inject('audioType');

const accept = ref(
  [...imageType,...videoType,...audioType].join(',')
)

const mediaId = ref();

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
  console.log("格式化提交对象", Response.value);

  let newArr = Response.value;
  let count = 0;
  let maxCount = val.length;

  const upload = async (file) => {
    uploadFileParams.value = file;
    const { data } = await uploadFileMutate();
    console.log("文件更新到strapi", data);
    let Resps = data.createUploadFile.data;
    let RespsId = data.createUploadFile.data.id;
    console.log("Strapi文件ID", RespsId);
    mediaId.value = RespsId;
    RespsFile.value.push(Resps);
    count++;
    if (count < maxCount) {
      upload(newArr[count]);
    } else {
        console.log("文件已上传");
        emit('mediaUploaded',mediaId.value,RespsFile.value[0])
    }
  };
  upload(newArr[count]);
};
const mediaUploaded = (val) => {
    uploadFile(val);
};
</script>