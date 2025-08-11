import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import HomeScreen from "../../screens/HomeScreen";
import FavoritesScreen from "../../screens/FavoritesScreen";

export type TabsParamList = { Home: undefined; Favorites: undefined };
type IconName = ComponentProps<typeof Ionicons>["name"];

const Tabs = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { backgroundColor: "#fff" },
        headerTitle: route.name,
        tabBarIcon: ({ color, size, focused }) => {
          let name: IconName =
            route.name === "Home"
              ? focused
                ? "home"
                : "home-outline"
              : focused
                ? "heart"
                : "heart-outline";
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} />
    </Tabs.Navigator>
  );
}
