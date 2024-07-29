<template>
  <q-list bordered dense class="radius-sm q-pa-xs">
    <template v-if="element.mm_thread">
      <q-item
        clickable
        v-ripple
        class="radius-xs"
        v-close-popup
        @click.stop="enterThread(element.mm_thread)"
      >
        <q-item-section side class="q-pr-sm">
          <q-icon size="xs" name="forum" />
        </q-item-section>
        <q-item-section>{{ $t('join_talk') }}</q-item-section>
      </q-item>
      <q-separator spaced class="op-3" />
    </template>
    <template
      v-if="!inCard || (useAuths('content', ['card_todo', 'todo'], members, roles) || isCreator)"
    >
      <q-item>
        <q-item-section>
          <div class="row no-wrap items-center gap-sm">
            <q-icon
              v-for="marker in colorMarks"
              :key="marker"
              v-close-popup
              dense
              :size="element.color_marker === marker ? '18px' : '12px'"
              flat
              round
              padding="none"
              :color="marker"
              :name="
                element.color_marker === marker
                  ? 'mdi-checkbox-marked-circle'
                  : 'mdi-checkbox-blank-circle'
              "
              class="cursor-pointer"
              @click="updateTodoColorMarker(element, marker)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-separator spaced class="op-3" />
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
    </template>
    <template
      v-if="!inCard || (useAuths('delete', ['card_todo', 'todo'], members, roles) || isCreator)"
    >
      <q-separator spaced class="op-3" />
      <q-item
        clickable
        v-ripple
        class="radius-xs"
        @click.stop="deleteTodoFn(todogroup, element)"
      >
        <q-item-section side class="q-pr-sm">
          <q-icon size="xs" name="close" />
        </q-item-section>
        <q-item-section>{{ $t('delete') }}</q-item-section>
      </q-item>
    </template>
  </q-list>
</template>
<script setup>
import {toRefs} from "vue";
import {teamStore} from "src/hooks/global/useStore";

const props = defineProps({
  element: {
    type: Object,
    default() {
      return null;
    },
  },
  todogroup: {
    type: Object,
    default() {
      return null;
    },
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  members: {
    type: Object,
    default: void 0,
  },
  roles: {
    type: Object,
    default: void 0,
  },
  inCard: {
    type: Boolean,
    default: true
  }
});

const { element, todogroup, isCreator, members, roles, inCard } = toRefs(props);
const emit = defineEmits(['addAttachment', 'updateTodoColorMarker', 'deleteTodoFn']);
const colorMarks = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "red",
  "info",
  "warning",
  "clear",
];

const enterThread = (thread) => {
  if(!thread) return
  if (
    teamStore.kanban_rightDrawer === "thread" &&
    teamStore.thread?.id === thread.id
  ) {
    teamStore.kanban_rightDrawer = null;
    teamStore.thread = null;
  } else {
    teamStore.kanban_rightDrawer = "thread";
    teamStore.thread = thread;
  }
};

const updateTodoColorMarker = (element, marker) => {
  emit('updateTodoColorMarker', element, marker)
};
const addAttachment = (group, todo) => {
  emit('addAttachment', group, todo)
};
const deleteTodoFn = (group, todo) => {
  emit('deleteTodoFn', group, todo)
};
</script>
