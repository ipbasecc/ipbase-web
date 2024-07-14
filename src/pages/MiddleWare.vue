<template>
    userId:{{ error }}
</template>
<script setup>
    import { findMe } from "src/apollo/api/api.js";
    import { ref, watch } from "vue";
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const userId = ref(null)
    const { loading, error, result: getMe } = findMe();
    watch(getMe, () => {
        userId.value = getMe.value.me.id;
    })
    watch(error, () => {
        router.push("/");
    })

</script>