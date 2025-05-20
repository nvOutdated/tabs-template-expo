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
  const { login } = useAuthStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        console.log(token,"token");
        
        if (token) {
          login(token);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('登录状态检查失败'));
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [login]);

  return { isLoggedIn, isLoading, error };
}