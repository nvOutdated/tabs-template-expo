// app.config.ts
module.exports = ({ config }) => {
  const buildProfile = process.env.EAS_BUILD_PROFILE || 'development';

  const getImagePath = (type) => {
    const env = buildProfile === 'production' ? 'prod' : 'dev';
    return `assets/images/${env}/${type}.png`;
  };

  const iconPath = getImagePath('icon');

  return {
    ...config,
    name: "tabs-component-app",
    icon: iconPath,
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE_NAME || "com.xdd11.tabscomponentapp",
      adaptiveIcon: {
        foregroundImage: iconPath,
        backgroundColor: "#ffffff"
      },
      usesCleartextTraffic: true, // ✅ 明文请求
      networkSecurityConfig: {
        cleartextTrafficPermitted: true,
      }
    },
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.xdd11.tabscomponentapp",
      infoPlist: {
        ...config.ios?.infoPlist,
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
        }
      }
    },
    plugins: [
      ...(config.plugins || []),
      
      // ✅ 插件声明必须在 root 层级
      [
        "expo-build-properties",
        {
          android: {
            kotlinVersion: "1.8.22",
            enableProguardInReleaseBuilds: true,
            enableShrinkResources: true,
            enableR8: true,
            jsEngine: "hermes",
            usesCleartextTraffic: true,
            networkSecurityConfig: {
              cleartextTrafficPermitted: true
            }
          }
        }
      ],

      [
        "expo-splash-screen",
        {
          image: getImagePath('splash-icon'),
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ]
  };
};
