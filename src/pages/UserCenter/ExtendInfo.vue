<template>
  <q-list dense class="full-width q-px-xl">
    <BgBrand v-if="$q.screen.gt.xs" styleClass="op-none" />

    <q-item class="q-mt-xl">
      <q-item-section side>
        <q-icon color="primary" name="mdi-server-network" />
      </q-item-section>
      <q-item-section>
        <div class="row no-wrap items-center">
          {{ $t('current_server') }}: <q-chip square :label="isOfficalServer ? $t('official_server') : ''" />
        </div>
      </q-item-section>
    </q-item>
    <q-separator spaced class="op-5" />

    <q-expansion-item group="login_helper" :label="$t('what_is_server')" dense dense-toggle :content-inset-level="0.3">
      <div class="q-pa-sm">
        {{ $t('server_description') }}
      </div>
    </q-expansion-item>
    <q-expansion-item group="login_helper" :label="$t('set_your_server')" dense dense-toggle :content-inset-level="0.3">
      <div class="q-pa-sm">
        {{ $t('set_your_server_description') }}
        <a class="text-primary"
          href="https://www.bilibili.com/video/BV1BWeYeKEbZ/?spm_id_from=333.999.0.0&vd_source=14fda6b1b918f99f59187d308ae0763b">{{ $t('this_demo') }}</a>
        {{ $t('server_deployment_description') }}
      </div>
    </q-expansion-item>
    <q-expansion-item group="login_helper" :label="$t('set_your_server_benefits')" dense dense-toggle>
      <div class="q-pa-sm">
        <ol class="q-my-none q-pl-lg">
          <li>{{ $t('data_security') }}</li>
          <li>{{ $t('high_performance') }}</li>
        </ol>
      </div>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
  import { isOfficalServer } from 'src/boot/server.js'
  import BgBrand from 'src/components/VIewComponents/BgBrand.vue'
</script>

<style scoped></style>