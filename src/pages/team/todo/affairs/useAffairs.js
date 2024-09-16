
import { ref, watchEffect } from "vue";
import {teamStore, userStore} from 'src/hooks/global/useStore';

export const todogroups = ref();
watchEffect(() => {
  if(userStore.affairsFilterIDs?.length > 0){
    const all_ids = teamStore.init?.todogroups.map(i => i.id);
    userStore.affairsFilterIDs = userStore.affairsFilterIDs?.filter(i => all_ids.includes(i));
    if(userStore.affairsFilterIDs.length > 0){
      todogroups.value = userStore.affairsFilterIDs.map(i => teamStore.init.todogroups.find(j => j.id === i))
    }
  } else {
    todogroups.value = teamStore.init?.todogroups
  }
})