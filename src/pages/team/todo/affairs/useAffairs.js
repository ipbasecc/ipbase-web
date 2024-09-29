
import { ref, watchEffect } from "vue";
import {teamStore, userStore} from 'src/hooks/global/useStore';
import { getRandomInt } from 'src/hooks/utilits.js'

export const todogroups = ref();
watchEffect(() => {
  if(userStore.affairsFilterIDs?.length > 0){
    const all_ids = teamStore.init?.todogroups.map(i => i.id);
    userStore.affairsFilterIDs = userStore.affairsFilterIDs?.filter(i => all_ids.includes(i));
    if(userStore.affairsFilterIDs.length > 0){
      todogroups.value = userStore.affairsFilterIDs.map(i => teamStore.init.todogroups.find(j => j.id === i))
    }
  } else {
    todogroups.value = teamStore.init?.todogroups
  }
})

export function useChartData(_todogroups) {
  const todos = _todogroups?.map(i => i.todos).flat(2);
  
  if(!todos || todos.length === 0) return;
  // 转换eCharts需要的数据
  function transform(arr, props) {
    // 创建一个空数组，用于存放结果
    let result = [];
    // 遍历原数组的每个元素
    for (let item of arr) {
      // 创建一个空数组，用于存放保留的值
      let values = [];
      for (let i = 0; i < props.length; i++) {
        // 获取当前属性
        let prop = props[i];
        // 如果原数组的元素有该属性，就将其值放入新数组中
        if (item.hasOwnProperty(prop)) {
          // 如果属性是urgency或importance，且值为空，则随机生成一个5-45之间的整数值
          if((prop === 'urgency' || prop === 'importance') && !item[prop]){
            item[prop] = getRandomInt(5, 45)
          }
          values.push(item[prop]);
        }
      }
      // 将新数组放入结果数组中
      result.push(values);
    }
    // 返回结果数组
    return result;
  }
  let props = [
    "urgency",
    "importance",
    "content",
    "jsonContent", // 组件中数据结构已经固定，这里需要保留这个字段
    "id",
    "type",
    "score", // 组件中数据结构已经固定，这里需要保留这个字段
  ];
  return transform(todos, props);
}