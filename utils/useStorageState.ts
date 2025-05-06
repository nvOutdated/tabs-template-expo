import { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 定义一个泛型类型 UseStateHook，用于表示异步状态的类型
// 它是一个数组，第一个元素是一个包含布尔值和泛型类型 T 或 null 的数组
// 第二个元素是一个函数，用于更新状态，接受一个 T 或 null 类型的参数
type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

/**
 * 自定义 Hook，用于创建一个异步状态
 * @param initialValue - 初始状态值，默认为 [true, null]
 * @returns 一个数组，包含状态和更新状态的函数
 */
function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null],): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

// 定义存储键的常量
const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';
const DEFAULT_URL = 'defaultUrl';
/**
 * 异步函数，用于设置存储项
 * @param key - 存储项的键
 * @param value - 存储项的值，如果为 null 则删除该项
 */
async function setStorageItem(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value === null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

/**
 * 异步函数，用于获取存储项
 * @param key - 存储项的键
 * @returns 存储项的值，如果不存在则返回 null
 */
async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    return SecureStore.getItemAsync(key);
  }
}

/**
 * 存储 token 到本地
 * @param token - 要存储的 token
 */
export async function saveToken(token: string | null) {
  await setStorageItem(TOKEN_KEY, token);
}

/**
 * 从本地获取 token
 * @returns 存储的 token，如果不存在则返回 null
 */
export async function getToken(): Promise<string | null> {
  return getStorageItem(TOKEN_KEY);
}

/**
 * 存储用户信息到本地
 * @param userInfo - 要存储的用户信息对象
 */
export async function saveUserInfo(userInfo: any | null) {
  const userInfoString = userInfo ? JSON.stringify(userInfo) : null;
  await setStorageItem(USER_INFO_KEY, userInfoString);
}

/**
 * 从本地获取用户信息
 * @returns 存储的用户信息对象，如果不存在则返回 null
 */
export async function getUserInfo(): Promise<any | null> {
  const userInfoString = await getStorageItem(USER_INFO_KEY);
  return userInfoString ? JSON.parse(userInfoString) : null;
}

/**
 * 自定义 Hook，用于管理存储在本地存储中的 token 状态
 * @returns 一个数组，包含 token 状态和更新 token 的函数
 */
export function useTokenState(): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setState(token);
    };
    fetchToken();
  }, []);

  const setToken = useCallback(
    async (token: string | null) => {
      setState(token);
      await saveToken(token);
    },
    []
  );

  return [state, setToken];
}

/**
 * 自定义 Hook，用于管理存储在本地存储中的用户信息状态
 * @returns 一个数组，包含用户信息状态和更新用户信息的函数
 */
export function useUserInfoState(): UseStateHook<any> {
  const [state, setState] = useAsyncState<any>();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo();
      setState(userInfo);
    };
    fetchUserInfo();
  }, []);

  const setUserInfo = useCallback(
    async (userInfo: any | null) => {
      setState(userInfo);
      await saveUserInfo(userInfo);
    },
    []
  );

  return [state, setUserInfo];
}

export async function getStorageDefaultUrl():Promise<string | null> {
  return await getStorageItem(DEFAULT_URL);
}

export const saveTokenAsyncStorage = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('保存token失败:', error);
  }
};

export const saveUserInfoAsyncStorage = async (userInfo: { name: string; password: string }) => {
  try {
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
  } catch (error) {
    console.error('保存用户信息失败:', error);
  }
};

export const getStoredUserInfoAsyncStorage = async () => {
  try {
    const userInfoString = await AsyncStorage.getItem('userInfo');
    if (userInfoString) {
      return JSON.parse(userInfoString);
    }
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};