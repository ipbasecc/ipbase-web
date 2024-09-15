<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-black text-white">
      <q-toolbar class="gap-sm">
        <q-toolbar-title> Title </q-toolbar-title>
        <q-space />
        <q-btn color="primary" no-caps label="Next"
          @click="nextMorph"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-card bordered class="bg-primary"
          v-morph:card1:boxes:800.resize="morphGroupModel"
        >
          <q-card-section>
            <div class="text-h6">A</div>
          </q-card-section>
        </q-card>
        <q-card bordered class="bg-orange"
          v-morph:card2:boxes:800.resize="morphGroupModel"
        >
          <q-card-section>
            <div class="text-h6">B</div>
          </q-card-section>
        </q-card>
        <q-card bordered class="bg-info"
          v-morph:card3:boxes:800.resize="morphGroupModel"
        >
          <q-card-section>
            <div class="text-h6">C</div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {onMounted, ref, watch, computed, watchEffect} from 'vue';
import {addMedia, queryMedias} from 'src/api/strapi.js';
import {uiStore} from "src/hooks/global/useStore.js";
import EditableDiv from 'src/components/Utilits/InputDiv.vue';
import { useQuasar } from 'quasar'
const $q = useQuasar()

const morphGroupModel = ref('card1');
const nextMorphStep = {
  card1: 'card2',
  card2: 'card3',
  card3: 'card1',
}
const nextMorph = () => {
  morphGroupModel.value = nextMorphStep[ morphGroupModel.value ]
}

onMounted(() => {
  uiStore.pageLoaded = true;
});
</script>
