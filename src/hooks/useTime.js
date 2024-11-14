import { ref } from 'vue';
import { date } from "quasar";

let timer; // 用于存储定时器的变量
export function $time(_formate) {
    if (timer) {
      clearInterval(timer);
    }
    const curTime = ref(date.formatDate(Date.now(), _formate)); // 假设 date.formatDate 是一个格式化日期的函数

    timer = setInterval(() => {
        curTime.value = date.formatDate(Date.now(), _formate);
    }, 1000);
    return curTime;
}
export function clearTimer () {
    if (timer) {
        clearInterval(timer);
    }
}