import { useScannerStore } from '@/store/scannerStore';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
const ScannerModal = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const {setScanResult } = useScannerStore();
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
    // console.log('扫码内容:', result.data);
    setScanResult(result.data);
    router.back();
  };
 
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.text}>请将二维码对准扫描框</Text>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '100%',backgroundColor:"rgba(0,0,0,0.5)" },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: 'white',
    // backgroundColor: 'transparent',
  },
  text: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  message: { color: '#333', fontSize: 16, margin: 10 }
});

export default ScannerModal;
