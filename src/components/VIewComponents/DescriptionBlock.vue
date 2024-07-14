<template>
    <div
        class="full-width description q-pa-md q-my-md "
        :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-2'"
        :style="$q.dark.mode ? 'border-color: #636363;' : 'border-color: #a8a8a8;'"
    >
        {{ description }}
    </div>
</template>
<script setup>
const props = defineProps({
    description: {
        type: String,
        default: ''
    }
})
</script>
<style scoped>
.description {
    border-left: 5px solid;
}
</style>