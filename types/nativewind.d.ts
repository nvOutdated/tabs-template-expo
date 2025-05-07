import 'nativewind';

declare module 'nativewind' {
  export interface ColorSchemeType {
    blue: string;
    yellow: string;
    pink: string;
    green: string;
  }
  
  export interface UseColorScheme {
    colorScheme: 'light' | 'dark' | 'system' | 'blue' | 'yellow' | 'pink' | 'green';
    setColorScheme: (colorScheme: 'light' | 'dark' | 'system' | 'blue' | 'yellow' | 'pink' | 'green') => void;
  }
}