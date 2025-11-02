import { View,  Image , Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Alert } from 'react-native'
import styles from '../../styles/login.styles'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { useState } from 'react'
import COLORS from "../../constants/colors.js"; 
import { Link } from 'expo-router'
import { useAuthStore } from '../../store/authStore.js'
import {useRouter } from 'expo-router'

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loading, login } = useAuthStore();

  const router = useRouter();
 

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
  router.replace("/tabs");
} else {
  Alert.alert("Error", result.error);
}

   
};

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior="padding">
    <View style={styles.container}>
     {/*Image*/}
      <View style={styles.topIllustration}>
      <Image 
      source={require('../../assets/images/i.png')} 
      style={styles.illustrationImage} 
      resizeMode="contain" />
      </View>

      {/*Login Form*/}
      <View style={styles.card}>
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.placeholderText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            </View>
          </View>

          {/*password Input*/}
          <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
            name='lock-closed-outline'
            size={20}
            color={COLORS.primary}
            style={styles.inputIcon}
            />
             <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            >
              <Ionicons
              name={showPassword?"eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.primary}
              />
            </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleLogin}
          disabled={loading}> 
            {loading?(
              <ActivityIndicator color="#fff"/>
            ):(
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/*footer*/}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/auth/signup" asChild>
              <Text style={styles.link}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  )
}