<template>
    <q-list dense bordered class="column no-wrap gap-xs radius-sm q-pa-xs">
        <q-item clickable class="no-padding">
            <q-item-section>
                <q-input
                    v-model="update_params.data.name"
                    dense
                    square
                    filled
                    autofocus
                    type="text"
                    :aria-placeholder="group.name"
                    @keyup.esc="cancelUpdate()"
                    @keyup.enter="updateTodogroupFn()"
                >
                <template v-if="update_params.data.name !== null && update_params.data.name !== group.name" v-slot:append>
                    <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="check"
                        @click="updateTodogroupFn()"
                    />
                </template>
                </q-input>
            </q-item-section>
        </q-item>
        <q-item
            clickable
            v-close-popup
            class="radius-xs"
            @click="toggleHideCompleted(group)"
        >
            <q-item-section side>
            <q-icon
                name="mdi-checkbox-marked-circle"
                :color="group.hideCompleted ? 'green' : ''"
                size="xs"
            />
            </q-item-section>
            <q-item-section class="q-pr-md"
            >隐藏已完成</q-item-section
            >
        </q-item>
        <q-item
            v-if="false"
            clickable
            v-close-popup
            class="radius-xs"
            @click="toProjectKanban(group.kanban?.id)"
        >
            <q-item-section side>
            <q-icon
                name="mdi-developer-board"
                size="xs"
            />
            </q-item-section>
            <q-item-section class="q-pr-md"
            >打开关联看板</q-item-section
            >
        </q-item>
        <q-separator />
        <q-item
            clickable
            :v-close-popup="rf_delete"
            class="radius-xs"
            :class="rf_delete ? 'bg-negative' : ''"
            @click="deleteTodogroupFn()"
        >
            <q-item-section side
            ><q-icon name="close" size="xs"
            /></q-item-section>
            <q-item-section class="q-pr-md">
            {{
                group.todos?.length > 0 && rf_delete
                ? $t('rf_delete_todogroup')
                : $t('delete_todogroup')
            }}
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { deleteTodogroup, updateTodogroup } from "src/api/strapi/project.js";

import { findKanbanByTodogroupID } from 'src/api/strapi.js'
import { toggleTeam } from 'src/pages/team/hooks/useTeam.js'
import localforage from "localforage";
import { teamStore, uiStore } from 'src/hooks/global/useStore';

const router = useRouter();

const { group, card, } = defineProps({
  group: Object,
  card: Object,
})
const emit = defineEmits(['todogroupUpdated', 'cancelUpdate', 'todogroupDeleted']);

const cancelUpdate = () => {
    emit('cancelUpdate');
}
const update_params = ref({
    data: {
        name: null,
    }
});
const updateTodogroupFn = async () => {
  if (!update_params.value.data.name || update_params.value.data.name === group.name) return;
  if (card) {
    update_params.value.props = {
      card_id: card.id,
    };
  }
  let { data } = await updateTodogroup(group?.id, update_params.value);
  if (data && card) {
    Object.assign(group, data);
    emit('cancelUpdate');
  }
};
const rf_delete = ref(false);
const deleteTodogroupFn = async (id) => {
    if(group.todos.length > 0 && !rf_delete.value) {
        rf_delete.value = true;
        return
    } else {
        const res = await deleteTodogroup(group.id);
        console.log('deleteTodogroupFn', res);
        
        if(res) {
            emit('todogroupDeleted', group.id);
        }
    }
}
const toggleHideCompleted = async (i) => {
  i.hideCompleted = i.hideCompleted ? !i.hideCompleted : true;
  const _key = `__todogroup_${i.id}_pfrs`;
  await localforage.setItem(_key, i.hideCompleted);
};

const toProjectKanban = async (id) => {
    const to = async (data) => {
        const _team = data.group?.board?.project?.by_team;
        const _project_id = data.group?.board?.project?.id;
        const _kanban_id = data.id;
        if(_project_id && _kanban_id && _team) {
            if(_team.id !== teamStore.team?.id) {
                await toggleTeam(_team);
            }
            uiStore.app = 'teams'
            teamStore.kanban_rightDrawer = 'private_todos'
            router.push(`/teams/projects/${_project_id}/kanban/${_kanban_id}`)
        };
    }
    const _kanban_by_group = teamStore.init.todogroups.find(i => i.id === group.id)?.kanban;
    if(_kanban_by_group?.group?.board?.project?.id) {
        to(_kanban_by_group)
    } else {
        const { data } = await findKanbanByTodogroupID(id);
        console.log('findKanbanByTodogroupID', data);
        if(data) {
            teamStore.init.todogroups.find(i => i.id === group.id).kanban = data;
            to(data)
        }
    }
}
</script>

<style scoped>
</style>