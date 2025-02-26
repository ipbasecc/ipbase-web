<!-- 需要国际化 -->
<template>
  <div class="q-pa-md">
    <q-list class="q-pa-sm">
      <q-item v-if="useAuths('type', ['project'])">
        <q-item-section side top>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section>
          <div class="column gap-sm">
            <q-select
              outlined
              v-model="update_params.data.type"
              :options="[
                'project', 'service'
              ]"
              label="运行方式"
              style="width: 250px"
              @update:model-value="update_type()"
            />
            <div v-if="update_params.data.type === 'service'" class="radius-xs border" style="min-height: 8rem;">
              <TipTap
                :jsonContent="update_params.data.jsonContent"
                :editable="useAuths('jsonContent', ['project'])"
                :need="'json'"
                :square="true"
                :contentChanged="true"
                @tiptapUpdate="tiptapUpdate"
              />
            </div>
            <div v-if="update_params.data.jsonContent && update_params.data.type === 'service'"  class="row">
              <q-btn color="primary" label="保存" @click="update_jsonContent()" />
            </div>
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="useAuths('private', ['project'])">
        <q-item-section side>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section>
          <div class="row">
            <q-toggle v-model="update_params.data.private" dense label="仅成员可见" left-label @update:model-value="update_private()" />
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="useAuths('price', ['project'])">
        <q-item-section side>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section class="q-pr-lg">
          <div class="column gap-sm">
            <q-input v-model="project_service_sub_price" outlined type="number" label="订阅价格" style="width: 250px" />
            <div class="row">
              <q-btn v-if="update_params.data.type === 'service' && +project_service_sub_price !== teamStore.project?.price / 100"
                color="primary" label="保存" @click="update()"
              />
            </div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('archive', ['project'])"
        clickable
        v-ripple
        v-close-popup
        @click="deleteProjectFn('archive')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="archive" />
        </q-item-section>
        <q-item-section class="q-pr-lg">{{ $t('archive_project') }}</q-item-section>
      </q-item>
      <q-item
        v-if="useAuths('delete', ['project'])"
        clickable
        v-ripple
        @click="deleteProjectFn('delete')"
        class="radius-xs"
      >
        <q-item-section side>
          <q-icon color="primary" name="close" />
        </q-item-section>
        <q-item-section class="q-pr-lg">{{ $t('delete_project') }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { deleteProject } from "src/api/strapi/project.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import { updateProject } from "src/api/strapi/project.js";
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'

const emit = defineEmits(["projectDeleted"]);

const update_params = ref({
  data: {
    type: teamStore.project?.type || 'project',
    price: teamStore.project?.price ? teamStore.project?.price / 100 : NaN,
    private: teamStore.project?.private || false,
    jsonContent: teamStore.project?.jsonContent || null,
  }
})
const tiptapUpdate = (val) => {
  update_params.value.data.jsonContent = val
}
const project_service_sub_price = ref(0);
onMounted(() => {
  project_service_sub_price.value = teamStore.project?.price ? teamStore.project?.price / 100 : NaN
})
const update = async () => {
  if(project_service_sub_price.value > 0){
    update_params.value.data.price = project_service_sub_price.value * 100
  }
  const { data } = await updateProject(teamStore.project?.id, update_params.value)
  if(data) {
    return data
  }
}
const update_private = async () => {
  await await updateProject(teamStore.project?.id, {
    data: {
      private: update_params.value.data.private
    }
  })
  project_service_sub_price.value = 0
}
const update_type = async () => {
  await await updateProject(teamStore.project?.id, {
    data: {
      type: update_params.value.data.type
    }
  })
}
const update_jsonContent = async () => {
  await await updateProject(teamStore.project?.id, {
    data: {
      jsonContent: update_params.value.data.jsonContent
    }
  })
}
const deleteProjectFn = async (option) => {
  let res = await deleteProject(teamStore.project.id, option);
  if (res?.data) {
    uiStore.project_settings = false;
  }
};
</script>
