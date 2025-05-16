import { container_query_details } from "@/api/gis/index";
import { lampIcons } from "@/utils/mapIconBase64";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useCustomToast } from "../public/UIComponents/ToastComponent";
export interface MarkerIcon {
  size: [number, number];
  image: string;
}

export interface Marker {
  id: string;
  position: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  icon?: MarkerIcon;
  info?: string;
  container_type?: string;
  state?: number;
  direction?: number;
  online?: boolean;
  open?: boolean;
  warn?: boolean;
  single_lamp_status?: string[];
}

export interface AMapWebViewProps {
  markers?: Marker[];
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  onMapPress?: (position: { latitude: number; longitude: number }) => void;
  moveTo?: {
    position: { latitude: number; longitude: number };
    zoom: number;
    title: string;
    info?: string;
    container_type?: string;
    state?: number;
    direction?: number;
    online?: boolean;
    open?: boolean;
    warn?: boolean;
    container_id: number;
    single_lamp_status?: string[];
  } | null;
}
// center = { latitude: 27.151157, longitude: 114.99911 },
const AMapWebView = ({
  markers = [],
  center = { latitude: 30.858307, longitude: 104.42053 },
  zoom = 19,
  onMapPress,
  moveTo,
}: AMapWebViewProps) => {
  const webViewRef = useRef<WebView>(null);
  const { showError } = useCustomToast();
  const lightImage = lampIcons.eleBoxKatong;
  useEffect(() => {
    if (webViewRef.current) {
      const updateMarkersScript = `
        (function() {
          window.markers = ${JSON.stringify(markers)};
          if (typeof updateMarkers === 'function') {
            updateMarkers();
          }
        })();
      `;
      webViewRef.current.injectJavaScript(updateMarkersScript);
    }
  }, [markers]);

  useEffect(() => {
    if (moveTo && webViewRef.current) {
      const message = JSON.stringify({
        type: "getMarkerDetails",
        Container: {
          title: moveTo.title,
          info: moveTo.info,
          position: moveTo.position,
          container_type: moveTo.container_type,
          online: moveTo.online,
          open: moveTo.open,
          warn: moveTo.warn,
          state: moveTo.state,
          direction: moveTo.direction,
          container_id:moveTo.container_id
        },
      });
      webViewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage('${message}');
      `);
    }
  }, [moveTo]);

  const injectedJavaScript = `
    (function() {
      let map;
      let cluster;
      let amapMarkers = [];
      let infoWindow;
      window.markers = ${JSON.stringify(markers)};
      window.lampIcons = ${JSON.stringify(lampIcons)};
      // 创建标记点的函数
      function createMarkers() {
        const markers = window.markers;
        // 转换为高德地图需要的格式
        const points = markers.map(marker => ({
          lnglat: [marker.position.longitude.toString(), marker.position.latitude.toString()],
          extData: marker // 保存原始数据用于点击事件
        }));

        // 设置聚合数据
        if (cluster) {
          cluster.setData(points);
        }
      }

      // 更新标记点的函数
      window.updateMarkers = function() {
        if (cluster) {
          createMarkers();
        }
      };

      // 初始化地图
      map = new AMap.Map('container', {
        zoom: ${zoom},
        center: [${center.longitude}, ${center.latitude}],
        zooms:[8,19],
        viewMode: '3D',
      });

      // 添加地图点击事件
      map.on('click', function() {
        if (infoWindow) {
          infoWindow.close();
        }
      });

      var _renderMarker = function(context) {
        var extData = context.data[0].extData;
        var icon = extData && extData.icon;
        var size = icon && icon.size ? icon.size : [30, 30];
        var imgSrc = icon && icon.image && window.lampIcons && window.lampIcons[icon.image]
        ? window.lampIcons[icon.image]
        : '${lightImage}';
        var amapIcon = new AMap.Icon({
          image: imgSrc,
          size: new AMap.Size(size[0], size[1]),
          imageSize: new AMap.Size(size[0], size[1]),
          imageOffset: new AMap.Pixel(0, 0)
        });
        
        context.marker.setIcon(amapIcon);
        context.marker.setOffset(new AMap.Pixel(-size[0]/2, -size[1]));

        // 使用箭头函数，保持作用域
        context.marker.on('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'getMarkerDetails',
            Container: extData
          }));
        });
      }

      // 加载点聚合插件
      map.plugin(["AMap.MarkerCluster"], function() {
        // 创建聚合对象
        cluster = new AMap.MarkerCluster(map, [], {
          gridSize: 120, // 聚合网格像素大小
          renderMarker: _renderMarker,
        });
        // 创建标记点
        createMarkers();
      });

      // 处理从React Native接收到的消息
      window.handleMarkerDetails = function(details) {
        if (details && details.data) {
          const isLamp = details.data.container_type === 'lamp';
          
          // 获取配电箱状态
          const getEboxStatus = (data) => {
            if (!data.online && !data.open && !data.warn) return { label: '离线', color: '#999999' };
            if (data.online && !data.open && !data.warn) return { label: '在线', color: '#52c41a' };
            if (data.online && data.open && !data.warn) return { label: '打开', color: '#1890ff' };
            if (data.online && data.warn) return { label: '报警', color: '#f5222d' };
            return { label: '未知', color: '#999999' };
          };

          // 获取单灯控制器状态
          const getLampStatus = (data) => {
            if (!data.single_lamp_status || !data.single_lamp_status.length) return '';
            return data.single_lamp_status.map((status, index) => 
              '<span style="color: ' + (status === 'open' ? '#52c41a' : '#999999') + '">控制器' + (index + 1) + ':' + (status === 'open' ? '开' : '关') + '</span>'
            ).join('，');
          };

          // 渲染灯杆信息窗口内容
          const renderLampContent = (data) => {
            return \`
              <div style="
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                min-width: 280px;
                overflow: visible;
                position: relative;
              ">
                <div style="
                  background: #52c41a;
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px 8px 0 0;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 14px;
                  font-weight: bold;
                ">
                  <span>\${data.name || data.device_name || ''}</span>
                </div>
                <div style="
                  padding: 12px;
                  font-size: 13px;
                  color: #333;
                ">
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">设备编号：</span>
                    <span>\${data.sn || ''}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">设备名称：</span>
                    <span>\${data.name || data.device_name || ''}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">设备纬度：</span>
                    <span>\${data.lat || ''}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">设备经度：</span>
                    <span>\${data.lng || ''}</span>
                  </div>
                  \${data.lamp_holders ? \`
                    \${Object.entries(data.lamp_holders).map(([key, holder]) => \`
                      <div style="margin-bottom: 8px;">
                        <span style="color: #666;">\${holder.name}状态：</span>
                        <span style="margin-left: 3px;">
                          \${holder.state === 'close' ? 
                            '<span style="color: #909399;">关灯</span>' : 
                            holder.state === 'open' ? 
                            '<span style="color: #67C23A">开灯</span>' : 
                            '<span style="color: #F56C6C">异常</span>'
                          }
                        </span>
                      </div>
                    \`).join('')}
                  \` : ''}
                </div>
                <div style="
                  position: absolute;
                  bottom: -8px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 8px solid transparent;
                  border-right: 8px solid transparent;
                  border-top: 8px solid white;
                "></div>
              </div>
            \`;
          };

          // 渲染集中器信息窗口内容
          const renderEboxContent = (data) => {
            const eboxStatus = getEboxStatus(data);
            return \`
              <div style="
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                min-width: 280px;
                overflow: visible;
                position: relative;
              ">
                <div style="
                  background: \${eboxStatus.color};
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px 8px 0 0;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 14px;
                  font-weight: bold;
                ">
                  <span>\${data.name || ''}</span>
                </div>
                <div style="
                  padding: 12px;
                  font-size: 13px;
                  color: #333;
                ">
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">编号：</span>
                    <span>\${data.device_code || ''}</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">类型：</span>
                    <span>配电箱</span>
                  </div>
                  <div style="margin-bottom: 8px;">
                    <span style="color: #666;">状态：</span>
                    <span style="color: \${eboxStatus.color}">\${eboxStatus.label}</span>
                  </div>
                  \${data.meta_data ? \`
                    <div style="margin-bottom: 8px;">
                      <span style="color: #666;">设备时间：</span>
                      <span>\${data.meta_data.deviceTime || ''}</span>
                    </div>
                    <div style="margin-bottom: 8px;">
                      <span style="color: #666;">温度：</span>
                      <span>\${data.meta_data.temperature || 0}°C</span>
                    </div>
                  \` : ''}
                  <div style="margin-bottom: 8px;display: flex;flex-direction: row;align-items: center;">
                    <span style="color: #666;">回路：</span>
                    <div style="display: flex; gap: 4px; margin-top: 4px;">
                      \${data.meta_data && data.meta_data.jinfo ? 
                        data.meta_data.jinfo.map((loop, index) => \`
                          <div style="
                            width: 16px;
                            height: 16px;
                            border-radius: 8px;
                            background-color: \${loop ? '#409eff' : '#d9d9d9'};
                            display: flex;
                            justify-content: center;
                            align-items: center;
                          ">
                            <span style="
                              font-size: 10px;
                              color: #666;
                              text-align: center;
                            ">\${index + 1}</span>
                          </div>
                        \`).join('') : ''}
                    </div>
                  </div>
                </div>
                <div style="
                  position: absolute;
                  bottom: -8px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 8px solid transparent;
                  border-right: 8px solid transparent;
                  border-top: 8px solid white;
                "></div>
              </div>
            \`;
          };

          // 根据类型选择渲染内容
          const content = isLamp ? renderLampContent(details.data) : renderEboxContent(details.data);

          // 关闭已存在的信息窗口
          if (infoWindow) {
            infoWindow.close();
          }

          // 创建新的信息窗口
          infoWindow = new AMap.InfoWindow({
            isCustom: true,
            autoMove: true,
            offset: new AMap.Pixel(0, isLamp ? -80 : -50),
            closeWhenClickMap: true
          });

          infoWindow.setContent(content);
          infoWindow.open(map, details.position);
          const offsetLat = 0.0002; // 大约20米的偏移
          const newCenter = [details.position[0], details.position[1] + offsetLat]
          map.setCenter(newCenter);
          map.setZoom(19);
        }
      };
     
      // 错误处理
      map.on('error', (e) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapError',
          error: e.message
        }));
      });

      true;
    })();
  `;

  // 处理 WebView 消息
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "getMarkerDetails":
          try {
          
            if (data.Container.container_id) {
              const res = await container_query_details({ container_id: data.Container.container_id });
              if (res.code === 200) {
                let updateDetailsScript = '';
                if(res.data.container_type === 'lamp'){
                   updateDetailsScript = `
                  (function() {
                    window.handleMarkerDetails({
                      data: {
                        name: '${res.data.name || ""}',
                        device_name: '${res.data.device_name || ""}',
                        sn: '${res.data.sn || ""}',
                        lat: ${res.data.lat || 0},
                        lng: ${res.data.lng || 0},
                        container_type: '${res.data.container_type || ""}',
                        lamp_holders: ${JSON.stringify(res.data.lamp_holders || {})},
                        single_lamp_status: ${JSON.stringify(res.data.single_lamp_status || [])}
                      },
                      position: [${data.Container.position.longitude}, ${data.Container.position.latitude}]
                    });
                  })();
                `;
                webViewRef.current?.injectJavaScript(updateDetailsScript);
                }else{
                   updateDetailsScript = `
                  (function() {
                    window.handleMarkerDetails({
                      data: {
                        name: '${res.data.name || ""}',
                        device_code: '${res.data.device_code || ""}',
                        container_type: '${res.data.container_type || ""}',
                        online: ${res.data.online || false},
                        open: ${res.data.open || false},
                        warn: ${res.data.warn || false},
                        meta_data: ${JSON.stringify(res.data.meta_data || {})},
                      },
                      position: [${data.Container.position.longitude}, ${data.Container.position.latitude}]
                    });
                  })();
                `;
                webViewRef.current?.injectJavaScript(updateDetailsScript);
                }
                }
            } else {
              // 处理单灯点击（没有container_id的情况）
              const updateDetailsScript = `
                (function() {
                  window.handleMarkerDetails({
                    data: {
                      name: '${data.Container.title || ""}',
                      device_code: '${data.Container.info || ""}',
                      container_type: '${data.Container.container_type || ""}',
                      direction: ${data.Container.direction || 0},
                      single_lamp_status: ${JSON.stringify(data.Container.single_lamp_status || [])}
                    },
                    position: [${data.Container.position.longitude}, ${data.Container.position.latitude}]
                  });
                })();
              `;
              webViewRef.current?.injectJavaScript(updateDetailsScript);
            }
          } catch (error) {
            console.error("获取站点详情失败:", error);
            showError({
              title: "获取站点详情失败",
              message: "请稍后重试",
            });
          }
          break;
        case "mapPress":
          onMapPress?.(data.position);
          break;
        case "mapError":
          showError({
            title: "地图加载错误",
            message: data.error,
          });
          break;
      }
    } catch (error) {
      console.log("处理地图消息失败:", error);
    }
  };

  return (
    <View className="flex-1">
      <WebView
        ref={webViewRef}
        source={{
          html: `            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <title>高德地图</title>
                <link rel="stylesheet" href="https://a.amap.com/jsapi_demos/static/demo-center/css/demo-center.css" />
                <script src="https://webapi.amap.com/maps?v=2.0&key=3eecd5c781cbafb6efc01aecb6149836"></script>
                <style>
                  html, body, #container {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                  }
                </style>
              </head>
              <body>
                <div id="container"></div>
                <script>
                  // 确保 ReactNativeWebView 对象存在
                  window.ReactNativeWebView = window.ReactNativeWebView || {
                    postMessage: function(message) {
                      window.webkit.messageHandlers.ReactNativeWebView.postMessage(message);
                    }
                  };
                </script>
              </body>
            </html>
          `,
        }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={{
          width: '100%',
          height: '100%',
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
      />
    </View>
  );
};

export default AMapWebView;

