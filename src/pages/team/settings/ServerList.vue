<template>
  <q-list :bordered="bordered" class="fit column no-wrap gap-xs radius-sm">
    <template v-if="!add">
      <template v-if="servers?.length > 0">
        <q-item v-for="(i,index) in servers" :key="i.url" class="hovered-item" clickable v-ripple @click="toggleServer(i.url)">
          <q-item-section avatar>
            <q-avatar
              square
              class="radius-xs"
              size="sm"
              text-color="white"
              :style="`background-color: ${colorByAt(index, true)};`"
            >
              {{ i.name.charAt(0) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ i.name }}</q-item-label>
            <q-item-label v-if="false" caption lines="1">{{ i.url }}</q-item-label>
            <q-item-label caption lines="1">{{ i.caption }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              round
              dense
              size="sm"
              :flat="i.url !== cur_server_url"
              icon="check_circle"
              :class="i.url === cur_server_url ? 'bg-green' : 'hover-show'"
            />
          </q-item-section>
        </q-item>
        <q-space />
        <q-separator />
      </template>
      <div v-else class="q-space column no-wrap gap-xs q-pa-xl flex-center border-bottom">
        <span class="op-5 font-bold-200">尚未添加自定义服务器,正在使用官方服务器</span>
        <span class="font-large font-bold-600">点击下方按钮，添加自定义服务器</span>
      </div>

      <q-item :class="`q-px-${bordered ? 'sm' : 'xs'}`">
        <q-btn icon="mdi-chevron-left" padding="xs" flat @click="setCompleted()" />
        <q-separator vertical spaced />
        <q-item-section>
          <q-btn icon="mdi-server-network" flat label="新增服务器" class="full-width" @click="add = true" />
        </q-item-section>
      </q-item>
    </template>
    <q-item v-else class="fit q-pa-sm">
      <q-form
        class="q-space column no-wrap gap-sm"
        @submit="addServer(server_url)"
        @keydown.esc="setCompleted"
      >
        <q-input
          filled
          class="overflow-hidden radius-xs"
          type="text"
          v-model="server_name"
          label="服务器名称"
          aria-placeholder="服务器名称"
        />
        <q-input
          filled
          class="overflow-hidden radius-xs"
          type="text"
          v-model="server_url"
          label="服务器地址"
          aria-placeholder="服务器地址"
          lazy-rules
        />
        <q-input
          filled
          class="overflow-hidden radius-xs"
          type="text"
          v-model="server_caption"
          label="备注"
          aria-placeholder="备注"
          lazy-rules
        />
        <q-space />
        <div class="row no-wrap items-center">
          <q-btn label="取消" flat @click="setCompleted()" />
          <q-space />
          <q-btn label="确认" type="submit" color="primary"/>
        </div>
      </q-form>
    </q-item>
  </q-list>
</template>

<script setup>
import {onBeforeMount, ref} from "vue";
import localforage from "localforage";
import {colorByAt} from "src/hooks/utilits";
import { fetchServerInfo } from 'src/hooks/team/useServer.js'
import {useQuasar} from "quasar";
import { isValidHttpUrl } from 'src/hooks/utilits.js'

const $q = useQuasar();
const props = defineProps({
  bordered: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['setCompleted'])

const cur_server_url = ref()
const server_name = ref();
const server_url = ref();
const server_caption = ref();
const addServer = async (_server_url) => {
  if(!_server_url) return
  if(!isValidHttpUrl(_server_url)){
    $q.notify('服务器地址格式错误：必须是 http:// 或 https:// 开头的有效地址')
  }
  if (!_server_url.endsWith('/')) {
    _server_url = _server_url + '/';
  }
  const res = await fetchServerInfo(_server_url)
  const { http_api_endpoint, ws_api_endpoint, graphql_endpoint } = res
  if(http_api_endpoint && ws_api_endpoint && graphql_endpoint){
    const serverItem = {
      name: server_name.value,
      caption: server_caption.value,
      url: _server_url,
      server: res
    }
    let _servers = await localforage.getItem('servers');
    if(_servers?.length > 0){
      _servers = _servers.filter(server => server.url !== _server_url);
      _servers.push(serverItem)
    } else {
      _servers = [serverItem]
    }
    await localforage.setItem('servers', _servers);
    await getServers();
    add.value = false
  } else {
    $q.notify('服务器地址无效')
  }
}
const add = ref(false);
const toggleServer = async (_server_url) => {
  if(_server_url === cur_server_url.value) {
    setCompleted();
    return
  }
  await localforage.setItem('backend_url', _server_url);
  if(cur_server_url.value && _server_url !== cur_server_url.value){
    window.location.reload();
  }
  setCompleted();
}
const setCompleted = () => {
  emit('setCompleted')
}
const servers = ref();
const getServers = async () => {
  const res = await localforage.getItem('servers');
  if(res) {
    servers.value = res
  }
}
const getCurServer = async () => {
  const res = await localforage.getItem('backend_url');
  if(res) {
    cur_server_url.value = res
  }
}
onBeforeMount(async () => {
  await getServers();
  await getCurServer();
})
</script>

<style lang="scss" scoped></style>
