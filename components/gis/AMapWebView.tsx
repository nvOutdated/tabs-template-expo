import { gis_SmartLight_Details } from '@/api/street/streetCommon';
import { lampIcons } from '@/utils/mapIconBase64';
import React, { useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCustomToast } from '../public/UIComponents/ToastComponent';

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

interface AMapWebViewProps {
  markers?: Marker[];
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  onMarkerPress?: (marker: Marker) => void;
  onMapPress?: (position: { latitude: number; longitude: number }) => void;
}

const AMapWebView: React.FC<AMapWebViewProps> = ({
  markers = [],
  center = { latitude: 30.67626, longitude: 103.96613 },
  zoom = 19,
  onMarkerPress,
  onMapPress,
}) => {
  const webViewRef = useRef<WebView>(null);
  const { showError } = useCustomToast();
  const lightImage = lampIcons.eleBoxKatong;

  useEffect(() => {
    if (webViewRef.current) {
      console.log(markers,'markers数据');
      
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

  const injectedJavaScript = `
    (function() {
      let map;
      let cluster;
      let amapMarkers = [];
      let infoWindow;
      window.markers = ${JSON.stringify(markers)};

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
        offset: new AMap.Pixel(0, -30)
      });

      var _renderMarker = function(context) {
        var extData = context.data.extData;
        var icon = extData && extData.icon;
        var size = icon && icon.size ? icon.size : [30, 30];
        var imgSrc = icon && icon.image ? icon.image : '${lightImage}';

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
            Container: extData.id
          }));
        });
      }

      // 加载点聚合插件
      map.plugin(["AMap.MarkerCluster"], function() {
        // 创建聚合对象
        cluster = new AMap.MarkerCluster(map, [], {
          gridSize: 200, // 聚合网格像素大小
          renderMarker: _renderMarker,
        });

        // 添加点击事件
        cluster.on('click', function(e) {
          // const marker = e.target;
          // const extData = marker
          // if (extData) {
          //   window.ReactNativeWebView.postMessage(JSON.stringify({
          //     type: 'markerPress',
          //     marker: extData
          //   }));
          // }
              window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              marker:'123'
            }));
        });

        // 创建标记点
        createMarkers();
      });

      // 处理从React Native接收到的消息
      window.handleMarkerDetails = function(details) {
        if (details && details.data) {
          const content = \`
            <div style="padding: 10px;">
              <div style="margin-bottom: 5px;"><b>名称：</b>\${details.data.name || ''}</div>
              <div><b>编号：</b>\${details.data.device_code || ''}</div>
            </div>
          \`;
          infoWindow.setContent(content);
          infoWindow.open(map, details.position);
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
      console.log('收到消息:', event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);
      

      switch (data.type) {
        case 'markerPress':
          console.log(data,"触发点击1");
          // onMarkerPress?.(data.marker);
          break;
        case 'getMarkerDetails':
          console.log(data,"触发点击2");
          try {
            const res = await gis_SmartLight_Details({ container_id: data.Container });
            if (res.code === 200) {
              const updateDetailsScript = `
                (function() {
                  window.handleMarkerDetails({
                    data: ${JSON.stringify(res.data)},
                    position: [${data.marker.position.longitude}, ${data.marker.position.latitude}]
                  });
                })();
              `;
              webViewRef.current?.injectJavaScript(updateDetailsScript);
            }
          } catch (error) {
            console.error('获取标记点详情失败:', error);
            showError({
              title: '获取详情失败',
              message: '请稍后重试'
            });
          }
          break;
        case 'mapPress':
          onMapPress?.(data.position);
          break;
        case 'mapError':
          showError({
            title: '地图加载错误',
            message: data.error
          });
          break;
      }
    } catch (error) {
      console.error('处理地图消息失败:', error);
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
          `
        }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height * 0.6,
        }}
        // onLoadEnd={() => {
        //   console.log('WebView loaded');
        // }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
};

export default AMapWebView;
