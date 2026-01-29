import React, { useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import * as SplashScreen from 'expo-splash-screen';
import { Droplet, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../src/constants/theme';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const router = useRouter(); // Initialize the router

  // Load Fonts
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
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Squidgy</Text>
      </View>

      {/* MAIN CARD */}
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Droplet color={COLORS.primary} size={45} fill={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>Stay Hydrated</Text>
        <Text style={styles.subtitle}>Track your water intake and reach your daily goals with ease.</Text>
        
        {/* THIS IS THE CORRECT BUTTON LOCATION */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/onboarding')} // We added this line!
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight color={COLORS.textNavy} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>IoT Smart Bottle Companion</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
  },
  brandName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 24,
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.primary,
    width: '100%',
    borderRadius: SIZES.radius,
    padding: 35,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 90,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.accent, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: COLORS.textNavy,
    marginRight: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontFamily: 'Quicksand-Regular',
    color: COLORS.textGrey,
    fontSize: 14,
  }
});