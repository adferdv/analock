import React, { ReactNode } from "react";
import { View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import { colorBlack } from "../constants/constants";

interface ProfileCircleContainerProps {
  children: ReactNode;
  iconSize: number;
}

export const ProfileCircleContainer: React.FC<ProfileCircleContainerProps> = ({
  children,
  iconSize,
}) => {
  const size = iconSize + 40;
  const borderWidth = 2;
  const center = size / 2;
  const radius = center - borderWidth / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={"transparent"}
          stroke={colorBlack}
          strokeWidth={borderWidth}
        />
      </Svg>
      <View style={{ position: "absolute" }}>
        {React.cloneElement(children as React.ReactElement, {
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        })}
      </View>
    </View>
  );
};
