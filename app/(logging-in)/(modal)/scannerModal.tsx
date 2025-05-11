import { useScannerStore } from '@/store/scannerStore';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const ScannerModal = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const {setScanResult } = useScannerStore();
  const insets = useSafeAreaInsets();
  
  // 动画值
  const cornerAnimation = useRef(new Animated.Value(0)).current;

  // 动画循环
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(cornerAnimation, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  useEffect(() => {
    setScanResult('');
  }, []);
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
        enableTorch={torch}
        flash={torch ? 'auto' : 'off'}
      >
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          {/* 移除顶部返回按钮 */}
          
          {/* 扫描框和动画角 */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              {/* 左上角 */}
              <Animated.View style={[styles.corner, styles.topLeft, { opacity: cornerAnimation }]} />
              {/* 右上角 */}
              <Animated.View style={[styles.corner, styles.topRight, { opacity: cornerAnimation }]} />
              {/* 左下角 */}
              <Animated.View style={[styles.corner, styles.bottomLeft, { opacity: cornerAnimation }]} />
              {/* 右下角 */}
              <Animated.View style={[styles.corner, styles.bottomRight, { opacity: cornerAnimation }]} />
            </View>
            <Text style={styles.text}>请将二维码对准扫描框</Text>
          </View>

          {/* 底部按钮区域 */}
          <View style={styles.bottomControls}>
            <Pressable style={styles.controlButton} onPress={() => setTorch(!torch)}>
              <Ionicons name={torch ? "flash" : "flash-off"} size={48} color="white" />
              <Text style={styles.buttonText}>{torch ? "关闭闪光灯" : "打开闪光灯"}</Text>
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => router.back()}>
              <Ionicons name="close" size={48} color="white" />
              <Text style={styles.buttonText}>关闭</Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  camera: { 
    width: '100%', 
    height: '100%',
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  text: { 
    color: 'white', 
    fontSize: 16, 
    marginTop: 20,
    textAlign: 'center',
  },
  message: { 
    color: '#333', 
    fontSize: 16, 
    margin: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    // marginHorizontal: 10,
    // backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
});

export default ScannerModal;
