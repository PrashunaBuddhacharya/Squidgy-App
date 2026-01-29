import React, { useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Quicksand_400Regular, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Droplet } from 'lucide-react-native';

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

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.card}>
        <Droplet color="white" size={50} fill="white" />
        <Text style={styles.title}>Squidgy</Text>
        <Text style={styles.subtitle}>It works!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#4A90E2', width: '100%', borderRadius: 30, padding: 40, alignItems: 'center' },
  title: { fontFamily: 'Quicksand-Bold', fontSize: 32, color: 'white', marginTop: 10 },
  subtitle: { fontFamily: 'Quicksand-Regular', fontSize: 18, color: 'white', opacity: 0.8 },
});