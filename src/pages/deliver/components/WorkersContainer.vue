<template>
    <div class="row gap-md q-pa-md">
        <q-card v-for="i in deals" :key=i.id bordered :flat="!$q.dark.mode" style="width: 22rem;">
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
            <q-card-section>
                <div class="text-h6">Our Changing Planet</div>
                <div class="text-subtitle2">by John Doe</div>
            </q-card-section>
        </q-card>
    </div>
</template>
<script setup>
const { deals } = defineProps(['deals'])
</script>