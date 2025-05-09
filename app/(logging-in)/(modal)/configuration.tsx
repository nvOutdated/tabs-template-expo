import { getElectricCfg } from "@/api/street/configuration";
import deviceMapJson from '@/assets/JSON/device_map_json.json';
import ConfigurationGraph, {
  ConfigNode,
} from "@/components/configuration/svgComponent";
import { useWebSocketStore } from "@/store/websocketStore";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// 修改 DeviceMeta 接口以匹配实际的 JSON 结构
interface DeviceMeta {
  name: string;
  icon: string;
  type_name: string;
  cfg_type: string;
  params: Record<string, any>;
  online: number[];
  offline: number[];
  shortErr: number[];
  open: number[];
  close: number[];
  ioError: number[];
  [key: string]: any;
}

// 修改 TreeNode 接口以包含所需字段
interface TreeNode {
  icon: string;
  iconValue: string;
  nodeName: string;
  xAxis: number;
  yAxis: number;
  children?: TreeNode[];
  emsg:string;
  [key: string]: any;
}

export default function ConfigurationPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {smartLight} = useWebSocketStore()
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<ConfigNode[]>([]);
  const flattenTree = (treeList: TreeNode[], children = "children"): ConfigNode[] => {
    const list: ConfigNode[] = [];
    if (!Array.isArray(treeList) || !treeList.length) return [];
    if (typeof children !== "string") return [];

    const getObj = (arr: TreeNode[]) => {
      arr.forEach((row: TreeNode) => {
        // 查找 meta，使用类型断言
        const meta = deviceMapJson.find((m) => m.icon === row.icon) as DeviceMeta | undefined;
        let spriteX = 0, spriteY = 0;

        // 安全地访问坐标值
        if (meta && row.iconValue && Array.isArray(meta[row.iconValue])) {
          const coordinates = meta[row.iconValue] as number[];
          if (coordinates.length >= 2) {
            spriteX = coordinates[0];
            spriteY = coordinates[1];
          }
          // if(meta.cfg_type === 'O'){
          //   spriteY = spriteY+60;
          // }
        }

        //构造符合 ConfigNode 类型的数据
        const pushData: ConfigNode = {
          // xAxis: row.xAxis,
          // yAxis: row.yAxis,
          spriteX,
          spriteY,
          imageUrl: '',
          parent: row.parent || null,
          // icon: row.icon,
          // iconValue: row.iconValue,
          id: row.id,
          pid: row.pid,
          phaseA: row.phaseA,
          phaseB: row.phaseB,
          phaseC: row.phaseC,
          voltageA: row.voltageA,
          voltageB: row.voltageB,
          voltageC: row.voltageC,
          display_name:row.display_name,
          cfg_type:row.cfg_type,
          selectTypeA:row.selectTypeA,
          selectTypeB:row.selectTypeB,
          selectTypeC:row.selectTypeC,
          // 添加其他必需的字段
          ...row,
        };
        
        // 删除 children 字段
        if ('children' in pushData) {
          delete (pushData as any).children;
        }
        
        list.push(pushData);
    
        if (row[children] && Array.isArray(row[children])) {
          getObj(row[children]);
        }
      });
    };

    getObj(treeList);
    return list;
  };
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const item = JSON.parse(params.item as string);
      const response = await getElectricCfg({
        cfg_type: "ebox",
        cfg_id: item.id,
      });
      if (response.code === 200) {
        setConfig(response.data);
        const nodes = flattenTree(response.data.node);
        setNodes(nodes);
        // console.log(nodes);
        
      } else {
        setError(response.msg || "获取配置失败");
      }
    } catch (err) {
      console.error("获取配置失败:", err);
      setError("获取配置失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // const fetchConfig = async () => {
    //   try {
    //     setLoading(true);
    //     const item = JSON.parse(params.item as string);
    //     const response = await getElectricCfg({
    //       cfg_type: "ebox",
    //       cfg_id: item.id,
    //     });
    //     if (response.code === 200) {
    //       setConfig(response.data);
    //       const nodes = flattenTree(response.data.node);
    //       setNodes(nodes);
    //       // console.log(nodes);
          
    //     } else {
    //       setError(response.msg || "获取配置失败");
    //     }
    //   } catch (err) {
    //     console.error("获取配置失败:", err);
    //     setError("获取配置失败，请检查网络连接");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchConfig();
  }, [params.item]);
  useEffect(()=>{
    
     const item = JSON.parse(params.item as string);
     console.log(item.device_info.id,smartLight.did);
     if(item.device_info.id===smartLight.did){
      fetchConfig();
     }
  },[smartLight])
  const handleBack = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 2,
          height: 55,
          paddingTop: insets.top,
          backgroundColor: 'black'
        }}>
          <Pressable onPress={handleBack} style={{ marginRight: 16 }}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </Pressable>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
          }}>
            {JSON.parse(params.item as string).name || 'Configuration'}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#409eff" />
          <Text style={{ marginTop: 10, color: 'white' }}>正在加载配置...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 55,
          paddingTop: insets.top,
          backgroundColor: 'black'
        }}>
          <Pressable onPress={handleBack} style={{ marginRight: 16 }}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </Pressable>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
          }}>
            {JSON.parse(params.item as string).name || 'Configuration'}
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 55,
        paddingTop: insets.top,
        backgroundColor: 'black'
      }}>
        <Pressable onPress={handleBack} style={{ marginRight: 16 }}>
          <AntDesign name="arrowleft" size={24} color="#ffffff" />
        </Pressable>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff',
        }}>
          {JSON.parse(params.item as string).name || 'Configuration'}
        </Text>
      </View>
      <ConfigurationGraph nodes={nodes} />
    </View>
  );
}
