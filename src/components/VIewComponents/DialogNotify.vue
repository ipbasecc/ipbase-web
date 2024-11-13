<template>
    <q-dialog v-model="show_dialog" persistent>
        <q-card bordered>
            <q-card-section class="row items-center q-pa-sm">
                <span v-if="notify.title" class="q-px-sm font-large font-bold-600">{{ $t(notify.title) }}</span>
                <q-space />
                <q-btn flat icon="close" dense round @click="uiStore.dialogNotify = null" />
            </q-card-section>
            <q-card-section v-if="notify.message" class="q-pa-lg">
                <span v-if="notify.message">{{ $t(notify.message) }}</span>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { uiStore } from 'src/hooks/global/useStore';
import { computed } from 'vue';

const show_dialog = computed(() => !!uiStore.dialogNotify);
const notifyCollections = {
    storageCapacityExceeded: {
        title: 'storageCapacityExceeded_notify_title',
        message: 'storageCapacityExceeded_notify_message'
    },
    cardNumberExceeded: {
        title: 'cardNumberExceeded_notify_title',
        message: 'cardNumberExceeded_notify_message'
    },
}
const notify = computed(() => uiStore.dialogNotify ? notifyCollections[uiStore.dialogNotify] : null)
</script>