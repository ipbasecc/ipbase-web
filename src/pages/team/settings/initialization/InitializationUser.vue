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
        :done="step > 1"
      >
        <TeamProcess @teamInitialized="teamInitialized" />
      </q-step>

      <q-step
        :name="2"
        title="Create an ad group"
        caption="Optional"
        icon="create_new_folder"
        :done="step > 2"
      >
        <ChannelProcess />
      </q-step>

      <q-step
        :name="3"
        title="Ad template"
        icon="assignment"
        disable
      >
        This step won't show up because it is disabled.
      </q-step>

      <q-step
        :name="4"
        title="Create an ad"
        icon="add_comment"
      >
        Try out different ad text to see what brings in the most customers, and learn how to
        enhance your ads using features like ad extensions. If you run into any problems with
        your ads, find out how to tell if they're running and how to resolve approval issues.
      </q-step>

      <template v-slot:navigation>
        <q-stepper-navigation>
          <q-btn v-if="step === 1" flat color="primary" :disable="!teamCreated" @click="step = 2" label="下一步" class="q-ml-sm" />
          <q-btn v-if="step === 2" flat color="primary" @click="step = 1" label="上一步" class="q-ml-sm" />
          <q-btn v-if="step === 2" flat color="primary" :disable="!channelCreated" @click="step = 3" label="下一步" class="q-ml-sm" />
          <q-btn v-if="step === 3" flat color="primary" :disable="!projectCreated" @click="step = 4" label="下一步" class="q-ml-sm" />
        </q-stepper-navigation>
      </template>
    </q-stepper>
</template>

<script setup>
import { ref } from 'vue'
import TeamProcess from './TeamProcess.vue'
import ChannelProcess from './ChannelProcess.vue'
const step = ref(1);

const teamCreated = ref(false);
const channelCreated = ref(false);
const projectCreated = ref(false);

const teamInitialized = (val) => {
  teamCreated.value = true;
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