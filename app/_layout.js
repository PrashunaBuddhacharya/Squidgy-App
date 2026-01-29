import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the ugly default top bar
        animation: 'fade',  // Smooth transition
      }}
    />
  );
}