import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../../screens/HomeScreen";
import FavoritesScreen from "../../screens/FavoritesScreen";
import CompareScreen from "../../screens/CompareScreen";

export type TabsParamList = {
  Home: undefined;
  Favorites: undefined;
  Compare: undefined; 
};

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { backgroundColor: "#000" },
        headerTitle: route.name,
        tabBarIcon: ({ color, size, focused }) => {
          const name =
            route.name === "Home"
              ? focused
                ? "home"
                : "home-outline"
              : route.name === "Favorites"
                ? focused
                  ? "heart"
                  : "heart-outline"
                : focused
                  ? "git-compare"
                  : "git-compare-outline";
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} />
      <Tabs.Screen name="Compare" component={CompareScreen} />
    </Tabs.Navigator>
  );
}
