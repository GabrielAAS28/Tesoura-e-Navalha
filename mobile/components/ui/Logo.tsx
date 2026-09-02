import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-lg border-[1.5px] border-border bg-bg-surface"
      style={{ width: size, height: size }}
    >
      <Svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24" fill="none">
        <Circle cx="6" cy="6" r="3" stroke="#D97706" strokeWidth={1.6} />
        <Circle cx="6" cy="18" r="3" stroke="#D97706" strokeWidth={1.6} />
        <Path
          d="M20 4L8.5 15.5M8.7 9.3L20 20"
          stroke="#D97706"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
