<template>
  <q-card-section class="column no-wrap flex-center" :class="$q.screen.gt.sm ? 'col-6 border-right' : ''">
    <template v-if="uiStore.setServer">
      <ServerList :useDialog="false" @setCompleted="setCompleted()" />
    </template>
    <ExtendInfo v-else />
  </q-card-section>
</template>

<script setup>
  import { useQuasar } from 'quasar';
  import ExtendInfo from '../ExtendInfo.vue'

  import ServerList from "pages/team/settings/ServerList.vue";
  import { uiStore } from 'src/hooks/global/useStore';

  const $q = useQuasar();

  const props = defineProps({
    showServerSettings: {
      type: Boolean,
      default: false
    }
  });


  const setCompleted = () => {
    uiStore.setServer = false;
    localStorage.clear();
  };
</script>