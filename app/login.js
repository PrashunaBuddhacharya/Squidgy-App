import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
// Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/services/firebaseConfig';
// Design System
import { COLORS } from '../src/constants/theme';
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // LOGIC: Login, then go STRAIGHT to Dashboard
  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Wait!", "Please enter your email and password.");
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // SUCCESS! Skip onboarding and go directly to the Dashboard
      // We use .replace so the user cannot click "back" to return to the login screen
      router.replace('/dashboard'); 
      
    } catch (error) {
      let errorMessage = "Invalid email or password.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      }
      Alert.alert("Login Failed", errorMessage);
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue tracking your hydration and health goals.</Text>

        {/* Email Input */}
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

        {/* Password Input */}
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

        {/* Login Action Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.buttonText}>Login</Text>
              <LogIn color={COLORS.textNavy} size={20} />
            </>
          )}
        </TouchableOpacity>

        {/* Link back to Signup */}
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.link}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.signupBold}>Sign Up</Text>
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
  signupBold: {
    fontFamily: 'Quicksand-Bold',
    color: COLORS.primary
  }
});