import { useCurrentTheme } from "@/components/ui/gluestack-ui-provider/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EboxScreen from "./ebox";
import SingleLampScreen from "./singleLamp";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

const TAB_CONFIG = [
    { name: "ebox", title: "集中器" },
    { name: "singleLamp", title: "单灯" },
] as const;

const TabItem = memo(({
    route,
    index,
    isFocused,
    tabWidth,
    currentTheme,
    onPress,
}: {
    route: any;
    index: number;
    isFocused: boolean;
    tabWidth: number;
    currentTheme: any;
    onPress: () => void;
}) => {
    const label = route.options?.tabBarLabel || route.options?.title || route.name;
    const tabConfig = TAB_CONFIG.find(tab => tab.name === route.name);
    const displayLabel = typeof label === 'string' ? label : (tabConfig?.title || route.name);

    return (
        <View
            style={{
                width: tabWidth,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                }}
                activeOpacity={0.7}
            >
                <Text
                    style={{
                        color: isFocused ? currentTheme.activeTint : currentTheme.inactiveTint,
                        fontSize: isFocused ? 16 : 14,
                        fontWeight: isFocused ? "700" : "400",
                        textAlign: 'center',
                        opacity: isFocused ? 1 : 0.7,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {displayLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
});

TabItem.displayName = 'TabItem';

const CustomTabBar = memo(({ state, descriptors, navigation, onTabChange }: MaterialTopTabBarProps & { onTabChange?: (tabName: string) => void }) => {
    const currentTheme = useCurrentTheme();
    const insets = useSafeAreaInsets();

    const tabWidth = useMemo(() => {
        const availableWidth = width * 0.5;
        return availableWidth / TAB_CONFIG.length;
    }, []);

    useEffect(() => {
        if (onTabChange && state?.routes && state?.index !== undefined) {
            const route = state.routes[state.index];
            if (route?.name) {
                onTabChange(route.name);
            }
        }
    }, [state.index, state.routes, onTabChange]);

    const handlePress = useCallback((route: any, index: number) => {
        const isFocused = state.index === index;
        if (isFocused) return;

        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    }, [state.index, navigation]);

    return (
        <View
            style={{
                flexDirection: 'row',
                backgroundColor: 'transparent',
                height: 40,
                width: width * 0.8,
                marginTop: insets.top - 5,
                position: 'relative',
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const routeOptions = descriptors[route.key].options;

                return (
                    <TabItem
                        key={route.key}
                        route={{ name: route.name, options: routeOptions }}
                        index={index}
                        isFocused={isFocused}
                        tabWidth={tabWidth}
                        currentTheme={currentTheme}
                        onPress={() => handlePress(route, index)}
                    />
                );
            })}
        </View>
    );
});

CustomTabBar.displayName = 'CustomTabBar';

export default function DevicesLayout() {
    const currentTheme = useCurrentTheme();
    const insets = useSafeAreaInsets();

    const [currentTab, setCurrentTab] = useState<string>('ebox');

    const screenOptions = useMemo(() => ({
        tabBarShowLabel: true,
        tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
        },
    }), []);

    const statusBarStyle = useMemo(() =>
        currentTheme.headerBg === "#fff" ? "dark-content" : "light-content",
        [currentTheme.headerBg]
    );

    const addButtonStyle = useMemo(() => ({
        position: "absolute" as const,
        right: 10,
        top: insets.top - 5,
        width: width * 0.1,
        height: 34,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        backgroundColor: currentTheme.headerBg,
        zIndex: 1,
    }), [insets.top, currentTheme.headerBg]);

    const handleAddPress = useCallback(() => {
        if (currentTab === 'singleLamp') {
            router.push("/collection/(modal)/addSingleLamp");
        } else {
            router.push("/collection/(modal)/addDevice");
        }
    }, [currentTab]);

    const handleTabChange = useCallback((tabName: string) => {
        setCurrentTab(tabName);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.headerBg }}>
            <StatusBar
                translucent
                backgroundColor={currentTheme.headerBg}
                barStyle={statusBarStyle}
            />
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} onTabChange={handleTabChange} />}
                screenOptions={screenOptions}
            >
                <Tab.Screen
                    name="ebox"
                    component={EboxScreen}
                    options={{
                        tabBarLabel: '集中器',
                    }}
                />
                <Tab.Screen
                    name="singleLamp"
                    component={SingleLampScreen}
                    options={{
                        tabBarLabel: '单灯',
                    }}
                />
            </Tab.Navigator>
            <View style={addButtonStyle}>
                <TouchableOpacity
                    className="flex-row items-center w-full h-full justify-center pt-1"
                    onPress={handleAddPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={22} color={currentTheme.activeTint} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
