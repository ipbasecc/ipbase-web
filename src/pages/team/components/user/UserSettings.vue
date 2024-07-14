<template>
  <div style="min-width: 40vw">
    <q-card
      bordered
      class="z-max"
      :class="
        $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
      "
    >
      <div class="fit row no-wrap">
        <q-list
          class="border-right q-pa-sm column gap-xs"
          style="min-width: 160px; min-height: 36rem"
        >
          <q-item
            clickable
            v-ripple
            @click="section = 'theme'"
            class="radius-xs"
            :class="section === 'theme' ? 'bg-primary text-white' : ''"
          >
            <q-item-section side>
              <q-icon
                name="mdi-theme-light-dark"
                :color="section === 'theme' ? 'white' : ''"
              />
            </q-item-section>
            <q-item-section>主题</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="section = 'profile'"
            class="radius-xs"
            :class="section === 'profile' ? 'bg-primary text-white' : ''"
          >
            <q-item-section side>
              <q-icon
                name="info"
                :color="section === 'profile' ? 'white' : ''"
              />
            </q-item-section>
            <q-item-section>个人资料</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="section = 'others'"
            class="radius-xs"
            :class="section === 'others' ? 'bg-primary text-white' : ''"
          >
            <q-item-section side>
              <q-icon
                name="mdi-dots-vertical"
                :color="section === 'others' ? 'white' : ''"
              />
            </q-item-section>
            <q-item-section>其它</q-item-section>
          </q-item>
        </q-list>
        <div class="fit column no-wrap q-space q-pa-sm">
          <div class="q-pa-sm row no-wrap items-center">
            <q-space />
            <q-btn flat icon="close" dense size="sm" round v-close-popup />
          </div>
          <UserTheme v-if="section === 'theme'" />
          <UpdateProfile v-if="section === 'profile'" />
          <OtherSetting v-if="section === 'others'" />
        </div>
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
</script>

<style lang="scss" scoped></style>
