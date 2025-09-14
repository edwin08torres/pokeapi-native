import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";

import TabsNavigator, { TabsParamList } from "./TabsNavigator";
import DetailsScreen from "../../screens/DetailsScreen";
import { MyLightTheme, MyDarkTheme } from "../../theme/navigationTheme";

export type RootStackParamList = {
  Tabs: { screen?: keyof TabsParamList } | undefined;
  Details: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? MyDarkTheme : MyDarkTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={TabsNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: "Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
