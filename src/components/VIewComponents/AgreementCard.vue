<template>
    <q-dialog v-model="showAgreement" persistent full-height class="q-electron-drag--exception">
      <q-card v-if="user_agreement" bordered class="column no-wrap article z-max" style="min-width: 61vw; max-height: 90vh; max-width: 1440px;">
        <q-toolbar class="transparent border-bottom">
          <q-toolbar-title>
            服务协议
          </q-toolbar-title>
        </q-toolbar>
        <q-card-section class="q-space">
          <q-scroll-area class="fit border q-pa-md radius-xs bg-darker" style="box-shadow: inset 0 0 5px black;">
            <div class="column no-wrap">
              <div class="text-h4 q-pb-none">
              请仔细阅读以下内容：
              </div>
              <div class="q-pt-none">
                <span v-html="md.render(user_agreement)" />
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>
        <q-card-actions class="border-top">
          <q-btn flat :label="$t('agree_user_agreement_and_register')" color="primary" class="full-width" v-close-popup @click="agreeAgreement" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { serverInfo } from 'src/boot/server.js';
import MarkdownIt from "markdown-it";
let md = new MarkdownIt();

const { user_agreement } = serverInfo.value;

const emit = defineEmits(['agreeAgreement']);
const showAgreement = defineModel('showAgreement');
const agreeAgreement = () => {
  emit('agreeAgreement');
  showAgreement.value = false;
};
</script>
