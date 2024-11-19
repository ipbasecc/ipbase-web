export function useFormRules() {
    return {
      username: [
        val => !!val || '用户名不能为空',
        val => val.length >= 3 || '用户名至少3个字符',
        val => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(val) || '用户名必须以字母开头，只能包含字母、数字和下划线'
      ],
      email: [
        val => !!val || '邮箱不能为空',
        val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '请输入有效的邮箱地址'
      ],
      password: [
        val => !!val || '密码不能为空',
        val => val.length >= 8 || '密码至少8个字符',
        val => /[A-Z]/.test(val) || '密码必须包含大写字母',
        val => /[a-z]/.test(val) || '密码必须包含小写字母',
        val => /[0-9]/.test(val) || '密码必须包含数字',
        val => /[!@#$%^&*]/.test(val) || '密码必须包含特殊字符'
      ]
    };
  }