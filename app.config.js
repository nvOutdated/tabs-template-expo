// app.config.js - 性能优化版本
module.exports = ({ config }) => {
  const buildProfile = process.env.EAS_BUILD_PROFILE || 'development';
  const isProduction = buildProfile === 'production';

  const getImagePath = (type) => {
    const env = isProduction ? 'prod' : 'dev';
    return `assets/images/${env}/${type}.png`;
  };

  const iconPath = getImagePath('icon');

  return {
    ...config,
    name: "xddApp",
    icon: iconPath,
    
    // 🚀 性能优化配置
    newArchEnabled: true, // 新架构
    jsEngine: "hermes", // Hermes引擎
    
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE_NAME || "com.xdd123.xddApp",
      
      // 🎯 图标配置
      adaptiveIcon: {
        foregroundImage: iconPath,
        backgroundColor: "#ffffff"
      },
      
      // 🌐 网络配置
      usesCleartextTraffic: true,
      networkSecurityConfig: {
        cleartextTrafficPermitted: true,
      },
      
      // ⚡ 性能关键配置
      jsEngine: "hermes",
      enableHermes: true,
      
      // 🏗️ 构建优化
      enableProguardInReleaseBuilds: isProduction,
      enableShrinkResources: isProduction,
      enableR8: isProduction,
      
      // 📦 APK分包 - 减小下载体积
      enableSeparateBuildPerCPUArchitecture: isProduction,
      
      // 🎯 目标架构优化
      ...(isProduction && {
        architectures: ["arm64-v8a", "armeabi-v7a"], // 只构建主流架构
      }),
      
      // 🚀 实验性优化
      enableDangerousExperimentalLeanBuilds: isProduction,
      
      // 📱 渲染优化
      edgeToEdgeEnabled: true,
      
      // 🎨 主题配置
      theme: "@android:style/Theme.NoTitleBar.Fullscreen"
    },
    
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.xdd123.xddApp",
      
      // 🚀 iOS性能配置
      jsEngine: "hermes",
      bitcode: false, // 已正确禁用
      
      // 🔧 编译配置
      ...(isProduction && {
        buildConfiguration: "Release"
      }),
      
      infoPlist: {
        ...config.ios?.infoPlist,
        
        // 🌐 网络安全配置
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSAllowsArbitraryLoadsInWebContent: true,
          NSAllowsLocalNetworking: true,
          NSExceptionDomains: {
            "*": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            }
          }
        },
        
        // 📱 界面优化
        UIViewControllerBasedStatusBarAppearance: false,
        UIStatusBarHidden: false,
        UILaunchStoryboardName: "SplashScreen"
      }
    },
    
    // 🌐 Web配置优化
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    
    plugins: [
      ...(config.plugins || []),
      
      // 🏗️ 构建属性插件
      [
        "expo-build-properties",
        {
          android: {
            // Hermes配置
            jsEngine: "hermes",
            enableHermes: true,
            hermesCommand: "hermes", // 确保使用正确的Hermes命令
            
            // 构建优化
            enableProguardInReleaseBuilds: isProduction,
            enableShrinkResources: isProduction,
            enableR8: isProduction,
            
            // 网络配置
            usesCleartextTraffic: true,
            networkSecurityConfig: {
              cleartextTrafficPermitted: true
            },
            
            // NDK优化
            ...(isProduction && {
              abiFilters: ["arm64-v8a", "armeabi-v7a"]
            }),
            
            // 内存优化
            largeHeap: true,
            
            // 多dex支持
            multiDexEnabled: true
          },
          
          ios: {
            jsEngine: "hermes",
            
          }
        }
      ],

      // 🎨 启动屏配置
      [
        "expo-splash-screen",
        {
          image: getImagePath('splash-icon'),
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    
    // 🔧 Metro配置
    resolver: {
      alias: {
        // 路径别名，减少打包体积
        "react-native-vector-icons": "react-native-vector-icons/dist"
      }
    },
    
    // ⚡ 实验性功能
    experiments: {
      typedRoutes: true
    },
    
    // 🚀 额外优化配置
    extra: {
      ...config.extra,
      enableDevTools: !isProduction, // 生产环境禁用开发工具
      
      // 性能监控
      enablePerformanceMonitoring: isProduction
    }
  };
};