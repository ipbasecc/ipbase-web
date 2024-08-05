<template>
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      keep-alive
      animated
      bordered
      class="initialization column no-wrap"
    >
      <q-step
        :name="1"
        title="团队初始化"
        caption="创建、或加入一个团队"
        icon="settings"
        :done="teamStore.team && step > 1"
      >
        <TeamProcess @teamInitialized="teamInitialized" />
      </q-step>

      <q-step
        :name="2"
        title="频道"
        caption="了解频道，或新增频道"
        icon="forum"
        :done="step > 2"
      >
        <ChannelProcess />
      </q-step>

      <q-step
        :name="3"
        title="30秒通关"
        caption="快速了解平台功能"
        icon="mdi-developer-board"
        :done="step > 3"
      >
        <KnownMore @KnownMoreInitialized=KnownMoreInitialized />
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <div class="row no-wrap items-center">
            <q-btn v-if="step < 3" color="primary" :disable="nextDisabled" @click="next()" label="下一步" />
            <q-btn v-if="step > 1" flat color="primary" @click="back()" label="上一步" class="q-ml-md" />
          <template v-if="step > 2 && Initialized">
            <q-space />
            <span class="q-mr-lg op-6">恭喜，初始化完成 ！</span>
            <q-btn color="primary" padding="sm lg" label="立刻开启团队之旅" @click="complateInit()" />
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
  step.value--;
  nextStep.value--;
}
const nextDisabled = computed(() => {
  if(step.value === 1 && !teamStore.team){
    return true
  }
  return false;
})
const teamInitialized = (val) => {
  if(val.join?.message){
    nextStep.value = 3;
  } 
  if(val.create){
    teamStore.team = val.create;
    nextStep.value = 2;
  }
}
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
  const res = await updateUser(userStore?.me?.id, params);
  console.log('res', res);
  
  if(res?.data){
    teamStore.init.initialization = res.data.initialization
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