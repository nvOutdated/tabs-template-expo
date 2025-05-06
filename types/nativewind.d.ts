import 'nativewind';

declare module 'nativewind' {
  export interface ColorSchemeType {
    blue: string;
  }
  
  export interface UseColorScheme {
    colorScheme: 'light' | 'dark' | 'system' | 'blue';
    setColorScheme: (colorScheme: 'light' | 'dark' | 'system' | 'blue') => void;
  }
}