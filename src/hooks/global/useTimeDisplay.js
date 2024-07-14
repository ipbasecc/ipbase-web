// 定义一个函数，接受一个时间戳作为参数，返回一个字符串表示时间显示

export function useTimeDisplay(time) {
  // 获取当前时间戳
  let now = Date.now();
  // 计算时间差，单位为毫秒
  let diff = now - time;
  // 定义一个变量，存储时间显示的结果
  let result = "";
  // 判断时间差是否小于1分钟
  if (diff < 60 * 1000) {
    // 返回文本“刚刚”
    result = "刚刚";
  } else if (diff < 60 * 60 * 1000) {
    // 计算时间差的分钟数，向下取整
    let minutes = Math.floor(diff / (60 * 1000));
    // 返回文本“**分钟前”
    result = minutes + "分钟前";
  } else {
    // 创建一个Date对象，根据时间戳获取年月日时分
    let date = new Date(time);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    // 判断时间是否在今天
    if (date.toDateString() === new Date().toDateString()) {
      // 返回文本“*点*分”
      result = hour + "点" + minute + "分";
    } else {
      // 判断时间是否在昨天
      if (
        date.toDateString() ===
        new Date(now - 24 * 60 * 60 * 1000).toDateString()
      ) {
        // 返回文本“昨天”
        result = "昨天";
      } else {
        // 判断时间是否在前天
        if (
          date.toDateString() ===
          new Date(now - 48 * 60 * 60 * 1000).toDateString()
        ) {
          // 返回文本“前天”
          result = "前天";
        } else {
          // 判断时间差是否大于等于3天且小于7天
          if (
            diff >= 3 * 24 * 60 * 60 * 1000 &&
            diff < 7 * 24 * 60 * 60 * 1000
          ) {
            // 计算时间差的天数，向下取整
            let days = Math.floor(diff / (24 * 60 * 60 * 1000));
            // 返回文本“*天前”
            result = days + "天前";
          } else {
            // 判断时间是否在本月
            if (month === new Date().getMonth() + 1) {
              // 返回文本“*日”
              result = day + "日";
            } else {
              // 判断时间是否在今年
              if (year === new Date().getFullYear()) {
                // 返回文本“*月*日”
                result = month + "月" + day + "日";
              } else {
                // 返回文本“*年*月*日”
                result = year + "年" + month + "月" + day + "日";
              }
            }
          }
        }
      }
    }
  }
  // 返回结果
  return result;
}
