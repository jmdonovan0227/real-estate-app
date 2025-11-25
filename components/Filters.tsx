import { Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { categories } from "@/constants/data";

// router.setParams causes the page to re-render
// params are like props that are passed to the page
const Filters = () => {
  // subscribe to param changes and re-render so we know when the selected category changes in the url.
  const params = useLocalSearchParams<{ filter?: string }>();
  // Derive selectedCategory directly from URL params instead of using useState.
  // This ensures the UI always reflects the current URL state and prevents desync issues.
  //
  // Why not useState?
  // - Back button: URL changes but state doesn't update automatically, causing UI to show
  //   wrong filter (e.g., state="Houses" but URL="All" after back navigation)
  // - Deep linking: Works initially but breaks if URL changes via navigation/back button
  // - Single source of truth: URL already stores the filter value, duplicating it in state
  //   creates two sources of truth that can diverge
  //
  // By deriving from params, the component re-renders when URL changes (via setParams or
  // back button) and selectedCategory automatically recalculates to match the current URL.
  const selectedCategory = params.filter || "All";

  const router = useRouter();

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      router.setParams({ filter: "All" });
      return;
    }

    router.setParams({ filter: category });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-3 mb-2"
    >
      {categories.map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${selectedCategory === item.category ? "bg-primary-300" : "bg-primary-100 border border-primary-200"}`}
          onPress={() => handleCategoryPress(item.category)}
        >
          <Text
            className={`text-sm ${selectedCategory === item.category ? "text-white font-rubik-bold mt-0.5" : "text-black-300 font-rubik"}`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Filters;
