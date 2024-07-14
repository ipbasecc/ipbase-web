<template>
<span>{{ timediff }}</span>
</template>

<script setup>
import {useTimeDiff} from 'src/hooks/global/usePublishedDate.js';
import { toRef } from 'vue';

const props = defineProps({
    publishedAt: {
      type: String,
      required: true
    }
});
const publishedAtRef = toRef(props,'publishedAt')

let { timediff, diff } = useTimeDiff(publishedAtRef.value)

</script>