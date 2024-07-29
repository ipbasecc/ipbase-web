<template>
  <q-card bordered style="min-width: 28rem">
    <q-card-section class="row no-wrap items-center q-pa-sm border-bottom">
      <span>{{ $t('team_settings') }}</span>
      <q-space />
      <q-btn flat dense size="sm" round icon="close" v-close-popup />
    </q-card-section>
    <q-card-section>
      <div class="column gap-lg no-wrap q-pa-md">
        <q-img
          v-if="!changeLogo && (team?.team_logo?.url || media?.attributes?.url)"
          :src="team?.team_logo?.url || media?.attributes?.url"
          :ratio="16 / 9"
          spinner-color="primary"
          spinner-size="82px"
          fit="contain"
          class="radius-xs"
        >
          <div class="absolute-full column flex-center">
            <q-btn
              color="primary"
              :label="$t('update_team_icon')"
              @click="changeLogo = true"
            />
          </div>
        </q-img>
        <UploadFile
          v-else
          :label="$t('team_icon')"
          accept=".jpeg,.png,.jpg,.webp"
          :maxFiles="1"
          :autoUpload="true"
          :bordered="false"
          @fileUploaded="fileUploaded"
          :class="'full-width border-dashed border-op-sm q-pa-sm'"
        />
        <q-btn
          v-if="changeLogo"
          flat
          :label="$t('cancel')"
          @click="changeLogo = false"
        />
        <q-input
          v-model="params.data.display_name"
          filled
          outlined
          type="text"
          :placeholder="$t('team_name')"
          class="radius-xs overflow-hidden"
        />
      </div>
    </q-card-section>
    <q-card-section class="q-pa-sm row no-wrap items-center border-top">
      <q-space />
      <q-btn
        color="primary"
        padding="xs lg"
        :label="$t('confirm')"
        v-close-popup
        @click="update()"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import UploadFile from "src/components/Utilits/UploadFile.vue";
import { ref, toRefs } from "vue";
import { updateTeam } from "src/api/strapi/team.js";
import { teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  team: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["teamUpdated"]);

const { team } = toRefs(props);

const params = ref({
  data: {
    display_name: null,
    team_logo: NaN,
  },
});
const changeLogo = ref(false);
const media = ref();
const fileUploaded = (id, obj) => {
  params.value.data.team_logo = id;
  media.value = obj;
};

const update = async () => {
  const res = await updateTeam(team.value?.id, params.value);
  if (res?.data) {
    teamStore.team = res.data;
  }
};
</script>

<style lang="scss" scoped></style>
