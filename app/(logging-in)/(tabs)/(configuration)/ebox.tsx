import { getEboxListApi } from "@/api/street/configuration";
import EboxList from "@/components/ebox/EboxList";
import { useEffect, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function EleBoxScreen() {
  const [electricBoxes, setElectricBoxes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEleBoxes = async () => {
    try {
      setLoading(true);
      const res = await getEboxListApi({});
    //   console.log(res, "res");
      if (res.code === 200) {
        setElectricBoxes(res.data || []);
      }
    } catch (error) {
      console.error('获取电箱列表失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEleBoxes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEleBoxes();
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <View style={styles.container}>
        <EboxList
          electricBoxes={electricBoxes}
          loading={loading}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
