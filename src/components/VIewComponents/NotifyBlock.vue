<template>
  <div
    class="container full-width radius-md border relative-position"
    style="height: 7rem"
  >
    <div class="box fit column no-wrap gap-xs q-pa-xxs">
      <template v-if="uiStore.unreads.team">
        <div v-if="uiStore.unreads.team.msg_count > 0" class="row no-wrap flex-center gap-xs unselected q-pa-xxs">
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
        <div v-if="uiStore.unreads.team.mention_count > 0" class="row no-wrap flex-center gap-xs unselected q-pa-xxs">
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
      <span class="bg-black border flex flex-center full-width overflow-hidden q-px-xs radius-xs shadow-14 text-info unselected font-smaller">
        {{ $time('HH:mm') }}
      </span>
    </div>
  </div>
</template>
<script setup>
import { onUnmounted } from 'vue';
import { uiStore } from "src/hooks/global/useStore";
import { $time, clearTimer } from 'src/hooks/useTime.js'
onUnmounted(() => {
  clearTimer();
})
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
