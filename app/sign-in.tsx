import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import { login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect } from "expo-router";

const SignIn = () => {
  const { isLoggedIn, loading, refetch } = useGlobalContext();

  if (!loading && isLoggedIn) {
    // redirect to home if user is logged in
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    const result = await login(); // this creates a new session for the user and returns true if successful

    if (result) {
      refetch(); // refetch the user data to get the latest user data
    } else {
      Alert.alert("Login failed");
    }
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerClassName="flex-grow">
        {/** flex-grow is used to make the scroll view take up the remaining space in viewport and scroll if needed */}
        <Image
          source={images.onboarding}
          className="w-full h-4/6"
          resizeMode="contain"
        />
        <View className="px-10">
          <Text className="text-base text-center uppercase font-rubik text-black-200">
            Welcome to Real Estate App
          </Text>

          <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
            Let&apos;s Get You Closer to {`\n`}
            <Text className="text-primary-300">Your Dream Home</Text>
          </Text>

          <Text className="text-lg font-rubik text-black-200 text-center mt-12">
            Login to Real Estate App With Google
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white shadow-md shadow-zinc-300 rounded-full w-full py-5 mt-5"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="size-5"
                resizeMode="contain"
              />

              <Text className="text-lg font-rubik-medium text-black-300 ml-2">
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
