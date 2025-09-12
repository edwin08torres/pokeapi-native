import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { AppProviders } from "./app/AppProviders";
import RootNavigator from "./app/navigation/RootNavigator";

export default function App() {
  const scheme = useColorScheme();

  return (
    <AppProviders>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </AppProviders>
  );
}
