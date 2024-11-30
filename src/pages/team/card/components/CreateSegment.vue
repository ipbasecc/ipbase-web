<template>
  <div
    class="rounded-borders flex flex-center"
    :class="$q.dark.mode ? 'bg-dark text-grey-3' : 'bg-white text-grey-8'"
    :style="`height: ${uiStore.reelHeight + 8}px;width: ${
      ((uiStore.reelHeight + 8) / 9) * 16
    }px;`"
  >
    <DrapUpload
      class="fit unselected cursor-pointer"
      ref="uploadRef"
      :isOSS="true"
      :allowedFormats="['image/jpg','image/jpeg','image/png','image/svg','image/webp']"
      @uploaded="uploaded"
    />
  </div>
</template>

<script setup>
import { ref, toRefs, nextTick } from "vue";
import { createCard } from "src/api/strapi/project.js";
import { uiStore } from "src/hooks/global/useStore.js";
import DrapUpload from "src/components/VIewComponents/DrapUpload.vue";

const props = defineProps({
  column_id: {
    type: Number,
    default: NaN,
  },
  createType: {
    type: String,
    default: null,
  },
});
const { column_id } = toRefs(props);

const emit = defineEmits(["closeCreate"]);
const loading = ref(false);
const params = ref({
  column_id: column_id.value,
  data: {
    status: "pending",
    type: "segment",
    name: "",
    media: NaN,
  },
});
const createCardFn = async (file) => {
  if (loading.value) {
    closeCreate();
    return;
  }
  loading.value = true;
  params.value.data.name = file.attributes.name;
  params.value.data.media = file.id;
  let res = await createCard(params.value);
  if (res?.data) {
    closeCreate(); // 父组件关闭创建窗口
  } else {
    console.log(res);
  }
};
const closeCreate = () => {
  emit("closeCreate");
};

const uploaded = async (file) => {
  console.log(file);
  await createCardFn(file);
};
const uploadRef = ref();
const handleNodeClick = async () => {
  await nextTick();
  uploadRef.value?.openFilePicker();
};
defineExpose({ handleNodeClick });
</script>

<style scoped></style>
