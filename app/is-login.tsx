import { LinearGradient } from "@/components/ui/linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import { useAuthStore } from "@/store/auther";
import { DEFAULT_BASE_URL } from "@/constants/defaultConfig";
import { useWebSocketStore } from '@/store/websocketStore';
import { getUserInfo, saveToken, saveUserInfo } from "@/utils/useStorageState";
import { router } from "expo-router";
import { md5 } from "js-md5";
// const md5 = require('md5');
// const default_url = 'http://182.99.177.29:48099'
export default function LoginIndex() {
  const {init}  = useWebSocketStore()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginForm ={
    username: '',
    password: '',
    grant_type: 'password',
    client_id: '6eafe0d2-f2ab-4cdb-b829-6d4555c60b41',
    client_secret: '123456',
  }
  // 创建动画值
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  // 设置翻转动画
  useEffect(() => {
      const animate = () => {
        flipAnimation.setValue(0);
        Animated.timing(flipAnimation, {
          toValue: 1,
          duration: 3000, 
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          // 动画完成后，再次开始
          setTimeout(animate, 3000); 
        });
      };
      // 开始动画
      animate();
      // 组件卸载时清理
      return () => {
        flipAnimation.stopAnimation();
      };
    }
  , []);

  // 设置晃动动画
  useEffect(() => {
    if (loginFailed) {
      // 创建晃动序列
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 动画完成后重置登录失败状态
        setTimeout(() => setLoginFailed(false), 500);
      });
    }
  }, [loginFailed]);
  
  // 计算旋转角度
  const flipInterpolate = flipAnimation.interpolate({
    inputRange: [0, 0],
    outputRange: ['0deg', '360deg'], // 完整旋转一圈
  });

  // 计算晃动位移
  const shakeInterpolate = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10], // 使用数字而不是带px的字符串
  });

  // 从存储中获取保存的用户信息
  useEffect(() => {
    const loadStoredUserInfo = async () => {
      const storedInfo = await getUserInfo();
      if (storedInfo) {
        setUsername(storedInfo.name);
        setPassword(storedInfo.password);
        setRememberPassword(true);
      }
    };
    loadStoredUserInfo();
  }, []);

  const login = async () => {
    if (username === "" || password === "") {
      setLoginFailed(true);
      return;
    }
    setLoginFailed(false);
    
    try {
      loginForm.username = username;
      loginForm.password = md5(password);
      const formBody = Object.keys(loginForm)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(loginForm[key as keyof typeof loginForm]))
        .join('&');
      const response = await fetch(`${DEFAULT_BASE_URL}/smart/auth/token`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
      });
      // const response = await loginApi(loginForm);
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log("响应不是有效的JSON格式");
      }
      
      if (response.ok) {
        // console.log("登录成功");
        if (rememberPassword) {
          await saveUserInfo({name: username, password: password});
        } else {
          await saveUserInfo({name: username, password: ''});
        }
        
        if (responseData && responseData.access_token) {
          await saveToken(responseData.access_token);
        } else {
          await saveToken('tokenKey');
        }
        
        setTimeout(() => {
          router.replace("/(logging-in)/(tabs)/(configuration)/ebox");
        }, 500);
      } else {
        console.log("登录失败",response);
        setLoginFailed(true);
        Alert.alert('登录失败', '用户名或密码错误！');
      }
    } catch (error) {
      console.error("登录请求出错:", error);
      setLoginFailed(true);
      Alert.alert('登录失败', '网络请求错误，请稍后再试！');
    }
  };

  // 在组件顶部添加 ref
  const passwordInputRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      
      <LinearGradient
        style={[styles.gradient, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
        colors={loginFailed ? ["#ff4d4d", "#cc0000"] : ["#0F55A1", "#4ade80"]}
        start={[0, 1]}
        end={[1, 0]}
      >
        <StatusBar
        // backgroundColor={loginFailed ? "#ff4d4d" : "#4ade80"}
        // barStyle="light-content"
         backgroundColor="transparent"
        translucent={true}
      />
        {loginFailed ? (
          <Animated.View 
            style={[
              styles.logoContainerAmzing,
              { transform: [{ translateX: shakeInterpolate }] }
            ]}
          >
            <Image
              source={require("@/assets/images/images/amzing.png")}
              style={styles.logoAmazing}
            />
          </Animated.View>
        ) : (
          <Animated.View 
            style={[
              styles.logoContainer,
              { transform: [{ rotateY: flipInterpolate }] }
            ]}
          >
            <Image
              source={require("@/assets/images/images/qishui.png")}
              style={styles.logo}
            />
          </Animated.View>
        )}
        <View style={styles.card}>
          <Text style={styles.title}>{loginFailed?'Password Warn!':'Welcome Bro'}</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWithIcon}>
              <Icon name="user" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#aaa"
                value={username}
                onChangeText={setUsername}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </View>
            <View style={styles.inputWithIcon}>
              <Icon name="lock" size={20} color="#fff" style={styles.icon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={() => {
                  // 可选：在这里处理登录逻辑
                  // login();
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.rememberContainer}>
              <Switch
                value={rememberPassword}
                onValueChange={setRememberPassword}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={rememberPassword ? "#007AFF" : "#f4f3f4"}
              />
              <Text style={styles.rememberText}>remeber number</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Created By XDD 2025-{new Date().getFullYear()}.</Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 160,
    height: 160,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainerAmzing:{
    width: 240,
    height: 240,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  logoAmazing:{
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  card: {
    borderRadius: 20,
    padding: 25,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  footer: {
    marginTop: 30,
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  rememberText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 10,
  },
});
