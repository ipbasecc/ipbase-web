import { teamStore} from "src/hooks/global/useStore";
import {ref, computed, watch} from "vue";
import { removeDuplicatesById } from 'src/hooks/utilits.js'
const kanban = computed(() => teamStore?.kanban || []);
const card_kanban = computed(() => teamStore?.card?.card_kanban || []);

const processKanban = (_kanban) => {
  // console.log('_kanban', _kanban)
  teamStore.all_kanbans.push(_kanban)

  if(teamStore.all_kanbans?.length > 0){
    teamStore.all_kanbans = removeDuplicatesById(teamStore.all_kanbans)
  }
  // console.log('teamStore.all_kanbans', teamStore.all_kanbans)
}

watch([kanban, card_kanban], () => {
  if(kanban.value?.id){
    processKanban(kanban.value)
  }
  if(card_kanban.value?.id){
    processKanban(card_kanban.value)
  }
},{immediate: true,deep:true})

const all_kanbans = computed(() => teamStore?.kanbans || []);
const all_cards = ref([]);
const all_todogroups = ref([]);
const all_todos = ref([]);

watch(all_kanbans, () => {
  if(all_kanbans.value?.length > 0){
    all_kanbans.value = removeDuplicatesById(all_kanbans.value) // you need push data to teamStore.all_kanbans sometimes, so run this action here!
    const columns = all_kanbans.value.map(i => i.columns?.length > 0 ? i.columns : []).flat(2);
    if(columns?.length > 0){
      const _cards = columns.map((i) => i.cards?.length > 0 ? i.cards : []).flat(2);
      all_cards.value.push(..._cards)
    }
  }
},{immediate: true,deep:true})

watch(all_cards, () => {
  if(all_cards.value?.length > 0){
    const _todogroups = all_cards.value.map((i) => i.todogroups?.length > 0 ? i.todogroups : []).flat(2);
    all_todogroups.value.push(..._todogroups)
    console.log('all_todogroups', all_todogroups)
  }
},{immediate: true,deep:true})

watch(all_todogroups, () => {
  if(all_todogroups.value?.length > 0){
    const _todos = all_todogroups.value.map((i) => i.todos?.length > 0 ? i.todos : []).flat(2);
    all_todos.value.push(..._todos)
  }
},{immediate: true,deep:true})

const collection = {
  all_kanbans: all_kanbans.value,
  all_cards: all_cards.value,
  all_todogroups: all_todogroups.value,
  all_todos: all_todos.value
}
export default function getCollection(){
  return collection
}
