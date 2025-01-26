<template>
  <q-card bordered style="min-width: 24rem">
    <q-toolbar v-if="!hideHeader" class="transparent q-px-md border-bottom">
      <span class="font-medium">{{ $t('create_team') }}</span>
      <q-space />
      <q-btn
        flat
        round
        dense
        unelevated
        size="sm"
        icon="close"
        :color="$q.dark.mode ? 'grey-1' : 'grey-10'"
        @click="cannelCreate()"
      />
    </q-toolbar>
    <template v-if="teamStore.init?.by_certification">
      <q-card-section class="q-pa-lg">
        <div class="column gap-sm no-wrap">
          <q-input
            v-model="create_params.display_name"
            filled
            square
            type="text"
            :label="$t('team_name')"
          />
          <q-input
            v-model="create_params.introduce"
            filled
            square
            type="textarea"
            :label="$t('team_introduce')"
          />
          <div class="row no-wrap gap-sm items-center q-mt-md">
            <span>{{ $t('operation_mode') }}：</span>
              <q-radio
                v-for="i in modes" :key="i.value"
                v-model="create_params.config.mode"
                :val="i.value" :label="$t(i.label)"
              >
                <q-tooltip v-if="i.value === 'toOne'">
                    {{ $t('team_toOne_mode_tip') }}
                </q-tooltip>
              </q-radio>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-if="!hideFooter" class="row items-center no-wrap q-pa-sm border-top">
        <q-btn flat :label="$t('cancel')" v-close-popup />
        <q-space />
        <q-btn color="primary" padding="xs md" :label="$t('create')" @click="create()" />
      </q-card-section>
    </template>
    <template v-else>
      <q-card-section class="q-pa-lg">
        <div class="column flex-center gap-sm">
          <span>认证用户功能</span>
          <span>请先提交认证资料</span>
        </div>
      </q-card-section>
      <q-card-section class="row items-center no-wrap q-pa-sm border-top">
        <q-btn flat :label="$t('cancel')" v-close-popup />
        <q-space />
        <q-btn color="primary" padding="xs md" label="提交认证" v-close-popup @click="certif()" />
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createStrapiTeam } from "src/pages/team/hooks/useTeam.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";

const router = useRouter();
const props = defineProps({
  hideHeader: {
    type: Boolean,
    default: false,
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
});

const create_params = ref({
  name: "",
  display_name: "",
  type: "I",
  introduce: '',
  config: {
      mode: 'toMany',
      disabled: []
  }
});
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
const emit = defineEmits(["cannelCreate", "completedCreate"]);
const cannelCreate = () => {
  emit("cannelCreate");
};
const create = async () => {
  const now = new Date();
  let timestamp = now.getTime();
  create_params.value.name = `u${teamStore.init?.id}at${timestamp}`;

  const res = await createStrapiTeam(create_params.value);
  if (res?.data) {
    if (teamStore.teams?.length > 0) {
      teamStore.teams.push(res?.data);
    } else {
      teamStore.teams = [res?.data];
    }
    cannelCreate();
    emit('completedCreate', res?.data)
  }
};
const certif = () => {
  uiStore.app = 'business'
  router.push('/business/certificate')
}
defineExpose({
  create,
});
</script>

<style lang="scss" scoped></style>
