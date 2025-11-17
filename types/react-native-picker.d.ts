declare module '@react-native-picker/picker' {
  import * as React from 'react';
    import { ViewProps } from 'react-native';

  export interface PickerProps extends ViewProps {
    selectedValue?: string | number | null;
    onValueChange?: (itemValue: string | number, itemIndex: number) => void;
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    dropdownIconColor?: string;
    prompt?: string;
  }

  export interface PickerItemProps {
    label?: string;
    value?: string | number | null;
    color?: string;
  }

  export class Picker extends React.Component<PickerProps> {
    static Item: React.ComponentType<PickerItemProps>;
  }
}

