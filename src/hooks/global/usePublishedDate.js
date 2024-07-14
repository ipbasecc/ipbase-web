import { computed, ref } from 'vue'
import { date } from 'quasar'

export function useTimeDiff(val) {
    let time = new Date(val)
    // 传入时间
    let now = new Date() // 当前时间

    let diff = computed(() => now - time) // 时间差，单位是毫秒
    let minutes = computed(() => Number((diff.value / (1000 * 60))).toFixed(0)) // 转换为分钟
    let hours = computed(() => Number(diff.value / (1000 * 60 * 60)).toFixed(1)) // 转换为小时
    let days = computed(() => Number(diff.value / (1000 * 60 * 60 * 24)).toFixed(0)) // 转换为天数
    let weeks = computed(() => Number(diff.value / (1000 * 60 * 60 * 24 * 7)).toFixed(1)) // 转换为周数
    let years = computed(() => Number(diff.value / (1000 * 60 * 60 * 24 * 365)).toFixed(1)) // 转换为年数

    const timediff = ref();
    // watchEffect(() => {
    //     if (minutes.value < 1) {
    //         timediff.value = '刚刚'
    //     } else if (minutes.value >= 1 && minutes.value < 60) {
    //         timediff.value = minutes.value + '分钟前'
    //     } else if (hours.value >= 1 && hours.value < 24) {
    //         timediff.value = hours.value + '小时前'
    //     } else if (days.value >= 1 && days.value < 7) {
    //         timediff.value = days.value + '天前'
    //     } else if (weeks.value >= 1) {
    //         timediff.value = date.formatDate(val, 'MM/DD')
    //     } else if (years.value >= 1) {
    //         timediff.value = date.formatDate(val, 'YYYY/MM/DD')
    //     } else {
    //         timediff.value = date.formatDate(val, 'YYYY/MM/DD')
    //     }
    // });
    if (minutes.value < 1) {
        timediff.value = '刚刚'
        return { timediff, diff }
    } else if (minutes.value >= 1 && minutes.value < 60) {
        timediff.value = minutes.value + '分钟前'
        return { timediff, diff }
    } else if (hours.value >= 1 && hours.value < 24) {
        timediff.value = hours.value + '小时前'
        return { timediff, diff }
    } else if (days.value >= 1 && days.value < 7) {
        timediff.value = days.value + '天前'
        return { timediff, diff }
    } else if (weeks.value >= 1) {
        timediff.value = date.formatDate(val, 'MM/DD')
        return { timediff, diff }
    } else if (years.value >= 1) {
        timediff.value = date.formatDate(val, 'YYYY/MM/DD')
        return { timediff, diff }
    } else {
        timediff.value = date.formatDate(val, 'YYYY/MM/DD')
        return { timediff, diff }
    }
}
