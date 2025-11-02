import { useAuthStore } from "../store/authStore.js";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {

  const {user,token, checkAuth, logout} = useAuthStore()

  console.log(user, token);

  useEffect(()=>{
    checkAuth()
  },[])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>hello{user?.username}</Text>
      <Text>hello{token}</Text>
      <Text>hello</Text>
      <TouchableOpacity onPress={logout}>
        <Text>logout</Text>
      </TouchableOpacity>
      <Link href="/auth">Go to Login</Link>
      <Link href="/auth/signup">Go to Sign Up</Link>
    </View>
  );
}
