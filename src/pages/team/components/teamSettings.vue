<template>
  <q-card bordered style="min-width: 54rem;">
    <q-card-section class="row no-wrap items-center q-pa-sm border-bottom">
      <span>{{ $t('team_settings') }}</span>
      <q-space />
      <q-btn flat dense size="sm" round icon="close" v-close-popup />
    </q-card-section>
    <q-card-section class="no-padding">
      <div class="row no-wrap">
        <q-list dense class="column gap-xs q-pa-md border-right">
          <q-item v-for="i in settingsSections" :key="i.name"
            clickable v-ripple
            class="radius-xs"
            @click="scrollTo(i.name)"
            style="min-width: 8rem;"
          >
            <q-item-section>{{ $t(i.name) }}</q-item-section>
          </q-item>
        </q-list>
        <q-scroll-area ref="scrollArea" class="q-space" style="min-height: 50vh; max-height: 64rem">
          <div class="q-space column gap-lg no-wrap q-pa-md">
            <div ref="logo_section" class="row no-wrap q-mb-xl">
              <div class="col-3"></div>
              <q-img
                :src="media?.attributes?.url || team?.team_logo?.url || ''"
                :ratio="1"
                spinner-color="primary"
                spinner-size="82px"
                fit="contain"
                class="radius-lg"
              >
                <div class="absolute-full column flex-center">
                  <DrapUpload
                    :isOSS="true"
                    :allowedFormats="$ui().allowedFormatsImage"
                    :caption="$t('drop_or_pick_cover')"
                    tipClass="flex-center"
                    @uploaded="fileUploaded"
                  />
                </div>
              </q-img>
              <div class="col-3"></div>
            </div>
            <q-input ref="name_section"
              v-model="params.data.display_name"
              filled
              outlined
              type="text"
              :placeholder="$t('team_name')"
              class="radius-xs overflow-hidden q-my-xl"
            />
            <div ref="mode_section" class="row no-wrap items-center gap-xl q-mb-xl">
              <template v-for="i in modes" :key="i.value">
                <q-card bordered class="col">
                  <q-card-section>
                    <q-radio v-model="mode" :val="i.value" :label="$t(i.label)" @update:model-value="syncParams()" />
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <div class="text-subtitle2 q-px-md">
                      {{ i.value === 'toOne' ? $t('team_toOne_mode_tip') : $t('team_toMany_mode_tip') }}
                    </div>
                  </q-card-section>
                </q-card>
              </template>
            </div>
            <div ref="funcition_section" class="row items-center">
              {{ $t('disable_teamFunc_labe') }}: 
              <div class="row items-center q-pa-sm border radius-xs q-ml-md">
                <span v-if="disabed_func?.length === 0" class="q-px-md q-py-xs op-5">{{ $t('no_disable_teamFunc') }}</span>
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
        </q-scroll-area>
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
import { ref, toRefs, computed, onMounted, useTemplateRef } from "vue";
import { updateTeam } from "src/api/strapi/team.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
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
const settingsSections = [
  {
    icon: '',
    name: 'logo_section'
  },
  {
    icon: '',
    name: 'name_section'
  },
  {
    icon: '',
    name: 'mode_section'
  },
  {
    icon: '',
    name: 'funcition_section'
  },
]

const scrollArea = useTemplateRef('scrollArea');
const logo_section = useTemplateRef('logo_section');
const name_section = useTemplateRef('name_section');
const mode_section = useTemplateRef('mode_section');
const funcition_section = useTemplateRef('funcition_section');
const scrollTo = (name) => {
  const sectionRefs = {
    logo_section: logo_section,
    name_section: name_section,
    mode_section: mode_section,
    funcition_section: funcition_section,
  };
  
  const targetRef = sectionRefs[name];
  if (targetRef) {
    scrollArea.value.setScrollPosition('vertical', targetRef.value?.offsetTop, 300);
  }
}
const toggleChose = (val) => {
  if (disabed_func.value?.length> 0 && disabed_func.value?.includes(val)) {
    disabed_func.value = disabed_func.value.filter((i) => i !== val);
  } else {
    disabed_func.value.push(val)
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
const fileUploaded = (obj) => {
  params.value.data.team_logo = obj.id;
  media.value = obj;
};

const update = async () => {
  const res = await updateTeam(team.value?.id, params.value);
  if (res?.data) {
    // teamStore.team = res.data;
  }
};
</script>

<style lang="scss" scoped></style>
