import { OSS } from "boot/oss";
import { uid } from "quasar";
import localforage from "localforage";
import { createUploadFile } from "src/apollo/api/api.js";
import { ref, computed } from "vue";
import Bottleneck from "bottleneck";
import useUserStore from "src/stores/user.js";
import useProjectStore from "src/stores/project.js";
import useTeamStore from "src/stores/team.js";
import useOss from "src/stores/oss.js";

const ossStore = useOss();
const userStore = useUserStore();
const projectStore = useProjectStore();
const teamStore = useTeamStore();

const project_id = computed(
  () =>
    projectStore?.project_id ||
    projectStore?.project?.id ||
    teamStore?.project_id ||
    teamStore?.project?.id
);

const path_prefix = computed(() => {
  let path;
  if (userStore.userId && project_id.value) {
    path = `${userStore.userId}/${project_id.value}`;
  } else if (userStore.userId && !project_id.value) {
    path = `${userStore.userId}`;
  } else {
    path = "";
  }
  return path;
});

const uploadQueue = new Bottleneck({ maxConcurrent: 5 });

const uploadFileParams = ref();
const {
  mutate: uploadFileMutate,
  onDone: uploadFileOnDone,
  onError: uploadFileonError,
} = createUploadFile(uploadFileParams);

// 定义一个异步的uploadFile函数，接收一个文件作为参数，返回一个promise
async function uploadFile(file, username, id) {
  // 检查file参数是否是一个File对象
  if (file instanceof File) {
    // 浏览器 获取文件大小，并转化为m单位，四舍五入到整数
    let fileSize = Math.round(file.size / 1024 / 1024);
    try {
      // 等待OSS.uploadFile方法的结果
      let res = await OSS.uploadFile(
        `${process.env.ROOT || "ipbase"}/${path_prefix.value}/` + file.name,
        file,
        id
      );
      // 构造一个包含文件信息的对象
      if (res) {
        // console.log(res);
        uploadFileParams.value = {
          url: res.res.requestUrls[0].split("?")[0],
          name: file.name,
          size: fileSize,
          caption: `${username} 于 ${new Date().toISOString()} 上传`,
          hash: uid() + "-" + file.name,
          mime: file.type,
          provider: "yihu",
          folderPath: "/",
          ext: "." + file.name.slice(file.name.lastIndexOf(".") + 1),
        };
        const { data } = await uploadFileMutate();
        if (data) {
          // console.log("文件更新到strapi", data);
          let file = data.createUploadFile.data;
          return file;
        }
      }
    } catch (e) {
      // 处理或抛出错误
      console.log("上传错误" + e);
      throw e;
    }
  } else {
    // 如果不是，就跳过上传或者抛出错误
    console.log("无效的文件参数");
    throw new Error("无效的文件参数");
  }
}

// 定义一个异步的confirmUpload函数，接收一个文件数组和一个me对象作为参数，返回一个promise
export async function confirmUpload(files, me) {
  // console.log('confirmUpload',files);
  if (!me) {
    let err = "需要提供 me 参数";
    // console.log("文件获取错误" + err);
    throw err;
  }
  ossStore.showList = true;
  try {
    let filesArray = Array.from(files);

    let complateFiles = [];
    // 将每个文件上传任务添加到队列中
    await Promise.all(
      filesArray.map(async (file, index) => {
        // console.log('file',file);
        let now = Date.now();
        let id = `${index}_${now}`;
        let __ = {
          name: file.name,
          type: file.type,
          size: file.size,
          complate: false,
          id: id,
          percent: 0,
        };
        ossStore?.uploadQueue.push(__);
        // console.log('uploadQueue',ossStore.uploadQueue);
        try {
          const res = await uploadQueue.schedule(async () => {
            // 执行上传逻辑，例如使用 axios 或其他上传库
            let uploadedFile = await uploadFile(file, me.username, id);
            if (uploadedFile) {
              if (ossStore.uploadQueue?.map((i) => i.id).includes(id)) {
                ossStore.uploadQueue.find((i) => i.id === id).complate = true;
                ossStore.uploadQueue.find((i) => i.id === id).percent =
                  ossStore.process?.find((i) => i.id === id).percent;
              }
              try {
                let upload_pool = {
                  process: ossStore.process,
                  uploadQueue: ossStore.uploadQueue,
                };
                let ___ = JSON.parse(JSON.stringify(upload_pool));
                await localforage.setItem("upload_pool", ___);
              } catch (error) {
                console.error(error);
              }
              complateFiles.push(uploadedFile);
            }
          });
        } catch (error) {
          console.error(error);
        }
      })
    );

    // console.log('complateFiles',complateFiles);
    return complateFiles;
  } catch (e) {
    console.log("文件获取错误" + e);
    throw e;
  }
}
