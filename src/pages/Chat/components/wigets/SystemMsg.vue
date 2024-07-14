<template>
    <!-- <q-separator spaced inset class="q-space" /> -->
    <span>{{ Msg }}</span>
    <!-- <q-separator spaced inset class="q-space" /> -->
</template>

<script setup>
const props = defineProps({
    Msg: {
        type: String,
        default: ''
    }
})
</script>

<style lang="scss" scoped></style>
