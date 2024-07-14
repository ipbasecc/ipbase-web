<template>
    <div v-if="result && day1 != day2" class="border-top flex-center row text-grey op-5" :class="$q.dark.mode ? '' : ''">
      <span class="absolute q-px-lg radius-lg" :class="$q.dark.mode ? 'bg-grey-10 text-grey-5' : 'bg-grey-4 text-grey-7'">
        {{ result }}
      </span>
    </div>
  </template>
  
<script setup>
  import { computed, toRef } from 'vue';
  import { date } from 'quasar';

  const props = defineProps({
    t1: {
        type: Number,
        default: NaN
    },
    t2: {
        type: Number,
        default: NaN
    }
  })
  const t1Ref = toRef(props,'t1');
  const t2Ref = toRef(props,'t2');
  const ONE_DAY = 1000 * 60 * 60 * 24
  function isSameWeek(d1, d2) {
      const difftime = Math.abs(d2 - d1)
      let bigDay = (d1 > d2 ? d1.getDay() : d2.getDay()) || 7
      let smallDay = (d1 < d2 ? d1.getDay() : d2.getDay()) || 7
      return !(difftime >= ONE_DAY * 7 || bigDay < smallDay || (bigDay === smallDay && difftime > ONE_DAY))
  }
  const now = new Date();
  const day1 = date.formatDate(t1Ref.value, 'YYYY-MM-DD');
  const day2 = date.formatDate(t2Ref.value, 'YYYY-MM-DD');
  const daynow = date.formatDate(now, 'YYYY-MM-DD');
  const result = computed(() => {
    // 将时间戳转换为Date对象
    const d1 = new Date(t1Ref.value);
    const d2 = new Date(t2Ref.value);


    // 判断两个时间戳是否在同一天
    if (day1 === day2) {
        return false; // 如果在同一天，返回false
    } else {
      // 使用第二个参数的时间继续判断
      const d = d2;

      // 判断第二个参数的时间与当前时间是否在同一天
      if (d.toDateString() === now.toDateString()) {
          return "今天"; // 如果在同一天，返回"今天"
      }

      // 判断第二个参数的时间与当前时间是否相差一天
      if (now - d === 24 * 60 * 60 * 1000) {
          return "昨天"; // 如果相差一天，返回"昨天"
      }

      // 判断第二个参数的时间与当前时间是否相差两天
      if (now - d === 48 * 60 * 60 * 1000) {
          return "前天"; // 如果相差两天，返回"前天"
      }

      // 判断第二个参数的时间与当前时间是否处于同一周
      if (now.getDay() > d.getDay() && isSameWeek(d1,d2)) {
          // 获取星期几的汉字表示
          const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
          const weekday = weekdays[d.getDay()];
          return `周${weekday}`; // 如果处于同一周，返回"周*"
      } else if(now.getFullYear() === d.getFullYear()) {
        return `${d.getMonth() + 1}月${d.getDate()}日`; 
      } else {
        return `${d.getFullYear()}年`; // 如果不处于同一年，返回"**年"
      }      
    }
    });
  </script>
  