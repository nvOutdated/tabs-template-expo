import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ScannerComponentProps {
  onScanResult: (result: { data: string; type: string }) => void;
}

const ScannerComponent: React.FC<ScannerComponentProps> = ({ onScanResult }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>需要相机权限用于扫码</Text>
        <Text style={styles.message} onPress={requestPermission}>点击授权</Text>
      </View>
    );
  }

  const handleBarCodeScanned = (result: { data: string; type: string }) => {
    setScanned(true);
    console.log('扫码内容:', result.data);
    onScanResult(result);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'], // 可根据需要添加类型
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>请将二维码对准扫描框</Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  text: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  message: { color: '#333', fontSize: 16, margin: 10 }
});

export default ScannerComponent;
