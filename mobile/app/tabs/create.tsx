import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import styles from '../../styles/create.styles.js';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors.js';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import { useAuthStore } from '../../store/authStore.js';

import BASE_URL from "../../lib/config.js";

export default function Create() {
    const [title,setTitle]= useState("");
    const [caption,setCaption]= useState("");
    const [rating,setRating]= useState(3);
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading,setLoading]= useState(false);


    const router = useRouter();
    const {token}=useAuthStore();
    console.log(token);

    const pickImage = async () => {
  try {
    // Request permission if needed
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permission to upload an image");
        return;
      }
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:"images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // lower quality for smaller imageBase64
      base64: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      // If base64 is provided by picker, use it
      if (result.assets[0].base64) {
        setImageBase64(result.assets[0].base64);
      } else {
        // Convert to base64 manually
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64' as any,
        });
        setImageBase64(base64);
      }
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to pick the image.");
  }
};

    const handleSubmit = async () => {
  if (!title || !caption || !imageBase64 || !rating) {
    Alert.alert("Error", "Please fill in all fields");
    return;
  }

  if (!token) {
    Alert.alert("Unauthorized", "Please log in first");
    router.replace("/auth");
    return;
  }

  try {
    setLoading(true);

    // Prepare image for Cloudinary
    const uriParts = image?.split(".");
    const fileType = uriParts ? uriParts[uriParts.length - 1] : "jpeg";
    const imageDataUrl = `data:image/${fileType.toLowerCase()};base64,${imageBase64}`;

    const response = await fetch(`${BASE_URL}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token?.trim()}`,
      },
      body: JSON.stringify({
        title,
        caption,
        rating: rating.toString(),
        image: imageDataUrl,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Something went wrong");

    Alert.alert("Success", "Book recommendation posted!");
    setTitle("");
    setCaption("");
    setRating(3);
    setImage(null);
    setImageBase64(null);
    router.push("/tabs");
  } catch (error: any) {
    console.log("Error creating post", error);
    Alert.alert("Error", error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


    const renderRatingPicker = ()=>{
      const stars=[];
      for(let i=1; i<=5;i++){
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
          name={i<=rating ? "star":"star-outline"}
          size={32}
          color={i<= rating? "#f4b400":COLORS.textSecondary}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{stars}</View>
  }
  return (
    <KeyboardAvoidingView 
      style={{ flex:1}}
      behavior={Platform.OS==="ios"?"padding":"height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/*Header */}
          <View style={styles.header}>
          <Text style={styles.title}>Add Book recommendation</Text>
          <Text style={styles.subtitle}>Share your favorite reads with others</Text>
          </View>
          {/*Form */}
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                name='book-outline'
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
                />
                <TextInput
                style={styles.input}
                placeholder='Enter book title'
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={setTitle}
                />
              </View>
            </View>
            {/*Reating */}
            <View style={styles.formGroup}>
              <Text style={styles.title}>Your Rating</Text>
              {renderRatingPicker()}
            </View>
            {/*Image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ?(
                  <Image source={{uri: image}} style={styles.previewImage}/>
                ):(
                  <View style={styles.placeholderContainer}>
                    <Ionicons name='image-outline' size={40} color={COLORS.textSecondary}/>
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
             {/*Caption */}
             <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput
                style={styles.textArea}
                placeholder='Write your review or thoughts about this book...'
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
                />
             </View>
             {/*Submit */}
             <TouchableOpacity style={styles.button} onPress={handleSubmit}
             disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white}/>
              ):(
                <>
                <Ionicons name='cloud-upload-outline'
                size={20}
                color={COLORS.white}
                style={styles.buttonText}
                />
                <Text style={styles.buttonText}> Share </Text>
                </>
              )}
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}