import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";
import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  Image as SvgImage,
  Text as SvgText,
  TSpan
} from "react-native-svg";

const { width, height } = Dimensions.get("window");
const ICON_SIZE = 60;

export interface ConfigNode {
  emsg: string|null;
  xAxis: number;
  yAxis: number;
  spriteX: number;
  spriteY: number;
  imageUrl: string;
  parent?: string | null;
  id: number;
  pid: number;
  phaseA: boolean;
  phaseB: boolean;
  phaseC: boolean;
  voltageA: boolean;
  voltageB: boolean;
  voltageC: boolean;
  display_name: string;
  cfg_type: string;
  selectTypeA: string;
  selectTypeB: string;
  selectTypeC: string;
  num_value:number|null;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ConnectionLine = memo(
  ({
    node,
    parent,
    type,
    offset,
    parentOffset,
  }: {
    node: ConfigNode;
    parent: ConfigNode;
    type: string;
    offset: number;
    parentOffset: number;
  }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        false
      );
    }, []);

    const getColor = (type: string, midY: number,node:any) => {
      if (type === 'A1' || type === 'A2' || type === 'A3') {
        return {
          color: "#e0d751",
          strokeTack: midY -= 5,
          // isSetDash: node.voltageA
          isSetDash: node.voltageA
        };
      } else if (type === 'B1' || type === 'B2' || type === 'B3') {
        return {
          color: "#32d0a3",
          strokeTack: midY,
          isSetDash: node.voltageB
        };
      } else {
        return {
          color: "#d66b6b",
          strokeTack: midY += 5,
          isSetDash: node.voltageC
        };
      }
    };

    const x1 = parent.xAxis / 4 + parentOffset;
    const y1 = parent.yAxis / 2 + 20;
    const x2 = node.xAxis / 4 + offset;
    const y2 = node.yAxis / 2 + 10;
    let midX = (x1 + x2) / 2;
    let midY = (y1 + y2) / 2;

    const properties = getColor(type, midY,node);
    const path = `M ${x1} ${y1} L ${x1} ${properties.strokeTack} L ${x2} ${properties.strokeTack} L ${x2} ${y2}`;

    const animatedProps = useAnimatedProps(() => {
      const strokeDashoffset = interpolate(
        progress.value,
        [1,0 ],
        [0, 20]
      );

      return {
        strokeDasharray: [5, 5],
        strokeDashoffset,
      };
    });

    return (
      <React.Fragment>
        <AnimatedPath
          key={`${node.id}-line-${type}-top`}
          d={path}
          stroke={properties.color}
          strokeWidth={2}
          fill="none"
          strokeOpacity={0.2}
        />
        {properties.isSetDash ? (
          <AnimatedPath
            key={`${node.id}-line-${type}`}
            d={path}
            stroke={properties.color}
            strokeWidth={2}
            fill="none"
            animatedProps={animatedProps}
          />
        ) : (
          <Path
            key={`${node.id}-line-${type}`}
            d={path}
            stroke={properties.color}
            strokeWidth={2}
            fill="none"
          />
        )}
        {/* <AnimatedPath
            key={`${node.id}-line-${type}`}
            d={path}
            stroke={properties.color}
            strokeWidth={2}
            fill="none"
            animatedProps={animatedProps}
          /> */}
        <AnimatedPath
          key={`${node.id}-line-${type}-bottom`}
          d={path}
          stroke={properties.color}
          strokeWidth={2}
          fill="none"
          strokeOpacity={0.2}
        />
        {node.cfg_type === "I" && node.display_name?.length > 0 && (
          <SvgText
            x={midX - 20}
            y={midY + 60}
            fill="#fff"
            fontSize="10"
            textAnchor="middle"
          >
            {node.display_name.split("").map((char, index) => (
              <TSpan key={index} x={midX - 10} dy={index === 0 ? 0 : 16}>
                {char}
              </TSpan>
            ))}
          </SvgText>
        )}
        {node.cfg_type === "I" && node.emsg && node.emsg.length > 0 && (
          <SvgText
            x={midX + 10}
            y={midY + 80}
            fill="red"
            fontSize="10"
            textAnchor="middle"
          >
            {node.emsg.split("").map((char, index) => (
              <TSpan key={index} x={midX + 10} dy={index === 0 ? 0 : 16}>
                {char}
              </TSpan>
            ))}
          </SvgText>
        )}
        {node.cfg_type === "I" && node.num_value !== null && (
          <>
            <Rect
              x={midX - 20}
              y={midY + 15}
              width={40}
              height={20}
              rx={4}
              fill="rgba(0, 0, 0, 0.6)"
            />
            <SvgText
              x={midX}
              y={midY + 25}
              fill="#409eff"
              fontSize="12"
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.num_value.toString()}
            </SvgText>
          </>
        )}
      </React.Fragment>
    );
  }
);

ConnectionLine.displayName = 'ConnectionLine';

const DeviceIcon = memo(
  ({
    node,
    imageSize,
  }: {
    node: ConfigNode;
    imageSize: { width: number; height: number };
  }) => {
    const spriteImage = require("@/assets/images/street/electricBox/newConfigIcon.png");

    return (
      <G key={node.id} x={node.xAxis / 4} y={node.yAxis / 2} scale={0.5}>
        <Defs>
          <ClipPath id={`clip-${node.id}`}>
            <Rect x={0} y={0} width={ICON_SIZE} height={ICON_SIZE} />
          </ClipPath>
        </Defs>
        <SvgImage
          x={-node.spriteX - 10}
          y={-node.spriteY - 10}
          width={imageSize.width}
          height={imageSize.height}
          href={spriteImage}
          clipPath={`url(#clip-${node.id})`}
          preserveAspectRatio="xMinYMin slice"
        />
      </G>
    );
  }
);

DeviceIcon.displayName = 'DeviceIcon';

// 组态图主组件
export default function ConfigurationGraph({
  nodes = [],
}: {
  nodes: ConfigNode[];
}) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isHorizontal, setIsHorizontal] = useState(false);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = Math.max(0.5, Math.min(3, newScale));
    })
    .onEnd(() => {
      // scale.value = withSpring(scale.value, { damping: 20, stiffness: 90 });
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      const scaleFactor = 1 / scale.value;
      translateX.value = savedTranslateX.value + e.translationX * scaleFactor;
      translateY.value = savedTranslateY.value + e.translationY * scaleFactor;
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value, {
        damping: 20,
        stiffness: 90,
      });
      translateY.value = withSpring(translateY.value, {
        damping: 20,
        stiffness: 90,
      });
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const resetView = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 90 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    savedScale.value = 0.5;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // change toggle
  const toggleOrientation = () => {
    setIsHorizontal(!isHorizontal);
    setTimeout(() => {
      resetView();
    }, 100);
  };

  const getCanvasDimensions = () => {
    if (isHorizontal) {
      const canvasWidth = height;
      const canvasHeight = height;
      const containerWidth = width;
      const containerHeight = height;

      const centerX = (containerWidth - canvasWidth) / 2;
      const centerY = (containerHeight - canvasHeight) * 0.8;

      return {
        width: canvasWidth,
        height: canvasHeight,
        style: {
          ...styles.horizontalSvg,
          position: "absolute" as const,
          left: centerX,
          top: centerY,
        },
      };
    } else {
      return {
        width: width,
        height: height,
        style: styles.verticalSvg,
      };
    }
  };

  const canvasDimensions = getCanvasDimensions();

  useEffect(() => {
    const source = Image.resolveAssetSource(
      require("@/assets/images/street/electricBox/newConfigIcon.png")
    );
    setImageSize({ width: source.width, height: source.height });
  }, []);

  const nodeConnections = useMemo(() => {
    return nodes
      .map((node) => {
        const parent = nodes.find((n) => n.id === node.pid);
        if (!parent) return null;

        const connections: { type:string; offset: number;parentOffset:number }[] =
          [];

        if (
          node.cfg_type == "O" ||
          node.cfg_type == "R" ||
          node.cfg_type == "I"
        ) {
          if (
            node.selectTypeB === parent.selectTypeA
          ) {
            connections.push({ type:parent.selectTypeA, offset: 13.7,parentOffset:10 });
          }
          if (
            node.selectTypeB === parent.selectTypeB
          ) {
            connections.push({ type:parent.selectTypeB, offset: 17,parentOffset:17});
          }
          if (
            node.selectTypeB === parent.selectTypeC 
          ) {
            connections.push({ type:parent.selectTypeC, offset: 19.3,parentOffset:23 });
          }
        } else {
          // 检查A相连接
          if (
            node.selectTypeA === parent.selectTypeA 
          ) {
            connections.push({ type: parent.selectTypeA, offset: 10,parentOffset:10 });
          }
          if (
            node.selectTypeA === parent.selectTypeB
          ) {
            connections.push({ type: parent.selectTypeB, offset: 10,parentOffset:17 });
          }
          if (
            node.selectTypeA === parent.selectTypeC 
          ) {
            connections.push({ type: parent.selectTypeC, offset: 10,parentOffset:23 });
          }

          // 检查B相连接
          if (
            node.selectTypeB === parent.selectTypeA
          ) {
            connections.push({ type: parent.selectTypeA, offset: 17,parentOffset:10 });
          }
          if (
            node.selectTypeB === parent.selectTypeB
          ) {
            connections.push({ type: parent.selectTypeB, offset: 17,parentOffset:17 });
          }
          if (
            node.selectTypeB === parent.selectTypeC 
          ) {
            connections.push({ type: parent.selectTypeC, offset: 17,parentOffset:23 });
          }

          // 检查C相连接
          if (
            node.selectTypeC === parent.selectTypeA 
          
          ) {
            connections.push({ type: parent.selectTypeA, offset: 23,parentOffset:10 });
          }
          if (
            node.selectTypeC === parent.selectTypeB 
          
          ) {
            connections.push({ type: parent.selectTypeB, offset: 23,parentOffset:17 });
          }
          if (
            node.selectTypeC === parent.selectTypeC          
          ) {
            connections.push({ type:parent.selectTypeC, offset: 23,parentOffset:23 });
          }
        }

        return connections.length > 0 ? { node, parent, connections } : null;
      })
      .filter(
        (
          item
        ): item is {
          node: ConfigNode;
          parent: ConfigNode;
          connections: { type:string; offset: number;parentOffset:number }[];
        } => item !== null
      );
  }, [nodes]);

  if (!nodes || nodes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={{ color: "#999" }}>暂无组态数据</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector
          gesture={Gesture.Simultaneous(pinchGesture, panGesture)}
        >
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <Svg
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              style={canvasDimensions.style}
            >
              {nodeConnections.map((connection) => {
                if (!connection) return null;
                const { node, parent, connections } = connection;

                return (
                  <React.Fragment key={node.id}>
                    {connections.map(({ type, offset,parentOffset }) => (
                      <ConnectionLine
                        key={`${node.id}-${type}-${offset}`}
                        node={node}
                        parent={parent}
                        type={type}
                        offset={offset}
                        parentOffset={parentOffset}
                      />
                    ))}
                  </React.Fragment>
                );
              })}

              {nodes.map((node) => (
                <DeviceIcon key={node.id} node={node} imageSize={imageSize} />
              ))}
            </Svg>
          </Animated.View>
        </GestureDetector>

        <View style={styles.controlsContainer}>
          {/*  <TouchableOpacity 
            style={styles.controlButton} 
            onPress={resetView}
          >
            <Text style={styles.buttonText}>重置</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleOrientation}
          >
            <Text style={styles.buttonText}>
              {isHorizontal ? "竖向" : "横向"}
            </Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f6f6f6",
    backgroundColor:"black"
  },
  empty: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  horizontalSvg: {
    transform: [{ rotate: "90deg" }],
  },
  verticalSvg: {
    transform: [{ rotate: "0deg" }],
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
  },
  controlButton: {
    backgroundColor: "#409eff",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
