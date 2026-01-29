import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { COLORS, SIZES } from './src/constants/theme';
import { Droplet } from 'lucide-react-native'; // Our first icon!

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Quicksand-Regular': Quicksand_400Regular,
    'Quicksand-Bold': Quicksand_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.card}>
        <Droplet color={COLORS.white} size={48} fill={COLORS.white} />
        <Text style={styles.title}>Squidgy</Text>
        <Text style={styles.subtitle}>Clean, Airy, and Hydrated.</Text>
      </View>

      <Text style={styles.footerText}>Folder structure ready!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.primary,
    padding: 40,
    borderRadius: SIZES.radius,
    width: '100%',
    alignItems: 'center',
    // Soft Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: SIZES.fontTitle,
    color: COLORS.white,
    marginTop: 15,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: SIZES.fontSubtitle,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 5,
  },
  footerText: {
    position: 'absolute',
    bottom: 50,
    fontFamily: 'Quicksand-Regular',
    color: COLORS.textGrey,
  }
});