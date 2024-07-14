<template>
  <q-card
    bordered
    style="min-width: 462px; min-height: 360px"
    class="transition"
    @keyup.enter="create_project"
  >
    <template v-if="!loading">
      <q-card-section class="border-bottom row no-wrap">
        <span>新建项目</span>
        <q-space />
        <q-btn dense round flat size="sm" icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="q-pa-lg create_project">
        <q-card flat square>
          <q-card-section>
            <q-img
              v-if="media"
              :src="media.attributes.url"
              :ratio="16 / 9"
              spinner-color="primary"
              spinner-size="82px"
              class="radius-xs"
            />
            <UploadFile
              v-else
              label="项目预览"
              accept=".jpeg,.png,.jpg,.webp"
              :maxFiles="1"
              :autoUpload="true"
              :bordered="false"
              @fileUploaded="fileUploaded"
              :class="'full-width border-dotted border-op-sm q-pa-sm'"
            />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="column no-wrap gap-md">
              <q-input
                v-model="params.name"
                type="text"
                label="项目名称"
                class="q-px-sm"
                hint="请在此处输入您的项目名称"
                :rules="[
                  (val) =>
                    val?.length <= 32 || '项目名称最多32个英文字符、或16个中文',
                ]"
              />
              <q-input
                v-model="params.description"
                type="textarea"
                label="摘要、备注、说明"
                class="q-px-sm"
                hint="您可以为您的项目添加简单的说明，方便成员理解项目内容"
                :rules="[
                  (val) =>
                    val.length <= 256 ||
                    '项目名称最多256个英文字符、或128个中文',
                ]"
              />
              <div v-if="false" class="row no-wrap gap-sm q-pt-md">
                <q-radio
                  v-for="i in project_private"
                  :key="i.val"
                  v-model="project_type"
                  :val="i.val"
                  :label="i.label"
                  @click.stop="setPrivate()"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
      <q-card-section class="row no-wrap q-pa-sm border-top">
        <q-btn flat dense padding="xs md" label="取消" v-close-popup />
        <q-space />
        <q-btn
          color="primary"
          dense
          padding="xs md"
          icon="check"
          label="创建"
          @click="create_project"
        />
      </q-card-section>
    </template>
    <q-inner-loading
      v-else
      :showing="loading"
      label="正在创建，请稍后..."
      label-class="text-white"
      label-style="font-size: 1.1em"
    />
  </q-card>
</template>

<script setup>
import { ref, computed } from "vue";
import UploadFile from "src/components/Utilits/UploadFile.vue";
import { createProjectFn } from "src/pages/team/hooks/useCreateProject.js";
import { teamStore } from "src/hooks/global/useStore.js";

const project_type = ref("P");
const project_private = [
  //P - personal : 私有 ； O - Open ： 公开
  { label: "私有项目", val: "P", icon: "" },
  { label: "公开项目", val: "O", icon: "" },
];
const team = computed(() => teamStore.team);
const params = ref({
  name: "",
  description: "",
  by_team: team.value,
  overview_media: process.env.DEFAULT_PROJECT_OVERVIEW_MEIDA,
  type: "P",
});
const media = ref();
const fileUploaded = (id, obj) => {
  params.value.overview_media = id;
  media.value = obj;
};
const setPrivate = () => {
  params.value.type = project_type.value;
};
const emit = defineEmits(["projectCreated"]);

const loading = ref(false);
const create_project = async () => {
  if (!params.value?.name || loading.value) return;
  loading.value = true;
  let res = await createProjectFn(params.value);
  if (res) {
    loading.value = false;
    emit("projectCreated", res);
  }
};
</script>

<style lang="scss">
.create_project .q-field__bottom {
  opacity: 0.5;
}
</style>
