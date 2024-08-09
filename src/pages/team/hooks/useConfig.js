
import { computed } from 'vue';
import { teamStore } from 'src/hooks/global/useStore.js';

const allFeathers = ['channles', 'projects']
const isExternal = computed(() => teamStore.team?.isExternal);
const userStatus_byTeam = computed(() => teamStore.team?.status);
const disabled = computed(() => teamStore.team?.config?.disabled);
const teamMode = computed(() => teamStore.team?.config?.mode);
const setFalse = computed(() => isExternal.value || userStatus_byTeam.value)

const enalbe_project = computed(() => {
  if(setFalse.value || disabled.value?.includes('projects')){
    return false
  } else {
    return true
  }
})
const enalbe_channel = computed(() => {
  if(setFalse.value || disabled.value?.includes('channels') || teamMode.value === 'toOne'){
    return false
  } else {
    return true
  }
})
const enable_threads = computed(() => enalbe_project.value || enalbe_channel.value)
const enalbe_dashboard = computed(() => enalbe_project.value)

export {
    allFeathers,
    isExternal,
    disabled,
    teamMode,
    enable_threads,
    enalbe_dashboard,
    enalbe_project,
    enalbe_channel,
}