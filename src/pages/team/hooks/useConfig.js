
import { computed } from 'vue';
import { teamStore } from 'src/hooks/global/useStore.js';

const allFeathers = ['channles', 'projects']
const isExternal = computed(() => teamStore.team?.isExternal);
const userStatus_byTeam = computed(() => teamStore.team?.status);
const disabled = computed(() => teamStore.team?.config?.disabled);
const teamMode = computed(() => teamStore.team?.config?.mode);
const setFalse = computed(() => isExternal.value || userStatus_byTeam.value)

const enable_project = computed(() => {
  if(setFalse.value || disabled.value?.includes('projects')){
    return false
  } else {
    return true
  }
})
const enable_channel = computed(() => {
  if(setFalse.value || disabled.value?.includes('channels') || teamMode.value === 'toOne'){
    return false
  } else {
    return true
  }
})
const enable_threads = computed(() => enable_project.value || enable_channel.value)
const enable_dashboard = computed(() => enable_project.value)

export {
    allFeathers,
    isExternal,
    disabled,
    teamMode,
    enable_threads,
    enable_dashboard,
    enable_project,
    enable_channel,
}