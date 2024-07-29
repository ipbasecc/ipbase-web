<template>
  <q-icon name="info" class="op-5">
    <q-tooltip
      class="transparent"
      :class="
        $q.dark.mode ? 'bg-grey-black text-grey-1' : 'bg-white text-grey-10'
      "
    >
      <q-card
        :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
        class="q-py-xs q-px-md font-small"
        style="max-width: 22rem"
      >
        <ol v-if="kanban_id" class="q-pl-md q-py-none">
          <li>{{ $t('kanban_attach_todo_tip_lineA') }}</li>
          <li>{{ $t('kanban_attach_todo_tip_lineB') }}</li>
          <li class="text-orange">{{ $t('kanban_attach_todo_tip_lineC') }}</li>
          <li>{{ $t('kanban_attach_todo_tip_lineD') }}</li>
        </ol>
        <ul v-else class="q-pl-md q-py-none">
          <li>{{ $t('kanban_attach_todo_tip_lineE') }}</li>
          <li>{{ $t('kanban_attach_todo_tip_lineF') }}</li>
          <li class="text-orange">{{ $t('kanban_attach_todo_tip_lineG') }}</li>
        </ul>
      </q-card>
    </q-tooltip>
  </q-icon>
</template>
<script setup>
const props = defineProps({
  kanban_id: {
    type: Number,
    default: NaN,
  },
  card: {
    type: Object,
    default: null,
  },
});
</script>
