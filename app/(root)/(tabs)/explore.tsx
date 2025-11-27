import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppwrite } from "@/lib/useAppwrite";
import { getProperties } from "@/lib/appwrite";
import { useEffect } from "react";
import NoResults from "@/components/NoResults";
import type { Properties } from "@/types/appwrite";

export default function Explore() {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const router = useRouter();

  const {
    data: properties,
    loading: propertiesLoading,
    refetch: refetchProperties,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter ?? "",
      query: params.query ?? "",
      limit: 20,
    },

    skip: true,
  });

  useEffect(() => {
    refetchProperties({
      filter: params.filter ?? "",
      query: params.query ?? "",
      limit: 20,
    });
  }, [params.filter, params.query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCardPress = (id: string) => {
    router.push(`/properties/${id}`);
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={properties}
        renderItem={({ item }: { item: Properties }) => (
          <Card item={item} onPress={() => handleCardPress(item.$id)} />
        )}
        keyExtractor={(item) => item.$id.toString()}
        numColumns={2}
        contentContainerClassName="pb-32" // to prevent content from being cut off by the bottom of the screen
        columnWrapperClassName="flex gap-5 px-5" // to add space between the columns
        showsVerticalScrollIndicator={false} // to hide the scroll indicator
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <Text className="text-base mr-2 font-rubik-medium text-center text-black-300">
                Search for your Ideal Home
              </Text>
              <Image source={icons.bell} className="size-6" />
            </View>

            <Search />

            <View className="mt-5">
              <Filters />

              <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                {properties?.length} properties found
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          propertiesLoading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
      />
    </SafeAreaView>
  );
}
