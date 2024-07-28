<template>
  <div :style="$q.screen.gt.xs ? 'min-width: 40vw' : ''" :class="$q.screen.gt.xs ? '' : 'fit'">
    <q-card
      :bordered="$q.screen.gt.xs"
      class="z-fab no-wrap q-pa-sm"
      :class="`
        ${$q.dark.mode ? 'text-grey-1' : 'bg-grey-1 text-grey-10'}
        ${$q.screen.gt.xs ? 'row' : 'column fit'}
      `"
      :style="$q.screen.gt.xs ? 'min-height: 40vh' : ''"
    >
      <section
        :class="!$q.screen.gt.xs ? 'border-bottom row no-wrap' : 'border-right'"
        style="min-width: 8rem;"
      >
        <q-btn v-if="!$q.screen.gt.xs" flat icon="mdi-chevron-left" dense size="sm" round class="q-mx-sm" v-close-popup />
        <q-tabs
          v-model="section"
          inline-label
          align="left"
          :vertical="$q.screen.gt.xs"
          class="q-indicator-dense"
        >
          <q-tab
            v-for="i in sections"
            :key="i.val" :name="i.val" :label="i.label" :icon="i.icon"
            class="transition"
            :class="section === i.val ? 'op-none' : 'op-7'"
            style="justify-content: flex-start"
          />
        </q-tabs>
      </section>
      <div class="column no-wrap q-space">
        <q-bar v-if="$q.screen.gt.xs" class="transparent">
          <q-space />
          <q-btn flat icon="close" dense size="sm" round v-close-popup />
        </q-bar>
        <q-scroll-area class="column no-wrap q-space">
          <q-tab-panels v-model="section" animated transition-prev="fade" transition-next="fade">
            <q-tab-panel name="theme">
              <UserTheme />
            </q-tab-panel>
            <q-tab-panel name="profile">
              <UpdateProfile />
            </q-tab-panel>
            <q-tab-panel name="others">
              <OtherSetting />
            </q-tab-panel>
          </q-tab-panels>
        </q-scroll-area>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserTheme from "./Settings/UserTheme.vue";
import UpdateProfile from "./Settings/UpdateProfile.vue";
import OtherSetting from "./Settings/OtherSetting.vue";

const section = ref("theme");
const sections = [
  {val: 'theme', label: '主题', icon: 'mdi-theme-light-dark'},
  {val: 'profile', label: '个人资料', icon: 'info'},
  {val: 'others', label: '其它', icon: 'mdi-dots-vertical'},
]
</script>
