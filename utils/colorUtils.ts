import { useTheme } from '@react-navigation/native';
import { ColorMappings } from '../constants/colorMappings';

export const useColor = () => {
  const { dark } = useTheme();
  const theme = dark ? 'dark' : 'light';

  const getColor = (path: string) => {
    const parts = path.split('.');
    let current: any = ColorMappings[theme];

    for (const part of parts) {
      if (current[part] === undefined) {
        console.warn(`Color path "${path}" not found in theme "${theme}"`);
        return undefined;
      }
      current = current[part];
    }

    return current;
  };

  return {
    getColor,
  };
}; 