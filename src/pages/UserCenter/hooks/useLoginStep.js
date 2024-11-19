import { ref } from 'vue';
import { login as mmLogin } from 'src/api/mattermost';
import { useFetchAvatar } from 'src/pages/Chat/hooks/useFetchAvatar';

export function useLoginStep({ email, password, onSuccess, onError }) {
  const loading = ref(false);

  const initLogin = async () => {
    if (loading.value) return;
    
    loading.value = true;
    try {
      const loginParams = {
        login_id: email,
        password: password
      };

      const res = await mmLogin(loginParams);
      
      if (res?.data) {
        await useFetchAvatar(res.data.id, 'force');
        onSuccess?.();
      } else {
        throw new Error('登录响应无效');
      }
    } catch (error) {
      console.error('Login failed:', error);
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    initLogin
  };
}