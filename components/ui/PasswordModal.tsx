import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type PasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  loading?: boolean;
};

export default function PasswordModal({
  visible,
  onClose,
  onConfirm,
  title = "请输入操作密码",
  loading = false,
}: PasswordModalProps) {
  const currentTheme = useCurrentTheme();
  const [password, setPassword] = useState("");

  const handleConfirm = useCallback(() => {
    if (password.trim()) {
      onConfirm(password);
      setPassword("");
    }
  }, [password, onConfirm]);

  const handleClose = useCallback(() => {
    setPassword("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: currentTheme.drawerBg }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.textColor }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={currentTheme.textColor}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <TextInput
              style={[
                styles.input,
                { 
                  color: currentTheme.textColor,
                  backgroundColor: currentTheme.headerBg,
                }
              ]}
              placeholder="请输入密码"
              placeholderTextColor={currentTheme.textColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
            />
          </View>
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>
                取消
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: currentTheme.textColor },
                loading && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={loading || !password.trim()}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {loading ? "确认中..." : "确认"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  input: {
    height: 40,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
  },
  confirmButton: {
    backgroundColor: "#409EFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
}); 