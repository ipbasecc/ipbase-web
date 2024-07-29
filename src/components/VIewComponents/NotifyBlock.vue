<template>
  <div
    class="container full-width radius-md border relative-position"
    style="height: 7rem"
  >
    <div class="box fit column no-wrap gap-xs q-pa-xs">
      <template v-if="uiStore.unreads.team">
        <div class="row no-wrap flex-center gap-xs unselected">
          <q-icon name="mdi-message-alert" />
          <span>{{uiStore.unreads.team.msg_count}}</span>
          <q-tooltip class="transparent">
            <q-card bordered>
              <q-card-section class="q-py-xs q-px-sm font-medium text-no-wrap">
                {{ $t('unread') }}: {{uiStore.unreads.team.msg_count}}
              </q-card-section>
            </q-card>
          </q-tooltip>
        </div>
        <div class="row no-wrap flex-center gap-xs unselected">
          <span class="font-medium font-bold-600">@</span>
          <span>{{uiStore.unreads.team.mention_count}}</span>
          <q-tooltip class="transparent">
            <q-card bordered>
              <q-card-section class="q-py-xs q-px-sm font-medium text-no-wrap">
                <span class="font-medium font-bold-600">@</span>：{{uiStore.unreads.team.msg_count}}
              </q-card-section>
            </q-card>
          </q-tooltip>
        </div>
      </template>
      <q-space />
      <span>{{ $time("HH:mm") }}</span>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { teamStore, uiStore } from "src/hooks/global/useStore";

const todo_completed = computed(() => {
  let percent;
  const _completed = teamStore.all_todos?.filter((i) => i.status);
  // console.log("all_todos _completed", _completed);
  if (
    !teamStore.all_todos ||
    teamStore.all_todos?.length === 0 ||
    !_completed
  ) {
    percent = 0;
  } else {
    percent = _completed.length / teamStore.all_todos.length;
  }
  return Math.round(percent * 100);
});
const card_completed = computed(() => {
  let percent;
  const _completed = teamStore.all_cards?.filter(
    (i) => i.status === "completed"
  );
  // console.log("all_cards _completed", _completed);
  if (
    !teamStore.all_cards ||
    teamStore.all_cards?.length === 0 ||
    !_completed
  ) {
    percent = 0;
  } else {
    percent = _completed.length / teamStore.all_cards.length;
  }
  return Math.round(percent * 100);
});
</script>
<style scoped>
.container {
  color: white;
  position: relative;
  font-family: sans-serif;
}

.container::before,
.container::after {
  content: "";
  background-color: #7200aa47;
  position: absolute;
}

.container::before {
  border-radius: 50%;
  width: 6rem;
  height: 6rem;
  top: 30%;
  right: 7%;
}

.container .box {
  background-color: rgba(255, 255, 255, 0.074);
  box-shadow: 2px 4px 4px 0 #240063;
  border: 1px solid rgba(255, 255, 255, 0.222);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: 0.7rem;
  transition: all ease 0.3s;
}

.container .box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.container .box:hover {
  box-shadow: 0 0 20px 1px #ffbb763f;
  border: 1px solid rgba(255, 255, 255, 0.454);
}
</style>
