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
        networkSecurityConfig: {
          cleartextTrafficPermitted: true,
          securityConfig: {
            trustAnchors: {
              certificates: ["system", "user"]
            },
            domainConfigs: {
              cleartextPermitted: true,
              trustAnchors: {
                certificates: ["system", "user"]
              }
            }
          }
        },
        usesCleartextTraffic: true,
        enableProguardInReleaseBuilds: true,
        enableShrinkResources: true,
        enableR8: true,
        jsEngine: "hermes",
        enableHermes: true
      },
      ios: {
        ...config.ios,
        bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.xdd11.tabscomponentapp",
        infoPlist: {
          ...config.ios?.infoPlist,
          NSAppTransportSecurity: {
            NSAllowsArbitraryLoads: true,
            NSAllowsArbitraryLoadsInWebContent: true,
            NSAllowsLocalNetworking: true
          }
        }
      },
      plugins: [
        ...config.plugins,
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