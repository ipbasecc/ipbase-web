<template>
  <div class="fit flex flex-center cursor-pointer"
    :class="`${
      showUpdateArea ? 'border radius-sm bg-selected' : ''
    } drop-zone_${dom_id}`"
    :ref="`dropZone_${dom_id}`"
    @click="openFilePicker"
  >
    <div class="column gap-sm items-center" :class="tipClass">
      <span class="font-medium q-mb-sm">{{ caption || $t('click_or_drag_to_upload') }}</span>
      <span class="op-5 font-small">{{$t('support_type')}}: {{ getMimeExtensions(allowedFormats) }}</span>
      <span class="op-5 font-small">{{$t('max_file_size')}}: {{ maxFileSize / (1024 * 1024) }}MB</span>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="allowedFormats"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, toRefs, nextTick, computed } from "vue";
import { confirmUpload } from "src/hooks/utilits/useConfirmUpload.js";
import { useQuasar, uid } from "quasar";
import { useUploadAvatar } from "src/pages/UserCenter/hooks/useUploadAvatar.js";
import { updateUserAvatar } from "src/api/strapi.js";
import localforage from "localforage";
import { teamStore, userStore } from "src/hooks/global/useStore";
import { useI18n } from "vue-i18n";
import { getMimeExtensions } from "src/hooks/utilits";

const { t } = useI18n();
const me = computed(() => teamStore.init)

const $q = useQuasar();

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  maxFileSize: {
    type: Number,
    default: 15 * 1024 * 1024, // 15MB in bytes
  },
  isMattermost: {
    type: Boolean,
    default: false,
  },
  isAvatar: {
    type: Boolean,
    default: false,
  },
  isOSS: {
    type: Boolean,
    default: false,
  },
  caption: {
    type: String,
    default: null,
  },
  allowedFormats: {
    type: Array,
    default: () => {
      return ['image/*']
    },
  },
  tipClass: {
    type: String,
    default: '',
  }
});
const emit = defineEmits(["uploaded"]);
const { multiple, isAvatar, isOSS, isMattermost, allowedFormats, maxFileSize } = toRefs(props);

const dom_id = uid(); // 如果一个页面中引用了两次本组件，那么会有一个失效，因此这里给dom加上uid
const fileInputRef = ref(null);

const dropZone = ref(null);

// 定义响应式数据
const files = ref([]);
// 定义上传文件的方法
const onDrop = async (e) => {
  files.value = e;
  // console.log(e);

  try {
    let res;
    if (isAvatar.value) {
      // console.log([files.value[0]]);
      let strapi_res = await confirmUpload([files.value[0]], me.value);
      if (strapi_res) {
        let parmars = {
          data: {
            avatar: Number(strapi_res[0].id),
          },
        };
        let strapi_avatar = await updateUserAvatar(parmars);
        if (strapi_avatar) {
          console.log('strapi_avatar', strapi_avatar);
          
          userStore.avatar = strapi_avatar.data.avatar.id;
          let __strapi_userMatedate = await localforage.getItem(
            "__strapi_userMatedate"
          );
          if (__strapi_userMatedate) {
            if(__strapi_userMatedate.profile?.avatar){
              __strapi_userMatedate.profile.avatar = strapi_avatar.data.avatar
            } else {
              __strapi_userMatedate.profile = {
                avatar: strapi_avatar
              }
            }
            const _cacheVal = JSON.parse(JSON.stringify(__strapi_userMatedate))
            await localforage.setItem(
              "__strapi_userMatedate",
              _cacheVal
            );
          }
        }
      }
      // 更新Mattermost用户头像
      res = await useUploadAvatar(files.value);
      if (res) {
        emit("uploaded");
      }
    }
    if (isMattermost.value) {
      // 上传到Mattermost
    }
    if (isOSS.value) {
      // console.log([files.value[0]]);
      const res = await confirmUpload([files.value[0]], me.value);
      if (res) {
        emit("uploaded", res[0]);
      }
    }
  } catch (e) {
    // 处理错误
    console.error(e);
  }
};

const openFilePicker = () => {
  // 触发文件选择框
  fileInputRef.value.click();
};
defineExpose({ openFilePicker });

const handleFileChange = (event) => {
  const selectedFile = event.target.files;
  if (selectedFile) {
    // Check file size
    for (let i = 0; i < selectedFile.length; i++) {
      if (selectedFile[i].size > maxFileSize.value) {
        $q.notify({
          type: 'negative',
          message: t('file_too_large', { size: maxFileSize.value / (1024 * 1024) }),
          position: 'top'
        });
        event.target.value = ''; // Reset input
        return;
      }
    }
    onDrop(selectedFile);
  }
};

// 定义一个响应式的标志，表示是否显示拖拽区域
const showUpdateArea = ref(false);

// 拖拽进入事件
const handleDragEnter = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 设置标志为true
  showUpdateArea.value = true;
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
  dropZone.value.style.pointerEvents = "auto";
};

// 拖拽移动事件
const handleDragOver = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 设置标志为true
  showUpdateArea.value = true;
  // 设置拖拽效果为复制
  e.dataTransfer.dropEffect = "copy";
};

// 拖拽离开事件
const handleDragLeave = (e) => {
  // 阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();
  // 判断事件目标是否是div元素本身
  if (e.target === dropZone.value) {
    // 设置标志为false
    showUpdateArea.value = false;
    // 设置活动文件夹为null
  }
};

// 拖拽释放事件
const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (showUpdateArea.value) {
    let items_asfile = e.dataTransfer?.files;
    if (items_asfile.length > 1 && !multiple.value) {
      $q.notify(t('upload_not_support_mutiple'));
      return;
    }
    let files = [];
    for (let i = 0; i < items_asfile.length; i++) {
      // Check file size
      if (items_asfile[i].size > maxFileSize.value) {
        $q.notify({
          type: 'negative',
          message: t('file_too_large', { size: maxFileSize.value / (1024 * 1024) }),
          position: 'top'
        });
        showUpdateArea.value = false;
        return;
      }
      
      if (items_asfile[i].type !== "") {
        if (!allowedFormats.value.includes(items_asfile[i].type)) {
          $q.notify({
            type: 'negative',
            message: t('unsupported_file_format'),
            position: 'top'
          });
          showUpdateArea.value = false;
          return;
        }
        files.push(items_asfile[i]);
      }
    }
    if (files.length > 0) {
      onDrop(files);
    }
  }
  showUpdateArea.value = false;
};
// 在组件挂载时，绑定事件监听器到div元素上
onMounted(async () => {
  await nextTick();
  // 获取div元素的引用
  dropZone.value = document.querySelector(`.drop-zone_${dom_id}`);
  // 绑定事件监听器到div元素上
  dropZone.value.addEventListener("dragenter", handleDragEnter, false);
  dropZone.value.addEventListener("dragover", handleDragOver, false);
  dropZone.value.addEventListener("dragleave", handleDragLeave, false);
  dropZone.value.addEventListener("drop", handleDrop, false);
});

// 在组件卸载时，移除事件监听器
onUnmounted(() => {
  if(!dropZone.value) return
  // 移除事件监听器
  dropZone.value.removeEventListener("dragenter", handleDragEnter, false);
  dropZone.value.removeEventListener("dragover", handleDragOver, false);
  dropZone.value.removeEventListener("dragleave", handleDragLeave, false);
  dropZone.value.removeEventListener("drop", handleDrop, false);
});
</script>

<style lang="scss" scoped></style>
