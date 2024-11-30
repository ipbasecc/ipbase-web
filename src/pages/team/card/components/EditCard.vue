<template>
<q-card bordered class="radius-sm" style="width: 22rem">
    <q-card-section class="q-pa-xs border-bottom">
        <q-input v-model="params.data.name" square filled type="text" :aria-placeholder="params.name" />
    </q-card-section>
    <q-card-section class="border cursor-pointer q-pa-xs">
        <q-img v-if="cover"
            :src="cover.url"
            :ratio="16/9"
            spinner-color="primary"
            spinner-size="82px"
        >
        </q-img>
        <div class="absolute-full">
            <DrapUpload :isOSS="true"
            :allowedFormats="['image/jpg','image/jpeg','image/png','image/svg','image/webp','video/mov','video/mp4','video/m4v']"
            @uploaded="setCover" style="min-height: 8rem;" :caption="$t('drop_or_pick_cover')" />
        </div>
    </q-card-section>
    <q-card-section class="q-pa-xs border-bottom">
        <q-input v-model="price" square filled type="number" :aria-placeholder="price" />
    </q-card-section>
    <q-card-section class="q-pa-sm row no-wrap items-center">
        <q-btn dense flat padding="xs md" :label="$t('cancel')" v-close-popup />
        <q-space />
        <q-btn color="primary" dense padding="xs lg" label="OK" @click="update()" />
    </q-card-section>

    <q-inner-loading :showing="loading">
        <q-spinner-orbit size="3rem" color="primary" />
    </q-inner-loading>
</q-card>
</template>

<script setup>
import {ref} from 'vue';
import { updateCard } from "src/api/strapi/project.js";
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'

const {card} = defineProps(['card']);
const emit = defineEmits(['updated'])

const params = ref({
    data: {
        name: card.name,
        price: card.price,
        cover: card.cover?.id
    }
})
const cover = ref(card.cover)
const price = ref(card.price / 100)
const setCover = (val) => {
  // console.log('setCover', val);
  if(val?.id){
    params.value.data.cover = val.id
    cover.value = val.attributes
  }
}

const loading = ref(false);
const update = async() => {
    loading.value = true
    params.value.data.price = price.value * 100
    const {data} = await updateCard(card.id, params.value);
    if(data){
        loading.value = false
        emit('updated');
    }
}
</script>