<template>
  <div class="">
    <div v-if="!onlyMedia && activeVersion"
      v-bind="$attrs"
      class="fit column no-wrap gap-sm relative-position q-pb-sm"
      :class="isClassroom ? 'absolute-full' : ''"
    >
      <OverviewMedia
        v-if="!hideMedia"
        :key="activeVersion.id"
        :activeVersion="activeVersion"
        :isClassroom
        :auth="useAuths('media', ['overview'])"
        @mediaChanged="mediaChanged"
      />
      <div
        class="column no-wrap q-px-sm gap-sm q-pt-sm"
        :class="isClassroom ? 'q-pb-sm' : ''"
      >
        <OverviewName v-if="name" :wasAttached_to="wasAttached_toRef" :auth="useAuths('name', ['overview'])" />
        <OverviewDesc
          v-if="wasAttached_toRef === 'project'"
          :auth="useAuths('description', ['overview'])"
          :wasAttached_to="wasAttached_toRef"
        />
      </div>
      <div v-if="!isClassroom"
        class="row no-wrap gap-md items-center justify-between q-mx-sm"
      >
        <OverviewStart
          :wasAttached_to="wasAttached_toRef"
          :activeVersion="activeVersion"
          :auth="useAuths('start', ['overview'])"
          @startChanged="startChanged"
        />
        <OverviewEnd
          :wasAttached_to="wasAttached_toRef"
          :activeVersion="activeVersion"
          :auth="useAuths('end', ['overview'])"
          @endChanged="endChanged"
        />
        <OverviewDeadline
          :wasAttached_to="wasAttached_toRef"
          :activeVersion="activeVersion"
          :auth="useAuths('deadline', ['overview'])"
          @deadlineChanged="deadlineChanged"
        />
      </div>
      <div class="row no-wrap gap-md q-pa-sm q-mx-sm items-center radius-xs border">
        <template v-if="useAuths('start', ['overview'])">
          <span
            v-if="!version_update_ing"
            class="q-space q-ml-sm"
            @dblclick="version_update_ing = activeVersion?.id"
          >
            {{ activeVersion.name === 'Initial_Version' ? $t(activeVersion.name) : activeVersion.name }}
            <q-tooltip
              class="bg-black text-white"
              anchor="top left"
              self="bottom start"
            >
              {{ $t('double_click_change_name') }}
            </q-tooltip>
          </span>
        </template>
        <span v-else class="q-space q-ml-sm">
          {{ $t(activeVersion?.name) }}
        </span>
        <q-input v-if="version_update_ing === activeVersion?.id"
          v-model="_input_text"
          dense
          square
          :placeholder="activeVersion?.name"
          type="text"
          class="q-space"
          @keyup.esc="version_update_ing = false"
          @blur="updateVersionBlur(_input_text, activeVersion?.name)"
          @keyup.enter="updateVersionFn(activeVersion?.id)"
          @keyup.ctrl.enter="updateVersionFn(activeVersion?.id)"
        >
          <template v-slot:append>
            <q-btn
              dense
              flat
              round
              size="sm"
              icon="check"
              @click="updateVersionFn(activeVersion?.id)"
            />
          </template>
        </q-input>
        <q-btn dense flat icon="expand_more">
          <q-menu class="transparent shadow-12" ref="versionListMenuRef">
            <q-list
              dense
              bordered
              class="q-pa-xs radius-sm column no-wrap gap-xs"
              :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
              style="min-width: 9rem"
            >
              <template v-if="useAuths('modify', [authBase.collection])">
                <q-item class="radius-xs" clickable v-close-popup @click="version_update_ing = activeVersion?.id">
                  <q-item-section side>
                    <ReName />
                  </q-item-section>
                  <q-item-section class="text-no-wrap">{{ $t('change_version_name') }}</q-item-section>
                  <q-item-section side />
                </q-item>
                <q-separator
                  v-if="overView_attachedTo.overviews?.length > 0"
                  spaced
                />
              </template>
              <template v-if="overView_attachedTo.overviews?.length > 0">
                <q-item
                  v-for="(i,index) in overView_attachedTo.overviews"
                  :key="i.id"
                  class="radius-xs"
                  clickable
                  @click="set_current_version(i.id)"
                  :class="activeVersion.id === i.id ? 'bg-primary' : ''"
                  v-close-popup
                >
                  <q-item-section side>
                    <q-avatar size="sm">{{ index }}</q-avatar>
                  </q-item-section>
                  <q-item-section>{{ i.name === 'Initial_Version' ? $t(i.name) : i.name }}</q-item-section>
                  <q-item-section side>
                    <q-btn dense size="sm" flat round icon="star"
                      :color="overView_attachedTo.default_version === i.id ? 'yellow' : ''"
                      @click.stop="useAuths('default_version', [authBase.collection]) && set_defaultVersion(i.id)"
                    />
                  </q-item-section>
                </q-item>
              </template>
              <template v-if="useAuths('create_version', [authBase.collection])">
                <q-separator v-if="overView_attachedTo.overviews?.length > 0" spaced />
                <q-item class="radius-xs no-padding">
                  <q-item-section class="q-pa-none radius-xs overflow-hidden">
                    <q-input
                        v-model="_input_text"
                        dense square filled :label="$t('add_version')" :placeholder="$t('version_name')" type="text"
                        @keyup.esc="_input_text = ''"
                        @keydown.enter.stop="newVersion"
                    >
                      <template v-slot:append>
                        <q-btn
                            dense flat round size="sm" icon="check" :class="_input_text ? '' : 'op-0'"
                            @click="newVersion"
                        />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item>
              </template>
              <template
                v-if="
                  overView_attachedTo.overviews?.length > 1 &&
                  useAuths('remove_version', [authBase.collection])
                "
              >
                <q-separator spaced />
                <q-item
                  class="radius-xs text-red"
                  clickable
                  @click="removeVersion(activeVersion.id)"
                  v-close-popup
                >
                  <q-item-section side
                    ><q-avatar size="sm"
                      ><q-icon name="close" color="red" /></q-avatar
                  ></q-item-section>
                  <q-item-section>{{ $t('remove_this_version') }}</q-item-section>
                  <q-item-section side></q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
      <div class="column no-wrap q-px-sm gap-sm q-pt-sm q-space overflow-hidden">
        <CardContent
          v-if="wasAttached_toRef === 'card'"
          :wasAttached_to="wasAttached_toRef"
          :contentAuth="useAuths('jsonContent', ['overview'])"
        />
      </div>
    </div>
    <OverviewMedia
      v-if="onlyMedia && activeVersion"
      :key="activeVersion.id"
      :mediaWidth="mediaWidth"
      :activeVersion
      :isClassroom
      :auth="useAuths('media', ['overview'])"
      :fitContainer="true"
      class="absolute-full flex flex-center"
      @mediaChanged="mediaChanged"
    />
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  toRef,
  computed,
  watchEffect,
  provide, toRefs, onMounted,
} from 'vue';
import {
  updateProject,
  updateCard,
  addVersion,
  updateVersion,
  deleteVersion,
} from "src/api/strapi/project.js";

import OverviewMedia from "./widgets/OverviewMedia.vue";
import OverviewName from "./widgets/OverviewName.vue";
import CardContent from "./widgets/CardContent.vue";
import OverviewDesc from "./widgets/OverviewDesc.vue";
import OverviewStart from "./widgets/OverviewStart.vue";
import OverviewEnd from "./widgets/OverviewEnd.vue";
import OverviewDeadline from "./widgets/OverviewDeadline.vue";
import ReName from "./widgets/icons/ReName.vue";
import { useQuasar } from "quasar";
import {
  userStore,
  mm_wsStore,
  teamStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const $q = useQuasar();
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
  onlyMedia: {
    type: Boolean,
    default: false,
  },
  hideMedia: {
    type: Boolean,
    default: false,
  },
});
const { onlyMedia } = toRefs(props)
const emit = defineEmits(['current_version','sync_version'])
const wasAttached_toRef = toRef(props, "wasAttached_to");
const isShared = computed(() => uiStore.isShared)
const name = computed(() =>
  wasAttached_toRef.value === "project"
    ? teamStore.project?.name
    : teamStore.card?.name
);
const isClassroom = computed(
  () =>
    wasAttached_toRef.value === "card" && teamStore.card?.type === "classroom"
);

const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card && !isShared.value) {
    const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "card",
      of: "project",
    };
  }
  return res;
});

provide("authBase", authBase.value);

const belonged_project = ref();
watchEffect(() => {
  belonged_project.value =
    teamStore.project || teamStore.card?.belonged_project;
});

const overView_attachedTo = computed(() =>
  wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card
);

const versionListMenuRef = ref();
const current_version = ref();
const getCurrentVersion = () => {
  // console.log("getCurrentVersion");
  current_version.value =
    overView_attachedTo.value?.overviews?.find(
      (i) => i.id === overView_attachedTo.value?.default_version
    ) ||
    overView_attachedTo.value?.overviews[overView_attachedTo.value?.overviews?.length - 1] ||
    void 0;
};

const activeVersion = computed(() => wasAttached_toRef.value === "project" ? teamStore.project?.activeVersion
  : teamStore.card?.activeVersion
);
const setActive = () => {
  if(wasAttached_toRef.value === "project"){
    teamStore.project.activeVersion = current_version.value
  }else{
    teamStore.card.activeVersion = current_version.value
  }
}
const set_current_version = (id) => {
  if(id !== current_version.value?.id){
    current_version.value = overView_attachedTo.value.overviews.find(
      (i) => i.id === id
    );
  }
  setActive()
};

onMounted(() => {
  getCurrentVersion();
  if(!activeVersion.value){
    setActive()
  }
})
watch([overView_attachedTo, activeVersion], () => {
  if(overView_attachedTo.value && !activeVersion.value){    
    getCurrentVersion();
    setActive()
  }
},{immediate:false,deep:false})

const removeVersion = async (id) => {
  let attach_to_id =
    wasAttached_toRef.value === "project"
      ? belonged_project.value?.id
      : teamStore.card?.id;
  let res = await deleteVersion(attach_to_id, id, wasAttached_toRef.value);
  if (res?.data) {
    getCurrentVersion();
    set_current_version(current_version.value?.id)
    versionListMenuRef.value?.hide();
  }
};
const _input_text = ref('');

const newVersion = async () => {
  if (!_input_text.value) return;
  let params = {
    attach_to: wasAttached_toRef.value,
    attach_to_id:
      wasAttached_toRef.value === "project"
        ? belonged_project.value.id
        : teamStore.card.id,
    project_id: belonged_project.value.id,
    data: {
      name: _input_text.value,
    },
  };
  // console.log(params);
  let res = await addVersion(params);
  if (res?.data) {
    current_version.value = res.data;
    setActive();
    // set_current_version(res.data.id);
    _input_text.value = null;
  }
};

const version_update_ing = ref(null);
let updateVersionParams = ref({
  attach_to: wasAttached_toRef.value,
  attach_to_id:
    wasAttached_toRef.value === "project"
      ? teamStore.project?.id
      : teamStore.card?.id,
  data: {},
});
const __updateVersion = async () => {
  let res = await updateVersion(
    activeVersion.value.id,
    updateVersionParams.value
  );
  if (res) {
    return res.data;
  }
};
const updateVersionFn = async () => {
  updateVersionParams.value.data.name = _input_text.value;
  let res = await __updateVersion();
  if (res) {
    version_update_ing.value = null;
    // current_version.value = res.data;
    updateVersionParams.value.data = {};
  }
};
const updateVersionBlur = (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    updateVersionFn(activeVersion.value.id);
  }
};

const set_defaultVersion = async (overview_id) => {
  // let _ = overView_attachedTo
  let res;
  if (wasAttached_toRef.value === "project") {
    let params = {
      data: {
        default_version: overview_id,
      }
    };
    res = await updateProject(overView_attachedTo.value.id, params);
  }
  if (wasAttached_toRef.value === "card") {
    let params = {
      project_id: belonged_project.value.id,
      data: {
        default_version: overview_id,
      },
    };
    res = await updateCard(overView_attachedTo.value.id, params);
  }
  if (res) {
    return res.data;
  }
};

defineExpose({
  set_defaultVersion,
  set_current_version
})

const startChanged = async (val) => {
  // console.log("change start");
  updateVersionParams.value.data = {
    start: val,
  };
  await __updateVersion();
};
const endChanged = async (val) => {
  updateVersionParams.value.data = {
    end: val,
  };
  await __updateVersion();
};
const deadlineChanged = async (val) => {
  updateVersionParams.value.data = {
    deadline: val,
  };
  await __updateVersion();
};
const mediaChanged = async (version, id, media) => {
  updateVersionParams.value.data = {
    media: id,
  };
  await __updateVersion(version);
};
const mediaWidth = computed(
  () => ((uiStore.mainWindowSize?.height - 187) / 9) * 16
);

watchEffect(() => {
  if (overView_attachedTo.value?.overviews.length === 0) {
    _input_text.value = $t('default_version');
    newVersion();
  }
});
</script>

<style lang="scss" scoped></style>
