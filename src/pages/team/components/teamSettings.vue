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
        <div class="row no-wrap items-center">
          <template v-for="i in modes" :key="i.value">
            <q-radio v-model="mode" :val="i.value" :label="$t(i.label)" @update:model-value="syncParams()">
              <q-tooltip v-if="i.value === 'toOne'">
                {{ $t('team_toOne_mode_tip') }}
              </q-tooltip>
            </q-radio>
          </template>
        </div>
        <div class="row items-center">
          {{ $t('disable_teamFunc_labe') }}: 
          <div class="row items-center q-pa-sm border radius-xs q-ml-md">
            <span v-if="disabed_func.length === 0" class="q-px-md q-py-xs op-5">{{ $t('no_disable_teamFunc') }}</span>
            <template v-else>
              <q-chip v-for="i in disabed_func" :key="i"
                :label="$t(functions.find(j => j.value === i).label)"
                square removable color="negative"
                @remove="removeFunc(i)"
              >
                <q-tooltip v-if="i === 'channels'">
                  {{ $t('team_disableChanel_tip') }}
                </q-tooltip>
                <q-tooltip v-if="i === 'projects'">
                  {{ $t('team_disableProjects_tip') }}
                </q-tooltip>
              </q-chip>
            </template>
          </div>
          <q-menu>
            <q-list class="q-pa-xs radius-sm" bordered dense style="min-width: 100px">
              <q-item v-for="i in functions" :key="i.value" clickable v-close-popup @click="toggleChose(i.value)">
                <q-item-section>{{ $t(i.label) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
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
import { ref, toRefs, computed, onMounted } from "vue";
import { updateTeam } from "src/api/strapi/team.js";
import { teamStore } from "src/hooks/global/useStore.js";
// import { i18n } from 'src/boot/i18n.js';

// const $t = i18n.global.t;

const props = defineProps({
  team: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(["teamUpdated"]);

const { team } = toRefs(props);

const modes = [
  {
    label: "toManyMode_team",
    value: "toMany",
  },
  {
    label: "toOneMode_team",
    value: "toOne",
  },
]
const teamMode = computed(() => teamStore.team?.config?.mode)
const disabed = computed(() => teamStore.team?.config?.disabled)
const mode = ref();

const disabed_func = ref([]);
const functions = [
  {
    label: "channels_teamFunc",
    value: "channels",
  },
  {
    label: "projects_teamFunc",
    value: "projects",
  }
]
const toggleChose = (val) => {
  if (disabed_func.value.includes(val)) {
    disabed_func.value = disabed_func.value.filter((i) => i !== val);
  } else {
    disabed_func.value.push(val);
  }
  syncParams();
};
const removeFunc = (val) => {  
  if (disabed_func.value.includes(val)) {
    disabed_func.value = disabed_func.value.filter((i) => i !== val);
  }
  syncParams();
};
onMounted(() => {
  mode.value = teamMode.value;
  disabed_func.value = disabed.value;
})

const params = ref({
  data: {
    display_name: null,
    team_logo: NaN,
    config: {
      mode: mode.value,
      disabled: disabed_func.value,
    },
  },
});
const syncParams = () => {
  params.value.data.config.mode = mode.value;
  params.value.data.config.disabled = disabed_func.value;
};
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
