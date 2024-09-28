import { ref } from "vue";
import { createUploadFile } from "src/apollo/api/api.js";
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

const fileId = ref();
const Response = ref();
const RespsFile = ref([]);
export const syncStrapiFile = async (val) => {
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
        return {
            file_id: fileId.value,
            file: RespsFile.value[0]
        }
    }
  };
  upload(newArr[count]);
};
