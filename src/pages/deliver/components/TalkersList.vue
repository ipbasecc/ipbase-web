<template>
    <q-scroll-area class="absolute-full">
        <q-infinite-scroll @load="onLoad" :offset="250" :disable="loading || !hasMore">
            <q-list>
                <q-item v-for="talker in talkers" :key="talker.id" clickable v-ripple @click="startTalk(talker)">
                    <q-item-section avatar>
                        <UserAvatar
                            :image="talker.user?.profile?.avatar?.url"
                            :user_id="talker.user?.mm_profile?.id"
                            :size="36"
                            :disable_cardRef="true"
                            :mm_member="talker.user?.mm_profile"
                        />
                    </q-item-section>
                    <q-item-section>
                        <div class="text-weight-bold">{{ talker.user?.username }}</div>
                    </q-item-section>
                </q-item>
            </q-list>
            <template v-slot:loading>
                <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
            </template>
        </q-infinite-scroll>
    </q-scroll-area>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { findTalkers } from 'src/api/strapi'
import { createDirect, getUserStatus } from 'src/api/mattermost'
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import { teamStore } from 'src/hooks/global/useStore';

const { talker } = defineProps(['talker'])
const emit = defineEmits(['startTalk'])
const talkers = ref([])

const offset = ref(0)
const limit = ref(10)
const count = ref(0)
const loading = ref(false)
const hasMore = computed(() => count.value > talkers.value.length)
const params = computed(() => ({
    offset: offset.value,
    limit: limit.value
}))
async function onLoad(index, done) {
    await findMoreTalkers()
    done()
}
const findTalkersFn = async () => {
    loading.value = true
    const {data} = await findTalkers(params.value)
    talkers.value = data.certifications
    count.value = data.count
    loading.value = false
}
const findMoreTalkers = async () => {
    offset.value += limit.value
    await findTalkersFn()
}

const self_mm_id = computed(() => teamStore.init?.mm_profile?.id)
const startTalk = async (talker) => {
    const b = talker.user?.mm_profile?.id
    if(b){
        const {data} = await createDirect(self_mm_id.value, b)
        emit('startTalk', data)
    }
}
onMounted(async () => {
    if(talker){
        await startTalk(talker)
    }
    await findTalkersFn()
})
</script>