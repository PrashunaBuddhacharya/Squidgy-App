import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// Firebase Auth service
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
// Design System
import { COLORS } from '../src/constants/theme';
import { Mail, Lock, UserPlus } from 'lucide-react-native';

export default function Signup() {
  const router = useRouter();
  
  // Local State for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // LOGIC: Create the Firebase account and move to Onboarding
  const handleSignup = async () => {
    // Basic validation
    if (!email || !password) {
      return Alert.alert("Wait!", "Please enter both an email and a password.");
    }

    if (password.length < 6) {
      return Alert.alert("Security", "Password should be at least 6 characters.");
    }
    
    setLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Success! Navigate to the Onboarding screen to setup the profile
      // We use router.push because we want them to complete their profile now
      router.push('/onboarding'); 
      
    } catch (error) {
      // Handle Firebase errors (e.g., email already in use)
      let errorMessage = "Something went wrong. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "That email is already registered. Try logging in!";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Squidgy to start your personalized hydration journey.</Text>

        {/* Email Input Box */}
        <View style={styles.inputBox}>
          <Mail color={COLORS.primary} size={20} />
          <TextInput 
            placeholder="Email Address" 
            style={styles.input} 
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={COLORS.textGrey}
          />
        </View>

        {/* Password Input Box */}
        <View style={styles.inputBox}>
          <Lock color={COLORS.primary} size={20} />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={COLORS.textGrey}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSignup} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Get Started</Text>
              <UserPlus color={COLORS.textNavy} size={20} />
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Action: Go to Login */}
        <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.loginBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'white' 
  },
  inner: {
    flex: 1,
    padding: 40, 
    justifyContent: 'center'
  },
  title: { 
    fontFamily: 'Quicksand-Bold', 
    fontSize: 32, 
    color: COLORS.textNavy, 
    marginBottom: 10 
  },
  subtitle: { 
    fontFamily: 'Quicksand-Regular', 
    fontSize: 16, 
    color: COLORS.textGrey, 
    marginBottom: 40 
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: { 
    flex: 1, 
    paddingVertical: 18, 
    paddingHorizontal: 10, 
    fontFamily: 'Quicksand-Regular', 
    fontSize: 16, 
    color: COLORS.textNavy 
  },
  button: {
    backgroundColor: COLORS.accent, // Mint Green
    padding: 20,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // Shadow for the button
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: { 
    fontFamily: 'Quicksand-Bold', 
    fontSize: 18, 
    color: COLORS.textNavy, 
    marginRight: 10 
  },
  link: { 
    marginTop: 30, 
    alignItems: 'center' 
  },
  linkText: { 
    fontFamily: 'Quicksand-Regular', 
    color: COLORS.textGrey, 
    fontSize: 15 
  },
  loginBold: {
    fontFamily: 'Quicksand-Bold',
    color: COLORS.primary
  }
});