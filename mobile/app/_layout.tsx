import { Stack, useRouter, useSegments, useRootNavigationState, Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore.js";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

 useEffect(() => {
  if (!navigationState?.key) return; // Wait until router is ready

  const inAuthScreen = segments[0] === "auth";
  const isSigned = !!(user && token);

  // Only navigate after layout is mounted
  setTimeout(() => {
    if (!isSigned && !inAuthScreen) {
       // Not logged in → go to login/signup
      router.replace("/auth");
    } else if (isSigned && inAuthScreen) {
      // Logged in → go to main tabs
      router.replace("/tabs");
    }
  }, 0);
}, [navigationState?.key, user, token, segments]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeScreen>
           <Slot />          
        </SafeScreen>
        <StatusBar barStyle="dark-content" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
