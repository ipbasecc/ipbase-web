<template>
<q-card v-if="work" bordered>
    <q-img
        v-if="work.cover"
        :src="work.cover.url"
        :ratio="16/9"
        spinner-color="primary"
        spinner-size="82px"
    />
    <q-card-section class="column no-wrap gap-sm">
        <div class="text-h6 cursor-pointer" @click="enterWork()">{{ work.title }}</div>
        <div class="row items-center">
            <q-avatar v-if="work.creator.profile.avatar" size="32px">
                <q-img
                    :src="work.creator.profile.avatar.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="22px"
                />
            </q-avatar>
            <div class="text-subtitle2 q-ml-sm">
                {{ work.creator.username }}
            </div>
        </div>
    </q-card-section>
</q-card>
<q-dialog v-model="show_detail" full-width full-height>
    <q-card bordered class="column" style="width: 80vw; height: 80vh;">
        <q-toolbar class="transparent z-max">
            <q-space />
            <q-btn color="primary" round dense size="sm" icon="mdi-close" @click="show_detail = false" />
        </q-toolbar>
        <WorkDetial :work_id="work.id" :mediaOnly="true" />
    </q-card>
</q-dialog>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WorkDetial from '../WorkDetial.vue'
const router = useRouter()
const { work, is_page } = defineProps(['work', 'is_page'])
const show_detail = ref(false)
const enterWork = () => {
    if(is_page) {
        router.push(`/studio/works/${work.id}`)
    }else {
        show_detail.value = true
    }
}
</script>