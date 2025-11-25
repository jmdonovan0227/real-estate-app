import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="font-bold text-3xl font-rubik my-5 text-primary">
        Welcome to Real Estate App
      </Text>
    </View>
  );
}
