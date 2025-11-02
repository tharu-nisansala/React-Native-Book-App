import { View, Text, KeyboardAvoidingView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React from 'react'
import styles from '@/styles/login.styles'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { useState } from 'react'
import COLORS from "../../constants/colors.js"; 
import {useRouter } from 'expo-router'
import {useAuthStore} from '../../store/authStore.js'

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const {user, loading, register} = useAuthStore();

   console.log("user is here:", user)

  const router = useRouter();

 const handleSignup = async () => {
  const result = await register(username, email, password);

  if (result.success) {
  router.replace("/tabs");
} else {
  Alert.alert("Error", result.error);
}

 
};


  return (
    <KeyboardAvoidingView style={{flex:1}} behavior="padding">
      <View style={styles.container}>
        <View style={styles.card}>
          {/*header*/}
          <View style={styles.header}>
            <Text style={styles.title}>BookWorm 📚</Text>
            <Text style={styles.subtitle}>Create a new account</Text>
          </View>
          <View style={styles.formContainer}>
            {/* Add your form fields here */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={COLORS.placeholderText}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>
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
          <TouchableOpacity style={styles.button} onPress={handleSignup}
          disabled={loading}> 
            {loading?(
              <ActivityIndicator color="#fff"/>
            ):(
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/*footer*/}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
           <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Login</Text>
           </TouchableOpacity>

          </View>
        </View>
        </View>
      </View>
      </KeyboardAvoidingView>
  )
}