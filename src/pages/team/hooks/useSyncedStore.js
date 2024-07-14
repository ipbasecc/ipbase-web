// src/composables/useSyncedStore.js
import { syncedStore, getYjsDoc } from '@syncedstore/core';
import { WebsocketProvider } from 'y-websocket';
import {ref, watch} from "vue";

export function useSyncedStore(val) {
// Create your SyncedStore store
  const store = syncedStore({ person: [] });
// Create a document that syncs automatically using Y-WebRTC
  const doc = getYjsDoc(store);

  const provider = new WebsocketProvider('ws://localhost:1234', 'roomnamex', doc);
  const initializeStore = (_val) => {
    if(_val?.person?.length > 0){
      _val.person.map(i => {
        addPerson(i)
      })
    }
  }
  // 等待服务端数据同步完成
  provider.once('synced', (isSynced) => {
    if (isSynced) {
      // 检查服务端是否有数据
      if (store.person.length === 0) {
        initializeStore(val);
      }
    }
  });

  const disconnect = () => provider.disconnect();
  const connect = () => provider.connect();

  const addPerson = (_person) => {
    store.person.push(_person);
  };
  const reset = () => {
    console.log('reset')
    store.person.splice(0, store.person.length);
  }
  // Create a reactive reference to the store
  const reactiveStore = ref(store);

  // Watch for changes in the store and update the reactiveStore
  watch(store, (newStore) => {
    reactiveStore.value = newStore;
  },{deep: true});

  return {
    store,
    reactiveStore,
    addPerson,
    reset,
    disconnect,
    connect
  }
}
