<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title> Title </q-toolbar-title>

        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-list bordered class="radius-sm" style="width: 24rem">
          <q-item v-for="i in store.person" :key="i.id" >
            <q-item-section side>
              {{ i.id }}
            </q-item-section>
            <q-item-section>
              name: {{ i.name }}
            </q-item-section>
            <q-item-section>
              age: {{ i.age }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input
                v-model="params.name"
                dense
                flat
                filled
                square
              />
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="params.age"
                type="number"
                dense
                flat
                filled
                square
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="column no-wrap gap-xs">
              <q-btn dense color="primary" label="ADD" @click="addTask(params)" />
              <q-btn dense color="primary" label="INIT" @click="init" />
              <q-btn dense color="primary" label="RESET" @click="reset" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useSyncedStore } from 'src/pages/team/hooks/useSyncedStore.js';
import {nextTick, onMounted, reactive, ref} from "vue";

const DATA = ref({
  person: [
    { id: 1, name: 'jack', age: 18 },
    { id: 2, name: 'lili', age: 22 },
    { id: 3, name: 'pony', age: 19 },
  ]
})

let params = reactive({ id: void 0, name: '', age: void 0 });
let { store, reactiveStore, addPerson, reset } = useSyncedStore();

const addTask = (val) => {
  val.id = reactiveStore.value.person.length + 1
  addPerson(val)
}
const init = () => {
  if(DATA.value?.person?.length > 1) {
    DATA.value.person.map(i => {
      addTask(i)
    })
  }
}
// onMounted(async () => {
//   await nextTick();
//   if(store.person?.length === 0){
//     init();
//   }
// })
</script>
