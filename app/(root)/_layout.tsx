import { useGlobalContext } from "@/lib/global-provider";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { Redirect, Slot } from "expo-router";

// We need to protect the routes from unauthorized access
export default function AppLayout() {
  const { isLoggedIn, loading } = useGlobalContext();

  if (loading) {
    // show a loading indicator while the user is loading
    return (
      <SafeAreaView className="bg-white h-full flex justify-center items-center">
        <ActivityIndicator className="text-primary-300" size="large" />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />; // redirect to sign-in if user is not logged in
  }

  return <Slot />; // render the child routes
}
