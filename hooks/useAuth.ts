import { useAuthStore } from '@/store/autherStore';
import { getToken } from '@/utils/useStorageState';
import { useEffect, useState } from 'react';

interface UseAuthResult {
  isLoggedIn: boolean | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthResult {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { login, logout, token: storeToken } = useAuthStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
        // 如果本地存储有token，但store中没有，说明是重新加载的情况
        if (token && token !== 'tokenKey' && !storeToken) {
          login(token);
          setIsLoggedIn(true);
        } 
        // 如果本地存储和store中都有token，说明是正常登录状态
        else if (token && token !== 'tokenKey' && storeToken) {
          setIsLoggedIn(true);
        }
        // 如果本地存储没有token，说明是未登录状态
        else {
          logout();
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Login status check failed:', err);
        setError(err instanceof Error ? err : new Error('登录状态检查失败'));
        logout();
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [login, logout, storeToken]);

  return { isLoggedIn, isLoading, error };
}