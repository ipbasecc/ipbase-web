<template>
    <q-card flat v-if="profileDate" bordered class="full-width q-pa-md">
        <q-card-section class="row flex-center">
            <q-avatar v-if="channelProfile.avatar" size="100px"><q-img :src="channelProfile.avatar" /></q-avatar>
            <q-img v-if="!channelProfile.avatar && channelProfile.brand" :src="channelProfile.brand" class="full-width q-px-md" />
        </q-card-section>
        <q-card-section class="column flex-center">
            <div class="text-h6" v-if="channelProfile.title">{{ channelProfile.title }}</div>
            <div class="text-subtitle2 op-7" v-if="channelProfile.slogan">{{ channelProfile.slogan }}</div>
        </q-card-section>
        <q-card-section v-if="channelProfile.description">
            <div class="q-pa-lg text-subtitle2">{{ channelProfile.description }}</div>
        </q-card-section>
    </q-card>
</template>
<script setup>
import {ref,computed, watch} from 'vue'
const props = defineProps({
    profile: {
        type: Object,
        default() {
            return {}
        }
    }
})
const profileDate = ref()
const title = ref()
const description = ref()
const slogan = ref()
const avatar = ref()
const brand = ref()
const channelProfile = ref()
watch(props,() => {
    if(props && props.profile) {
        profileDate.value = props.profile.attributes;
        title.value = computed(() => profileDate.value?.title ?? null);
        description.value = computed(() => profileDate.value?.description ?? null);
        slogan.value = computed(() => profileDate.value?.slogan ?? null);
        avatar.value = computed(() => profileDate.value?.avatar?.data.attributes.url ?? null);
        brand.value = computed(() => profileDate.value?.brand?.data.attributes.url ?? null);
        // 模板直接取上方值时，会带着双引号，因此重新生成对象
        channelProfile.value = {
            title: title.value,
            description: description.value,
            slogan: slogan.value,
            avatar: avatar.value,
            brand: brand.value
        }
    }
},{
    immediate:true,
    deep:true
})
</script>