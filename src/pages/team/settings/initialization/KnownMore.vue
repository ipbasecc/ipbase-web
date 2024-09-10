<template>
    <div class="q-space gap-md" :class="$q.screen.lt.sm ? 'column gap-md' : 'row'">
        <div class="column flex-center q-pa-lg" :style="$q.screen.lt.sm ? 'order: 2' : ''">
          <section class="column q-mb-md">
            <span class="font-large text-h2" style="line-height: 1.3;">了解更多</span>
            <span class="font-medium">请逐个点击下方内容查看后完成初始化</span>
          </section>
            <q-list class="q-pa-sm">
                <template v-for="i in items" :key="i.val">
                    <q-item
                        clickable v-ripple @click="readit(i.val)"
                        :active="readed.includes(i.val)"
                        class="q-mb-xs radius-xs transition"
                        :class="actived === i.val ? 'bg-positive border' : readed.includes(i.val) ? 'bg-grey-4 border' : void 0"
                        :style="`height: ${actived === i.val ? 4.6 : 2.4}rem;`"
                    >
                        <q-item-section side>
                            <q-icon
                                :color="actived === i.val ? 'white' : readed.includes(i.val) ? 'positive' : void 0"
                                :name="readed.includes(i.val) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-marked-circle-outline'"
                            />
                        </q-item-section>
                        <q-item-section>{{ $t(i.label) }}</q-item-section>
                    </q-item>
                </template>
            </q-list>
        </div>
        <div v-if="!$q.screen.lt.sm" class="column flex-center col">
            <TeamMode v-if="actived === 'team_mode'" />
            <ChatChannel v-if="actived === 'channel'" />
            <ProjectManager v-if="actived === 'project'" />
            <ChatThreads  v-if="actived === 'threads'" />
            <ShareFeedback  v-if="actived === 'share_feedback'" />
            <TeamPerson  v-if="actived === 'team_person'" />
        </div>
        <q-responsive v-else :ratio="16/9" style="order: 1" class="full-width text-white">
            <TeamMode v-if="actived === 'team_mode'" />
            <ChatChannel v-if="actived === 'channel'" />
            <ProjectManager v-if="actived === 'project'" />
            <ChatThreads  v-if="actived === 'threads'" />
            <ShareFeedback  v-if="actived === 'share_feedback'" />
            <TeamPerson  v-if="actived === 'team_person'" />
        </q-responsive>
    </div>
  </template>
  
<script setup>
import { ref, watchEffect } from 'vue'
import TeamMode from './KnownMore/TeamMode.vue'
import ChatChannel from './KnownMore/ChatChannel.vue'
import ProjectManager from './KnownMore/ProjectManager.vue'
import ChatThreads from './KnownMore/ChatThreads.vue'
import ShareFeedback from './KnownMore/ShareFeedback.vue'
import TeamPerson from './KnownMore/TeamPerson.vue'

const actived = ref('team_mode')
const items = [
{
    label: 'initialization_step3_label_1',
    icon: 'bluetooth',
    val: 'team_mode'
},
{
    label: 'initialization_step3_label_2',
    icon: 'bluetooth',
    val: 'channel'
},
{
    label: 'initialization_step3_label_3',
    icon: 'bluetooth',
    val: 'project'
},
{
    label: 'initialization_step3_label_4',
    icon: 'bluetooth',
    val: 'threads'
},
{
    label: 'initialization_step3_label_5',
    icon: 'bluetooth',
    val: 'share_feedback'
},
{
    label: 'initialization_step3_label_6',
    icon: 'bluetooth',
    val: 'team_person'
},
]
const readed = ref(['team_mode'])
const readit = (val) => {
    if (!readed.value.includes(val)) {
        readed.value.push(val)
    }
    actived.value = val
}
const emit = defineEmits(['KnownMoreInitialized'])
watchEffect(() => {
    if (readed.value.length === items.length) {
        emit('KnownMoreInitialized')
    }
})
</script>