<template>
    <q-date
        v-if="days"
        v-model="days"
        flat
        bordered
        range
        multiple
        :readonly="readonlyRef"
        class="full-width"
        title="我的“在忙时间”"
        mask="YYYY-MM-DD"
    />
  </template>
  
<script setup>
    import { inject, ref, toRef, watch } from 'vue';
    import { updateWorkingday } from "src/apollo/api/api.js";
    import useUserStore from 'src/stores/user.js';

    const props = defineProps({
        workingdayItems: {
            type: Array,
            default() {
                return []
            },
            channelId: {
                type: String,
                default: '',
            }
        },
        readonly: {
            type: Boolean,
            default: true
        }
    });
    // const userStore = useUserStore();
    const readonlyRef = toRef(props,'readonly');
    const workingdayItemsRef = toRef(props,'workingdayItems');
    const days = ref();
    const id = inject('channelId')
    watch(workingdayItemsRef,() => {
        if(workingdayItemsRef.value) {
            days.value = workingdayItemsRef.value;
        }
    },{immediate:true,deep:true});
    const channelIdRef = toRef(props,'channelId');
    const updateWorkingdayParams = ref({
        id: id,
        data: {
            workingday: ''
        }
    });
    const {
        mutate: updateWorkingdayMutate,
        onDone: updateWorkingdayOnDone,
        onError
    } = updateWorkingday(updateWorkingdayParams);

    const updateWorkingdayDate = ref();
    const motifyWorkingday = async () => {
        const arr = days.value.filter(i => i.from && i.to);
        const workingdayItems = arr.map(i => ({
            event: i.event,
            from: i.from,
            to: i.to
        }))
        updateWorkingdayParams.value.data.workingday = workingdayItems;
        const { data } = await updateWorkingdayMutate();
        updateWorkingdayDate.value = data;
    };
    watch(days,async (newDays, oldDays) => {
        setTimeout(() => {
            if(newDays != oldDays) {
                days.value = newDays;
                motifyWorkingday();
            }
        },1000)
    },{immediate:false,deep:true});
//   watch(props,() => {
//     days.value = props.workingdayItems.map(item => ({
//         ...item,
//         from: item.from.replace(/-/g, '/'),
//         to: item.to.replace(/-/g, '/')
//     }));
//     },{
//         immediate:true,
//         deep:true
//     }
//  )
</script>
  