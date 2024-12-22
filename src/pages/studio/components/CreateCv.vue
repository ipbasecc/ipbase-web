<template>
    <div class="fit column no-wrap items-center">
        <q-toolbar class="transparent border-bottom">
            <q-btn flat round icon="mdi-chevron-left" @click="router.push('/studio/works')" />
            <span>{{ modify ? '编辑简历' : '创建简历'}}</span>
            <q-space />
            <q-btn dense padding="xs md" color="primary" :label="modify ? '编辑' : '创建'" :disable="!needProcess" @click="process" />
        </q-toolbar>
        <div class="row no-wrap gap-md q-space" style="min-width: 640px;max-width: 1024px;width: 82vw;">
            <ExperiencesContainer v-model:experiences="params.data.experiences" />
            <FieldsContainer v-model:params="params" />
        </div>
    </div>
</template>
<script setup>
import { ref, watchEffect, watch } from 'vue';
import { createCv, updateCv } from "src/api/strapi.js";
import FieldsContainer from './FieldsContainer.vue'
import ExperiencesContainer from './ExperiencesContainer.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const {modify, cv} = defineProps(['modify', 'cv']);
const emit = defineEmits(['processed']);

const params = ref({
    data: {
        fullname: null,
        title: null,
        sex: null,
        birthday: null,
        introduce: null,
        occupation: null,
        power: null,
        tags: [],
        location: null,
        phone: null,
        homepage: null,
        experiences: []
    }
})
const needProcess = ref(false);
watchEffect(() => {
    if(modify){
        Object.keys(cv).forEach(key => {
            console.log(key, cv[key]);
            params.value.data[key] = cv[key];
        });
        needProcess.value = true;
    }
})
const process = () => {
    if(modify){
        update();
    }else{
        create();
    }
}
const create = async () => {
    if(typeof params.value.data.phone === 'number'){
        params.value.data.phone = params.value.data.phone.toString();
    }
    const {data} = await createCv(params.value);
    emit('processed', data)
}
const update = async () => {
    if(typeof params.value.data.phone === 'number'){
        params.value.data.phone = params.value.data.phone.toString();
    }
    const {data} = await updateCv(cv.id, params.value);
    emit('processed', data)
}

watch(params, () => {
    needProcess.value = true;
},{immediate: false, deep: true})
</script>