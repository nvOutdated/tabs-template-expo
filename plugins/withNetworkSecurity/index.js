const { withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withNetworkSecurity = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // 创建 network_security_config.xml
    const networkSecurityConfigPath = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/res/xml/network_security_config.xml'
    );
    
    // 确保目录存在
    fs.mkdirSync(path.dirname(networkSecurityConfigPath), { recursive: true });
    
    // 写入配置文件
    fs.writeFileSync(
      networkSecurityConfigPath,
      `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">example.com</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>`
    );

    // 修改 AndroidManifest.xml
    const mainApplication = androidManifest.manifest.application[0];
    mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    mainApplication.$['android:usesCleartextTraffic'] = 'true';

    return config;
  });
};

module.exports = withNetworkSecurity;