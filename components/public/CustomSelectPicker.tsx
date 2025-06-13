import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/components/ui/select";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface CustomSelectPickerProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  initialLabel: string;
}

export default function CustomSelectPicker({
  options,
  value,
  placeholder = "请选择",
  onChange,
  disabled = false,
  className = "",
  initialLabel,
}: CustomSelectPickerProps) {
  return (
    <Select
      className={`w-full ${className}`}
      isDisabled={disabled}
      onValueChange={onChange}
      defaultValue={value}
      initialLabel={initialLabel}
    >
      <SelectTrigger
        variant="outline"
        size="md"
        className="flex-1 justify-between px-1 h-12 bg-white border border-outline-100 rounded-lg"
      >
        <SelectInput placeholder={placeholder} />
        <Ionicons name="chevron-down" size={20} color="#666" />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              label={option.label}
              value={option.value}
              isDisabled={option.disabled}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
/* 
Example
*/

/* 
 <CustomSelectPicker
              options={gatewayTypes}
              value={formData.device_type}
              initialLabel={'集中控制器'}
              onChange={(value) =>
                setFormData({ ...formData, device_type: value })
              }
              placeholder="请选择网关类型"
 />
*/
