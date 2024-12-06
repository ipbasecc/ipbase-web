import { ref } from 'vue';

/**
 * 错误处理钩子函数
 * @param {Object} $q Quasar全局对象
 * @param {Object} options 配置选项
 * @param {Object} [options.messages] 自定义错误消息
 * @param {string} [options.defaultMessage] 默认错误消息
 * @param {boolean} [options.showNotification] 是否显示通知
 * @param {Function} [options.onError] 错误处理回调
 * @returns {Object} 错误处理对象
 */
export function useErrorHandler($q, options = {}) {
  const {
    messages = {},
    defaultMessage = '操作失败，请稍后重试',
    showNotification = true,
    onError
  } = options;

  const error = ref(null);
  const errorMessage = ref('');

  const defaultErrorMessages = {
    ValidationError: '输入验证失败',
    NetworkError: '网络连接失败',
    AuthError: '认证失败',
    ServerError: '服务器错误',
    EmailExistsError: '该邮箱已被注册',
    UsernameExistsError: '该用户名已被使用',
    PasswordMismatchError: '两次输入的密码不一致',
    WeakPasswordError: '密码强度不足',
    ...messages
  };

  const getErrorMessage = (err) => {
    // 处理特定类型的错误
    if (err.name in defaultErrorMessages) {
      return defaultErrorMessages[err.name];
    }

    // 处理 API 错误
    if (err.response?.data?.error?.message) {
      return err.response.data.error.message;
    }

    // 处理特定的错误码
    if (err.code) {
      switch (err.code) {
        case 'ERR_NETWORK':
          return '网络连接失败，请检查网络设置';
        case 'ERR_BAD_REQUEST':
          return '请求参数错误';
        case 'ERR_SERVER':
          return '服务器错误，请稍后重试';
        default:
          return err.message || defaultMessage;
      }
    }

    return err.message || defaultMessage;
  };

  const handleError = (err) => {
    console.log('handleError', err);
    error.value = err;
    errorMessage.value = getErrorMessage(err);

    // 显示通知
    if (showNotification) {
      $q.notify({
        type: 'negative',
        message: errorMessage.value,
        position: 'top',
        timeout: 3000,
        actions: [
          { label: '关闭', color: 'white' }
        ]
      });
    }

    // 调用自定义错误处理函数
    onError?.(err);

    // 记录错误日志
    console.error('Error occurred:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      response: err.response
    });
  };

  const clearError = () => {
    error.value = null;
    errorMessage.value = '';
  };

  /**
   * 创建特定类型的错误
   * @param {string} type 错误类型
   * @param {string} [message] 错误消息
   * @returns {Error} 错误对象
   */
  const createError = (type, message) => {
    const err = new Error(message || defaultErrorMessages[type]);
    err.name = type;
    return err;
  };

  return {
    error,
    errorMessage,
    handleError,
    clearError,
    createError
  };
}