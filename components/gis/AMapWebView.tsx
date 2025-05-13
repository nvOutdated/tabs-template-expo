import { lampIcons } from '@/utils/mapIconBase64';
import React, { useRef } from 'react';
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
  const lightImage = lampIcons.singleLight
  const injectedJavaScript = `
    (function() {
      let map;
      let cluster;
      let amapMarkers = [];

      // 创建标记点的函数
      function createMarkers() {
        const markers = ${JSON.stringify(markers)};
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

      // 初始化地图
      map = new AMap.Map('container', {
        zoom: ${zoom},
        center: [${center.longitude}, ${center.latitude}],
        zooms:[13,19],
        viewMode: '3D',
      });
      var _renderMarker = function(context) {
        var extData = context.data.extData;
        var icon = extData && extData.icon;
        var size = icon && icon.size ? icon.size : [40, 80];
        var imgSrc = icon && icon.image ? icon.image : '';

        var amapIcon = new AMap.Icon({
          image: '${lightImage}',
          size: new AMap.Size(size[0], size[1]),
          imageSize: new AMap.Size(size[0], size[1]),
          imageOffset: new AMap.Pixel(0, 0)
        });

        context.marker.setIcon(amapIcon);
        context.marker.setOffset(new AMap.Pixel(-size[0]/2, -size[1]));
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
          const marker = e.target;
          const extData = marker.getExtData();
          if (extData) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerPress',
              marker: extData
            }));
          }
        });

        // 创建标记点
        createMarkers();
      });
     
      // 地图点击事件
      // map.on('click', (e) => {
      //   window.ReactNativeWebView.postMessage(JSON.stringify({
      //     type: 'mapPress',
      //     position: {
      //       latitude: e.lnglat.getLat(),
      //       longitude: e.lnglat.getLng()
      //     }
      //   }));
      // });

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
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(data);

      switch (data.type) {
        case 'markerPress':
          onMarkerPress?.(data.marker);
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
       
      />
    </View>
  );
};

export default AMapWebView;
