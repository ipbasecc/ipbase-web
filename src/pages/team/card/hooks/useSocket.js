import {computed,watch} from 'vue';
import {teamStore} from "src/hooks/global/useStore.js";

export default function useSocket(cardRef){
    const val = computed(() => teamStore.income);
    watch(val, async(newVal) => {
      if(!newVal) return;
      const { team_id, card_id, todogroup_id, data } = val.value?.data;
      if(teamStore.team?.id === Number(team_id)){
        if(val.value.event === 'todogroup:created'){
          if(cardRef.value.id === Number(card_id)){
            const index = cardRef.value.todogroups.findIndex(i => i.id === data.id)
            if(index > -1){
              cardRef.value.todogroups[index] = data
            } else {
              cardRef.value.todogroups.push(data);
            }
          }
        }
        if(val.value.event === 'todogroup:updated'){
          if(cardRef.value.id === Number(card_id)){
            const index = cardRef.value.todogroups?.findIndex(i => i.id === data.id);
            if(index > -1){
              cardRef.value.todogroups.splice(index, 1, data);
            }
          }
        }
        if(val.value.event === 'todogroup:removed'){
          if(cardRef.value.id === Number(card_id)){
            const index = cardRef.value.todogroups?.findIndex(i => i.id === data.removed_todogroup_id);
            if(index > -1){
              cardRef.value.todogroups.splice(index, 1);
            }
          }
        }
        
        if(val.value.event === 'todo:created'){
          const index = cardRef.value.todogroups.findIndex(i => i.id === Number(todogroup_id));
          if(index > -1){
            const { position } = val.value?.data;
            if(position?.after){
              const insertIndex = cardRef.value.todogroups[index].todos.findIndex(i => i.id === position.after);
              if(insertIndex > -1){
                cardRef.value.todogroups[index].todos.splice(insertIndex + 1, 0, data);
              }
            } else {
              cardRef.value.todogroups[index].todos.push(data);
            }
          }
        }
        if(val.value.event === 'todo:updated'){
          console.log('todo:updated');
          const index = cardRef.value.todogroups.findIndex(i => i.id === Number(todogroup_id));
          if(index > -1){
            const todoIndex = cardRef.value.todogroups[index].todos.findIndex(i => i.id === data.id);
            if(todoIndex > -1){
              cardRef.value.todogroups[index].todos.splice(todoIndex, 1, data);
            }
          }
        }
        if(val.value.event === 'todo:removed'){
          const index = cardRef.value.todogroups.findIndex(i => i.id === Number(todogroup_id));
          if(index > -1){
            const todoIndex = cardRef.value.todogroups[index].todos.findIndex(i => i.id === Number(data.removed_todo_id));
            if(todoIndex > -1){
              cardRef.value.todogroups[index].todos.splice(todoIndex, 1);
            }
          }
        }
    
        if(teamStore.card?.id === cardRef.value?.id){
          teamStore.card.todogroups = cardRef.value.todogroups;
        }
      }
    });
}