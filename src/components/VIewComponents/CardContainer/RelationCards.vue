<template>
    <div v-if="relationsRef" class="full-width row no-wrap gap-md items-center q-pa-md q-my-md">
        <q-card v-for="i in relationsRef" :key="i.id" bordered flat class="col-xl-3 col-lg-4 col-md-4 col-sm-6 col-xs-12">
            <q-img
                :src="i.attributes.cover.data.attributes.url"
                :ratio="16/9"
                spinner-color="primary"
                spinner-size="32px"
            />
            <q-card-section>
                <div class="font-medium font-bold-600">{{ i.attributes.title }}</div>
            </q-card-section>
            <q-card-section class="row no-wrap gap-md q-pt-none">
                <q-avatar size="24px">
                    <q-img
                        :src="i.attributes.author.data.attributes.profile.avatar.data.attributes.url"
                        :ratio="1"
                        spinner-color="primary"
                        spinner-size="18px"
                    />
                </q-avatar>
                <div class="column q-space">
                    <span class="cursor-pointer" @click="$router.push(`/${i.attributes.author.data.attributes.user_channel.data.id}/posts`)">{{ i.attributes.author.data.attributes.username }}</span>
                    <span class="op-5">{{ i.attributes.author.data.attributes.profile.bio }}</span>
                </div>
            </q-card-section>
            <q-card-section class="q-pt-none op-5">
                <PublishedDate :publishedAt="i.attributes.publishedAt"/>
            </q-card-section>
        </q-card>
    </div>
</template>
<script setup>
import { toRef } from 'vue';
import PublishedDate from 'src/components/VIewComponents/PublishedDate.vue'

const props = defineProps({
    relations: {
        type: Array,
        default() {
            return []
        }
    }
})
const relationsRef = toRef(props,'relations')
</script>