<template>
    <div class="full-width column no-wrap flex-center q-pb-xl q-mb-xl" style="height: 66vh">
        <ChatStarter style="max-width: 560px;max-height: 560px" />
        <span :class="$q.screen.gt.sm ? 'text-h1' : 'font-bold-600 font-larger'">
        Channel Chat start
        </span>
    </div>
</template>

<script setup>
import ChatStarter from 'src/pages/team/components/widgets/icons/ChatStarter.vue'
</script>

<style scoped>
</style>