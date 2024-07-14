// 导入 dayjs 库，用于处理日期和时间
import dayjs from 'dayjs'
// 导入 isSameOrBefore 插件，用于判断日期是否相同或之前
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
// 注册插件
dayjs.extend(isSameOrBefore)

// 定义一个函数，接收两个时间戳参数，返回一个字符串
export function getDateLabel (t1, t2) {
  // 将时间戳转换为 dayjs 对象
  const previousDate = dayjs(t1)
  const currentDate = dayjs(t2)
  // 获取当前时间的 dayjs 对象
  const now = dayjs()
  // 定义一个变量，用于存储返回的字符串
  let label = ''
  // 判断是否显示日期的 dom
  if (!currentDate.isSame(previousDate, 'day')) {
    // 如果当前条目与上一条不在同一天
    if (currentDate.isSame(now, 'day')) {
      // 如果当前条目与当前时间在同一天，则显示“今天”
      label = '今天'
    } else if (previousDate.isSame(now.subtract(1, 'day'), 'day')) {
      // 如果上一条与当前时间在前天，则显示“前天”
      label = '前天'
    } else if (previousDate.isSameOrBefore(now.startOf('week'), 'day')) {
      // 如果上一条与当前时间日期差大于3天但在同一周内，则显示“周n”
      label = '周' + previousDate.format('d')
    } else if (previousDate.isSame(now, 'month')) {
      // 如果上一条与当前时间在同一月，则显示“m日”
      label = previousDate.format('D') + '日'
    } else if (previousDate.isSame(now, 'year')) {
      // 如果上一条与当前时间在同一年，则显示“n月m日”
      label = previousDate.format('M月D日')
    } else {
      // 如果上一条与当前时间不在同一年，则显示“x年y月z日”
      label = previousDate.format('YYYY年M月D日')
    }
  }
  // 返回字符串
  return label
}
