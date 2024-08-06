import localforage from "localforage";
import { ref } from "vue";

const serverInfo = ref();
const fetchServerInfo = async (_url) => {
  try {
    // console.log('fetch start');
    const response = await fetch(_url + 'api/server');
    if (!response.ok) {
      console.error(`Network response was not ok: ${response.status}`)
    }
    const data = await response.json();
    // console.log('fetch', data);
    if (data?.data?.attributes) {
      await localforage.setItem('serverInfo', data?.data?.attributes);
      return data?.data?.attributes;
    }
  } catch (error) {
    console.error(error);
  }
};
export async function $server() {
  if(serverInfo.value) return serverInfo.value;
  let _url = await localforage.getItem('backend_url') || process.env.BACKEND_URI;
  // console.log('fetchServerInfo', _url)
  const server = await fetchServerInfo(_url);
  if(server){
    serverInfo.value = server;
    console.log('server', server)
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
