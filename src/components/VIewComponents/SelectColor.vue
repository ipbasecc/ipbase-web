<template>
    <div class="row no-wrap items-center gap-sm">
        <q-icon
            v-for="marker in colorMarks"
            :key="marker"
            dense
            :size="element.color_marker === marker ? 'md' : 'xs'"
            flat round padding="none"
            :color="marker"
            :name="element.color_marker === marker ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle'"
            class="cursor-pointer"
            @click="select(marker)"
        />
    </div>
</template>

<script setup>
const emit = defineEmits('colorSelected')
const colorMarks = ['primary','secondary','accent','positive','red','info','warning','gery'];
const select = (color) => {
    emit('colorSelected',color)
}
</script>

<style lang="scss" scoped>


</style>