import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabsNavigator from "./TabsNavigator";
import DetailsScreen from "../../screens/DetailsScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Details: { name: string };
};


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
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
