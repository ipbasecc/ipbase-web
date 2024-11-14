<template>
    <q-list class="q-pa-xs">
        <q-item clickable v-ripple class="radius-xs">
            <q-item-section side>
                <q-icon name="mdi-chart-areaspline" />
            </q-item-section>
            <q-item-section>{{ $t('business_overview') }}</q-item-section>
        </q-item>
    </q-list>
</template>