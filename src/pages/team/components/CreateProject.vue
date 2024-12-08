<template>
  <q-card
    bordered
    style="min-width: 462px; min-height: 360px"
    class="transition"
    @keyup.enter="create_project"
  >
    <template v-if="!loading">
      <q-card-section class="border-bottom row no-wrap">
        <span>{{ $t('create_project') }}</span>
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
            <DrapUpload v-else :isOSS="true" class="radius-md border-xs border-dashed border-primary"
            :allowedFormats="uiStore.allowedFormatsImage"
            @uploaded="fileUploaded" style="min-height: 8rem;" :caption="$t('drop_or_pick_cover')" />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="column no-wrap gap-md">
              <q-input
                v-model="params.name"
                type="text"
                :label="$t('project_title')"
                class="q-px-sm"
                :hint="$t('project_title_input_tip')"
                :rules="[
                  (val) =>
                    val?.length <= 32 || $t('project_title_rules_tip'),
                ]"
              />
              <q-input
                v-model="params.description"
                type="textarea"
                :label="$t('project_description')"
                class="q-px-sm"
                :hint="$t('project_description_input_tip')"
                :rules="[
                  (val) =>
                    val.length <= 256 ||
                    $t('project_description_rules_tip'),
                ]"
              />
              <div v-if="false" class="row no-wrap gap-sm q-pt-md">
                <q-radio
                  v-for="i in project_private"
                  :key="i.val"
                  v-model="project_type"
                  :val="i.val"
                  :label="$t(i.label)"
                  @click.stop="setPrivate()"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-card-section>
      <q-card-section class="row no-wrap q-pa-sm border-top">
        <q-btn flat dense padding="xs md" :label="$t('cancel')" v-close-popup />
        <q-space />
        <q-btn
          color="primary"
          dense
          padding="xs md"
          icon="check"
          :label="$t('create')"
          @click="create_project"
        />
      </q-card-section>
    </template>
    <q-inner-loading
      v-else
      :showing="loading"
      :label="$t('creating_waiting')"
      label-class="text-white"
      label-style="font-size: 1.1em"
    />
  </q-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { createProjectFn } from "src/pages/team/hooks/useCreateProject.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'

const project_type = ref("P");
const project_private = [
  //P - personal : 私有 ； O - Open ： 公开
  { label: "private_project", val: "P", icon: "" },
  { label: "public_project", val: "O", icon: "" },
];
const team = computed(() => teamStore.team);
const params = ref({
  name: "",
  description: "",
  by_team: team.value,
  overview_media: import.meta.env.VITE_DEFAULT_PROJECT_OVERVIEW_MEIDA,
  type: "P",
});
const media = ref();
const fileUploaded = (val) => {
  // params.value.overview_media = id;
  // media.value = obj;
  params.value.overview_media = val.id
  media.value = val
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
