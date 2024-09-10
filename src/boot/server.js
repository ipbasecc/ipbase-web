import localforage from "localforage";
import { ref } from "vue";
import { Notify } from 'quasar'
import {i18n} from 'src/boot/i18n.js';
import { Platform } from 'quasar'

const $t = i18n.global.t;

const serverInfo = ref();
const fetchServerInfo = async (_url) => {
  try {
    const response = await fetch(_url + 'api/server');
    if (!response.ok) {
      console.error(`Network response was not ok: ${response.status}`)
    }
    const {data} = await response.json();
    if (data?.attributes) {
      console.log('fetch', data);
      const _attributes = JSON.parse(JSON.stringify(data.attributes))
      await localforage.setItem('serverInfo', _attributes);
      return data.attributes;
    }
  } catch (error) {
    console.error(error);
  }
};
export async function $server() {
  if(serverInfo.value) return serverInfo.value;
  let oldVersion
  const _cacheInfo = await localforage.getItem('serverInfo');
  if(_cacheInfo) {
    oldVersion = _cacheInfo.version.name;
  }
  let _url = await localforage.getItem('backend_url') || process.env.BACKEND_URI;
  const server = await fetchServerInfo(_url);
  if(server){
    serverInfo.value = server;
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
    return server
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
