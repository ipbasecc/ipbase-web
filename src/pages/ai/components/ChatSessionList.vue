<template>
    <q-list dense class="column gap-xs">
        <q-item v-for="session in sessions" 
                :key="session.id" 
                clickable 
                @click="$emit('select', session)"
                v-ripple
                class="hovered-item radius-xs"
                :class="currentSessionId === session.id ? 'active-listitem border' : 'border-placeholder'">
            <q-item-section>
                <q-item-label>{{ session.title }}</q-item-label>
                <q-item-label caption class="op-5 text-white">
                {{ new Date(session.updatedAt).toLocaleString() }}
                </q-item-label>
            </q-item-section>
            <q-item-section side top class="hover-show">
                <q-btn flat round dense size="sm" color="negative" icon="close" @click.stop="$emit('delete', session)" />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
defineProps({
    sessions: {
        type: Array,
        required: true
    },
    currentSessionId: {
        type: String,
        default: null
    }
})

defineEmits(['select', 'delete'])
</script>

<style scoped>
.text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}
</style> 