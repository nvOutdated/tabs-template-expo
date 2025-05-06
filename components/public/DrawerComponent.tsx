import React, { HtmlHTMLAttributes } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    Dimensions
} from 'react-native';
type props = {
    isVisible: boolean; // 是否显示抽屉
    onClose: () => void; // 关闭抽屉的回调函数
    // children: React.ReactNode; // 抽屉内容
}
const { width, height } = Dimensions.get('window');
const headerHeight = 50; // 假设页眉高度为 50
const tabBarHeight = 50; // 假设底部 tabs 高度为 50

const DrawerComponent = ({ isVisible, onClose }:props) => {
    const slideAnim = React.useRef(new Animated.Value(-width / 2)).current;

    React.useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -width / 2,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [isVisible]);

    const closeDrawerOnOutsideClick = (event:any) => {
        const { locationX, locationY } = event.nativeEvent;
        const isInsideDrawer =
            locationX >= 0 &&
            locationX <= width / 2 &&
            locationY >= headerHeight &&
            locationY <= height - tabBarHeight;
        if (!isInsideDrawer) {
            onClose();
        }
    };

    return (
        isVisible && (
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={closeDrawerOnOutsideClick}
            >
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            transform: [
                                {
                                    translateX: slideAnim
                                }
                            ]
                        }
                    ]}
                >
                    {/* {children} */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>关闭</Text>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        )
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: headerHeight,
        left: 0,
        right: 0,
        bottom: tabBarHeight,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        width: width / 2,
        height: height - headerHeight - tabBarHeight,
        backgroundColor: 'white',
        padding: 16,
    },
    closeButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default DrawerComponent;
    