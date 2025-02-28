<template>
    <q-list bordered dense
        class="q-pa-xs radius-sm column no-wrap gap-xs"
    >
        <q-item>
            <q-item-section>
                <div class="row no-wrap items-center gap-sm">
                    <q-icon
                        v-for="marker in $ui().colorMarks"
                        :key="marker"
                        v-close-popup
                        dense
                        :size="todo.color_marker === marker ? '18px' : '12px'"
                        flat
                        round
                        padding="none"
                        :color="marker"
                        :name="
                            todo.color_marker === marker
                            ? 'mdi-checkbox-marked-circle'
                            : 'mdi-checkbox-blank-circle'
                        "
                        class="cursor-pointer"
                        @click="updateTodoColorMarker(marker)"
                    />
                </div>
            </q-item-section>
        </q-item>
        <q-separator />
        <q-item
            clickable
            v-ripple
            class="radius-xs"
            @click.stop="addAttachment(todogroup, element)"
        >
            <q-item-section side class="q-pr-sm">
            <q-icon size="xs" name="attachment" />
            </q-item-section>
            <q-item-section>{{ $t('attach_file') }}</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup class="radius-xs" @click="deleteTodoFn">
            <q-item-section side><q-icon name="mdi-close" /></q-item-section>
            <q-item-section>{{ $t('delete') }}</q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import { ref } from 'vue'
import {mm_wsStore, teamStore, uiStore} from "src/hooks/global/useStore.js";

const { todo } = defineProps(['todo'])

const emit = defineEmits(['deleteTodo','addAttachment'])
const deleteTodoFn = () => {
    emit("deleteTodo");
}
const updateTodoColorMarker = (marker) => {
  emit('updateTodoColorMarker', marker)
};
const addAttachment = () => {
  emit('addAttachment')
};
</script>

<style scoped>
</style>