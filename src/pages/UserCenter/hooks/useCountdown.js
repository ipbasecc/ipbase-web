import { ref, onUnmounted } from "vue";

/**
 * 倒计时钩子函数
 * @param {Object} options 配置选项
 * @param {number} [options.initialCount=2] 初始倒计时秒数
 * @param {number} [options.interval=1000] 倒计时间隔(毫秒)
 * @param {Function} [options.onComplete] 倒计时完成回调
 * @returns {Object} 倒计时控制对象
 */
export function useCountdown(options = {}) {
  const { initialCount = 2, interval = 1000, onComplete } = options;

  const count = ref(null);
  let timer = null;

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startCountdown = (seconds = initialCount) => {
    clearTimer();
    count.value = seconds;

    timer = setInterval(() => {
      if (count.value !== null) {
        count.value--;

        if (count.value <= 0) {
          clearTimer();
          onComplete?.();
        }
      }
    }, interval);
  };

  const stopCountdown = () => {
    clearTimer();
    count.value = null;
  };

  onUnmounted(() => {
    clearTimer();
  });

  return {
    count,
    startCountdown,
    stopCountdown,
    clearTimer,
  };
}
