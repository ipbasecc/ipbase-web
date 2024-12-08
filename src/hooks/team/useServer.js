import localforage from "localforage";

export async function fetchServerInfo(_url) {
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
}

export async function serverInfo() {
  let _backend_url = await localforage.getItem('backend_url');
  if(!_backend_url){
    const servers = await localforage.getItem('servers');
    if(servers?.length > 0){
      _backend_url = servers[0].url;
    } else {
      _backend_url = import.meta.env.VITE_BACKEND_URI;
    }
  }
  return await fetchServerInfo(_backend_url);
}
