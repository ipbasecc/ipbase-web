<template>
  <q-stepper
    v-model="step"
    ref="stepper"
    color="primary"
    keep-alive
    animated
    :bordered="!$q.screen.lt.sm"
    :vertical="$q.screen.lt.sm"
    class="initialization column no-wrap"
    :class="`
      ${$q.screen.lt.sm ? 'transparent q-pb-xl' : ''}
      ${$q.dark.mode ? 'text-white' : 'text-black'}
    `"
  >
    <q-step
      :name="1"
      :title="$t('onboarding_step1_title')"
      :caption="$t('onboarding_step1_caption')"
      icon="settings"
      :done="teamStore.team && step > 1"
    >
      <TeamProcess @teamInitialized="teamInitialized" />
    </q-step>

    <q-step
      :name="2"
      :title="$t('onboarding_step2_title')"
      :caption="$t('onboarding_step2_caption')"
      icon="forum"
      :done="step > 2"
    >
      <ChannelProcess />
    </q-step>

    <q-step
      :name="3"
      :title="$t('onboarding_step3_title')"
      :caption="$t('onboarding_step3_caption')"
      icon="mdi-developer-board"
      :done="step > 3"
    >
      <KnownMore @KnownMoreInitialized=KnownMoreInitialized />
    </q-step>

    <template v-slot:navigation>
      <q-stepper-navigation>
        <div class="row no-wrap items-center">
          <q-btn v-if="step < 3" color="primary" :disable="nextDisabled" @click="next()" :label="$t('next_step')" />
          <q-btn v-if="step > 1" flat color="primary" @click="back()" :label="$t('previous_step')" class="q-ml-md" />
        <template v-if="step > 2">
          <q-space />
          <span class="q-mr-lg op-6">{{$t( Initialized ? 'onboarding_completed_tip' : 'read_functions_tip')}}</span>
          <q-btn color="primary" padding="sm lg"
            :label="Initialized ? $t('onboarding_completed_btn_label') : $t('onboarding_skip_btn_label')"
            @click="complateInit()"
          />
        </template>
      </div>
      </q-stepper-navigation>
    </template>
  </q-stepper>
</template>

<script setup>
import { ref, computed } from 'vue'
import { teamStore, userStore } from "src/hooks/global/useStore";
import { updateUser } from 'src/api/strapi.js'
import TeamProcess from './TeamProcess.vue'
import ChannelProcess from './ChannelProcess.vue'
import KnownMore from './KnownMore.vue'

const step = ref(1);
const nextStep = ref(2);

const next = () => {
  if(step.value < 3){
    step.value = nextStep.value;
    nextStep.value++;
  }
}
const back = () => {
  if(skipChannel && step.value === 3){
    step.value = 1;
    nextStep.value = 3;
  } else {
    step.value--;
    nextStep.value--;
  }
}
const nextDisabled = computed(() => {
  if(step.value === 1 && !teamStore.team){
    return true
  }
  return false;
})

let skipChannel = false
const teamInitialized = (val) => {
  // console.log('teamInitialized', val);
  
  if(val.join?.message){
    skipChannel = true
    nextStep.value = 3;
  }
  if(val.create){
    teamStore.team = val.create;
    nextStep.value = 2;
  }
  if(val.join?.code === 301){
    step.value = 3
  }
}
const emit = defineEmits(['Initialized']);
const Initialized = ref(false);
const KnownMoreInitialized = () => {
  Initialized.value = true;
}
const complateInit = async () => {
  const params = {
    data: {
      initialization: true,
    },
  };
  const res = await updateUser(teamStore?.init?.id, params);  
  if(res?.data){
    teamStore.init.initialization = res.data.initialization
    emit('Initialized', teamStore.init.initialization);
  }
}

</script>

<style>
.initialization .q-stepper__content {
    flex-grow: 1;
}
.initialization .q-stepper__step-content {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}
.initialization .q-stepper__step-inner {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
</style>