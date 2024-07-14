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
          <li>如果你正在处理此看板中的任务</li>
          <li>如果你需要针对此看板添加一些备忘或待办</li>
          <li class="text-orange">如果这些备忘或待办只是写给自己的</li>
          <li>那么请在此处操作</li>
        </ol>
        <ul v-else class="q-pl-md q-py-none">
          <li>您可在此记录自己需要处理的事项</li>
          <li>此为全局备忘，可以不关联任何内容</li>
          <li class="text-orange">此处内容仅您个人可见</li>
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
