// 定义一个函数，接受一个时间戳作为参数

export function getTimeDiffNow(time) {
  // 获取当前时间的时间戳
  let now = Date.now();
  // 计算当前时间与time的差距，单位为毫秒
  let time_range = now - time;
  // 创建一个Date对象，用于获取time的日期信息
  let date = new Date(time);
  // 获取time的年份
  let year = date.getFullYear();
  // 获取time的月份，从0开始，所以要加1
  let month = date.getMonth() + 1;
  // 获取time的日期
  let day = date.getDate();
  // 创建一个Date对象，用于获取当前日期信息
  let today = new Date();
  // 获取当前年份
  let current_year = today.getFullYear();
  // 获取当前月份
  let current_month = today.getMonth() + 1;
  // 获取当前日期
  let current_day = today.getDate();
  // 计算当前日期与time的日期差距，单位为天
  let date_range =
    Math.floor(
      (now - new Date(current_year, current_month - 1, current_day)) /
        (1000 * 60 * 60 * 24)
    ) -
    Math.floor((time - new Date(year, month - 1, day)) / (1000 * 60 * 60 * 24));

  // 定义一个变量，用于存储返回的文本
  let text = "";

  // 根据date_range的值，判断返回的文本
  if (date_range === 1) {
    // 如果date_range等于1，表示time是昨天
    text = "昨天";
  } else if (date_range === 2) {
    // 如果date_range等于2，表示time是前天
    text = "前天";
  } else if (date_range > 2) {
    // 如果date_range大于2，表示time是更早的日期
    if (year === current_year) {
      // 如果time与当前时间在同一年，返回月/日的格式
      text = month + "月" + day + "日";
    } else {
      // 如果time与当前时间不在同一年，返回年/月/日的格式
      text = year + "年" + month + "月" + day + "日";
    }

    return text; // 返回文本，不需要继续判断time_range
  }

  // 如果date_range小于1，表示time是今天，那么根据time_range的值，继续判断返回的文本

  // 将time_range转化为秒，并取整数部分
  let seconds = Math.floor(time_range / 1000);
  // 将seconds转化为分钟，并取整数部分
  let minutes = Math.floor(seconds / 60);
  // 将minutes转化为小时，并取整数部分
  let hours = Math.floor(minutes / 60);

  if (hours > 0) {
    // 如果hours大于0，表示time距离当前时间超过了1小时，返回小时和分钟的格式
    text = hours + "小时" + (minutes % 60) + "分钟前";
  } else if (minutes > 0) {
    // 如果minutes大于0，表示time距离当前时间超过了1分钟，返回分钟的格式
    text = minutes + "分钟前";
  } else {
    // 如果minutes等于0，表示time距离当前时间不到1分钟，返回刚刚
    text = "刚刚";
  }

  return text; // 返回文本

  // 定义一个函数，接受一个时间戳作为参数
  function getTimeDiff(time) {
    // 获取当前时间的时间戳
    let now = Date.now();
    // 计算当前时间与time的差距，单位为毫秒
    let time_range = now - time;
    // 创建一个Date对象，用于获取time的日期信息
    let date = new Date(time);
    // 获取time的年份
    let year = date.getFullYear();
    // 创建一个Date对象，用于获取当前日期信息
    let today = new Date();
    // 获取当前年份
    let current_year = today.getFullYear();
    // 计算当前日期与time的日期差距，单位为天
    let date_range =
      Math.floor((now - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)) -
      Math.floor((time - date.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));

    // 定义一个变量，用于存储返回的文本
    let text = "";

    // 根据date_range的值，判断返回的文本
    if (date_range === 1) {
      // 如果date_range等于1，表示time是昨天，返回昨天和time的时间的格式
      text = "昨天 " + date.toLocaleTimeString();
    } else if (date_range === 2) {
      // 如果date_range等于2，表示time是前天，返回前天和time的时间的格式
      text = "前天 " + date.toLocaleTimeString();
    } else if (date_range > 2) {
      // 如果date_range大于2，表示time是更早的日期
      if (year === current_year) {
        // 如果time与当前时间在同一年，返回月/日和time的时间的格式
        text =
          date.toLocaleDateString(undefined, {
            month: "numeric",
            day: "numeric",
          }) +
          " " +
          date.toLocaleTimeString();
      } else {
        // 如果time与当前时间不在同一年，返回年/月/日和time的时间的格式
        text = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      }

      return text; // 返回文本，不需要继续判断time_range
    }

    // 如果date_range小于1，表示time是今天，那么根据time_range的值，继续判断返回的文本

    // 将time_range转化为秒，并取整数部分
    let seconds = Math.floor(time_range / 1000);

    if (seconds < 60) {
      // 如果seconds小于60，表示time距离当前时间不到1分钟，返回刚刚
      text = "刚刚";
    } else {
      // 如果seconds大于等于60，表示time距离当前时间超过了1分钟，返回time的时间的格式
      text = date.toLocaleTimeString();
    }

    return text; // 返回文本
  }
}

// 定义一个函数，接受两个时间戳作为参数
export function getTimeDiff(time1, time2) {
    // 计算time1与time2的差距，单位为毫秒
    let time_range = Math.abs(time1 - time2);
    // 创建一个Date对象，用于获取time1的日期信息
    let date1 = new Date(time1);
    // 获取time1的年份
    let year1 = date1.getFullYear();
    // 获取time1的月份，从0开始，所以要加1
    let month1 = date1.getMonth() + 1;
    // 获取time1的日期
    let day1 = date1.getDate();
    // 创建一个Date对象，用于获取time2的日期信息
    let date2 = new Date(time2);
    // 获取time2的年份
    let year2 = date2.getFullYear();
    // 获取time2的月份
    let month2 = date2.getMonth() + 1;
    // 获取time2的日期
    let day2 = date2.getDate();

    // 计算time1与time2的日期差距，单位为天
    let date_range = Math.floor((time1 - new Date(year1, month1 - 1, day1)) / (1000 * 60 * 60 * 24)) - Math.floor((time2 - new Date(year2, month2 - 1, day2)) / (1000 * 60 * 60 * 24));

    // 定义一个变量，用于存储返回的文本
    let text = "";

    // 根据date_range的值，判断返回的文本
    if (date_range >= 1) {
      // 如果date_range大于等于1，表示time1和time2不在同一天
      if (year1 === year2) {
        // 如果time1和time2在同一年，返回月/日的格式
        text = month1 + "月" + day1 + "日" + " 和 " + month2 + "月" + day2 + "日";
      } else {
        // 如果time1和time2不在同一年，返回年/月/日的格式
        text = year1 + "年" + month1 + "月" + day1 + "日" + " 和 " + year2 + "年" + month2 + "月" + day2 + "日";
      }

      return text; // 返回文本，不需要继续判断time_range
    }

    // 如果date_range小于等于0，表示time1和time2在同一天，那么根据time_range的值，继续判断返回的文本



// 将time_range转化为秒，并取整数部分
let seconds = Math.floor(time_range / 1000);
// 将seconds转化为分钟，并取整数部分
let minutes = Math.floor(seconds / 60);
// 将minutes转化为小时，并取整数部分
let hours = Math.floor(minutes / 60);

if (hours >= 1) {
   // 如果hours大于等于1，表示time_range超过了一小时，返回小时的格式
   text = hours + "小时前";
} else if (minutes > 30) {
   // 如果minutes大于30，表示time_range超过了半小时，返回半小时前
   text = "半小时前";
} else if (minutes > 0) {
   // 如果minutes大于0，表示time_range超过了一分钟，返回分钟的格式
   text = minutes + "分钟前";
} else {
   // 如果minutes等于0，表示time_range不到一分钟，返回刚刚
   text = "刚刚";
}

return text; // 返回文本

}
