import { lampIcons } from "@/utils/mapIconBase64";
import React, { useEffect, useRef } from "react";
import { Dimensions, View } from "react-native";
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
}

export interface AMapWebViewProps {
  markers?: Marker[];
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  onMarkerPress?: (marker: Marker) => void;
  onMapPress?: (position: { latitude: number; longitude: number }) => void;
  moveTo?: {
    position: { latitude: number; longitude: number };
    zoom: number;
    title:string;

  } | null;
}
// center = { latitude: 27.151157, longitude: 114.99911 },
const AMapWebView = ({
  markers = [],
  center = { latitude: 30.858307, longitude: 104.42053 },
  zoom = 19,
  onMarkerPress,
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
  // console.log(lampIcons['singleLightNormal']);

  useEffect(() => {
    if (moveTo && webViewRef.current) {
      const message = JSON.stringify({
        type: "getMarkerDetails",
        Container: {
          title: moveTo.title,
          info: moveTo.position.longitude.toString(),
          position: moveTo.position,
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

      // 创建信息窗体
      infoWindow = new AMap.InfoWindow({
        isCustom: true,
        autoMove: true,
        offset: new AMap.Pixel(0, -50),
        closeWhenClickMap: true
      });

      // 添加地图点击事件
      map.on('click', function() {
        infoWindow.close();
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
            // marker: extData,
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
          const content = \`
            <div style="
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              min-width: 200px;
              overflow: visible;
              position: relative;
            ">
              <div style="
                background: #1890ff;
                color: white;
                padding: 8px 12px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 14px;
                font-weight: bold;
              ">
                <span>\${details.data.name || ''}</span>
              
              </div>
              <div style="
                padding: 12px;
                font-size: 13px;
                color: #333;
                border-bottom: 1px solid #f0f0f0;
              ">
                <div style="margin-bottom: 8px;">
                  <span style="color: #666;">编号：</span>
                  <span>\${details.data.device_code || ''}</span>
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
          infoWindow.setContent(content);
          infoWindow.open(map, details.position);
          // 设置地图中心点为传入的坐标点
          map.setCenter(details.position);
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
        case "markerPress":
          // console.log(data,"触发点击1");
          // onMarkerPress?.(data.marker);
          break;
        case "getMarkerDetails":
          // console.log(data,"触发点击2");
          try {
            const updateDetailsScript = `
              (function() {
                window.handleMarkerDetails({
                  data: {
                    name: '${data.Container.title || ""}',
                    device_code: '${data.Container.info || ""}'
                  },
                  position: [${data.Container.position.longitude}, ${
              data.Container.position.latitude
            }]
                });
              })();
            `;
            webViewRef.current?.injectJavaScript(updateDetailsScript);
          } catch (error) {
            console.error("获取标记点详情失败:", error);
            showError({
              title: "获取详情失败",
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
      console.error("处理地图消息失败:", error);
    }
  };

  return (
    <View className="flex-1">
      <WebView
        ref={webViewRef}
        source={{
          html: `
            <!DOCTYPE html>
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
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height * 0.6,
        }}
        // onLoadEnd={() => {
        //   console.log('WebView loaded');
        // }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
      />
    </View>
  );
};

export default AMapWebView;
