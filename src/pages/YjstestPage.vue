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
          <q-item v-for="i in DATA.person" :key="i.id" >
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
                dense
                flat
                filled
                square
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="column no-wrap gap-xs">
              <q-btn dense color="primary" label="ADD" @click="add" />
              <q-btn dense color="primary" label="RESET" @click="reset" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as Y from "yjs";
import { WebsocketProvider } from 'y-websocket'
import { toYDoc, fromYDoc } from 'src/pages/team/hooks/useYjs.js'

const DATA = ref({
  person: [
    { id: 1, name: 'jack', age: 18 },
    { id: 2, name: 'lili', age: 22 },
    { id: 3, name: 'pony', age: 19 },
  ]
})
const params = ref(
  { id: void 0, name: '', age: void 0 }
)
const add = () => {
  params.value.id = DATA.value.person.length + 1
  DATA.value.person.push(params.value)
  params.value = { id: void 0, name: '', age: void 0 }
  update_ydoc()
}

const doc = new Y.Doc();
let wsProvider;
onMounted(() => {
  update_ydoc();
  wsProvider = new WebsocketProvider('ws://localhost:1234', 'wsroom', doc)
  wsProvider.on('status', event => {
    console.log(event.status)
    sync();
  })
  let map = doc.getMap('wsroom');
  map.observe(async (event) => {
    sync();
  });
})
const update_ydoc = () => {
  toYDoc(doc, DATA.value, 'wsroom')
}
const sync = () => {
  DATA.value = fromYDoc(doc, 'wsroom')
}
const reset = () => {
  const _DATA = ref({
    person: [
      { id: 1, name: 'jack', age: 18 },
      { id: 2, name: 'lili', age: 22 },
      { id: 3, name: 'pony', age: 19 },
    ]
  })
  toYDoc(doc, _DATA.value, 'wsroom')
}
</script>

<style lang="scss" scoped></style>
