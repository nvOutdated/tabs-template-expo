import { LinearGradient } from "@/components/ui/linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
// import { useAuthStore } from "@/store/auther";
import { useCustomToast } from "@/components/public/UIComponents/ToastComponent";
import { getCurrentBaseUrl } from "@/store/globalStateStore";
import { getUserInfo, saveToken, saveUserInfo } from "@/utils/useStorageState";
import { router } from "expo-router";
import { md5 } from "js-md5";
const kabuda = require("@/assets/images/images/kabuda.png")
const sharkHot = require("@/assets/images/images/sharkHot.png")
// const md5 = require('md5');
// const default_url = 'http://182.99.177.29:48099'
export default function LoginIndex() {
  // const {init}  = useWebSocketStore()
  const {showError} = useCustomToast()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [iskabuda,setIskabuda] = useState<boolean>(true)
  const DEFAULT_BASE_URL = getCurrentBaseUrl()  
  const loginForm ={
    username: '',
    password: '',
    grant_type: 'password',
    client_id: '6eafe0d2-f2ab-4cdb-b829-6d4555c60b41',
    client_secret: '123456',
  }
  // 替换原来的动画实现
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 6000,
        easing: Easing.linear,
      }),
      -1, // 无限循环
      false // 不反向
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

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

      console.log('Login attempt with URL:', `${DEFAULT_BASE_URL}/smart/auth/token`);
      
      const response = await fetch(`${DEFAULT_BASE_URL}/smart/auth/token`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: formBody
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // console.error("Failed to parse response:", e);
        showError({
          title: '登录失败',
          message: '服务器响应格式错误'
        });
        return;
      }
      
      if (response.ok) {
        if (rememberPassword) {
          await saveUserInfo({name: username, password: password});
        } else {
          await saveUserInfo({name: username, password: ''});
        }
        
        if (responseData && responseData.access_token) {
          await saveToken(responseData.access_token);
          console.log("Login successful, token saved");
          
          setTimeout(() => {
            router.replace("/(logging-in)/(tabs)/(devices)/ebox");
          }, 500);
        } else {
          // console.error("No access token in response:", responseData);
          showError({
            title: '登录失败',
            message: '服务器响应缺少必要信息'
          });
        }
      } else {
        const errorMessage = responseData?.error_description || responseData?.error || '用户名或密码错误';
        // console.error("Login failed:", errorMessage);
        showError({
          title: '登录失败',
          message: errorMessage
        });
        setLoginFailed(true);
      }
    } catch (error) {
      console.error("Login request error:", error);
      setLoginFailed(true);
      showError({
        title: '登录失败',
        message: `网络请求错误，请检查网络连接或稍后再试${DEFAULT_BASE_URL},${error}`
      });
    }
  };

  // 在组件顶部添加 ref
  const passwordInputRef = useRef<TextInput>(null);

  const handleLongPressLogo = () => {
    router.push('/change-ip');
  };
  const handleChangeImage = ()=>{
   const changeiIskabuda = !iskabuda
   setIskabuda(changeiIskabuda)
   
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      
      <LinearGradient
        style={[styles.gradient, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
        colors={iskabuda?["#0F55A1", "#4ade80"]:['#EC407A','#7B1FA2']}
        start={[0, 1]}
        end={[1, 0]}
      >
        <StatusBar
        // backgroundColor={loginFailed ? "#ff4d4d" : "#4ade80"}
        // barStyle="light-content"
         backgroundColor="transparent"
        translucent={true}
      />
        <TouchableOpacity
          onLongPress={handleLongPressLogo}
          onPress={handleChangeImage}
          delayLongPress={2000}
          activeOpacity={0.7}
        >
          {/* <Animated.View 
            style={[
              styles.logoContainer,
              animatedStyle
            ]}
          >
            <Image
              source={iskabuda?kabuda:sharkHot}
              style={styles.logo}
            />
          </Animated.View> */}
          <View style={styles.logoContainer}>
           <Image
              source={iskabuda?kabuda:sharkHot}
              style={styles.logo}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Bro</Text>
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
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
