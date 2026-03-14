import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import * as SplashScreen from 'expo-splash-screen';
import { ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../src/constants/theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

SplashScreen.preventAutoHideAsync();

export default function WelcomePage() {
  const router = useRouter();
  
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15, 
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, 
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': Quicksand_400Regular,
    'Quicksand-Bold': Quicksand_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      
      <View style={styles.bubble1} />
      <View style={styles.bubble2} />

      <Animated.View style={[styles.logoContainer, { transform: [{ translateY: floatAnim }] }]}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.card}>
        <Text style={styles.title}>Stay Hydrated</Text>
        <Text style={styles.subtitle}>
          Track water intake and reach goals with ease.
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight color={COLORS.textNavy} size={18} />
        </TouchableOpacity>
      </View>

      
      <TouchableOpacity 
        style={styles.loginLink} 
        onPress={() => router.push('/login')}
      >
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginBold}>Login</Text>
        </Text>
      </TouchableOpacity>
      {/* ---------------------------------- */}

      <Text style={styles.footerText}>IoT Smart Water Companion</Text>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 40, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.secondary + '15', 
    top: '35%',
    left: -20,
    zIndex: -1,
  },
  bubble2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent + '20', 
    top: '45%',
    right: 10,
    zIndex: -1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: -20 
  },
  logoImage: {
    width: width * 0.9, 
    height: 400,
  },
  card: {
    backgroundColor: COLORS.primary,
    width: '90%',
    borderRadius: 60,
    paddingVertical: 50, 
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 26,
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.accent, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 22,
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: COLORS.textNavy,
    marginRight: 10,
  },
  // STYLES FOR THE NEW LOGIN LINK
  loginLink: {
    marginTop: 25,
  },
  loginText: {
    fontFamily: 'Quicksand-Regular',
    color: COLORS.textNavy,
    fontSize: 15,
  },
  loginBold: {
    fontFamily: 'Quicksand-Bold',
    color: COLORS.primary,
  },
  // -------------------------
  footerText: {
    fontFamily: 'Quicksand-Regular',
    color: COLORS.textGrey,
    fontSize: 12,
    position: 'absolute',
    bottom: 40,
  }
});