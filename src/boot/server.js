import localforage from "localforage";
import { ref } from "vue";
import { Notify } from 'quasar'
import {i18n} from 'src/boot/i18n.js';
import { Platform } from 'quasar'

const $t = i18n.global.t;

export const serverInfo = ref();
const fetchServerInfo = async (_url) => {
  try {
    const response = await fetch(_url + 'api/server');
    if (!response.ok) {
      console.error(`Network response was not ok: ${response.status}`)
    }
    const {data} = await response.json();
    if (data?.attributes) {
      // console.log('fetch', data);
      const _attributes = JSON.parse(JSON.stringify(data.attributes))
      await localforage.setItem('serverInfo', _attributes);
      return data.attributes;
    }
  } catch (error) {
    console.error(error);
  }
};

const processCache = async (_cache) => {
  let _url = await localforage.getItem('backend_url') || import.meta.env.VITE_BACKEND_URI;
  await fetchServerInfo(_url);
}

export async function $server() {
  if(serverInfo.value) return serverInfo.value;
  let oldVersion
  const _cacheInfo = await localforage.getItem('serverInfo');
  if(_cacheInfo) {
    oldVersion = _cacheInfo.version.name;
    serverInfo.value = _cacheInfo;
    
    processCache(_cacheInfo);
    return _cacheInfo //临时提前，后续需要补充版本升级方案
  }
  let _url = await localforage.getItem('backend_url') || import.meta.env.VITE_BACKEND_URI;
  const server = await fetchServerInfo(_url);
  if(server){
    serverInfo.value = server;
    return server //临时提前，后续需要补充版本升级方案
    const isWeb = () => {
      return Platform.is.chrome || Platform.is.opera || Platform.is.safari || Platform.is.edge
    }
    if(oldVersion !== server.version.name && isWeb) {
      Notify.create({
        progress: true,
        color: 'negative',
        message: $t('version_updated_notify'),
        position: 'bottom',
        actions: [
          { label: $t('close'), color: 'deep-orange', handler: () => { /* ... */ } }
        ]
      })
    }
  }
}

export async function isOfficalServer() {
  const _backend_url = await localforage.getItem('backend_url');
  if(!_backend_url || _backend_url === 'https://api.yihu.team'){
    return true
  } else {
    return false
  }
}
