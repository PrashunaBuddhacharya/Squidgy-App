import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../src/constants/theme';
import { ChevronRight } from 'lucide-react-native';

export default function Onboarding() {
  const router = useRouter();
  
  // State for user input
  const [weight, setWeight] = useState('');
  const [name, setName] = useState('');

  // Simple math for water goal
  const calculateGoal = () => {
    const numericWeight = parseFloat(weight);
    if (!numericWeight) return 0;
    return Math.round(numericWeight * 35); // Standard formula: 35ml per kg
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Welcome to Squidgy! 👋</Text>
        <Text style={styles.subtitle}>Let's calculate your daily hydration goal.</Text>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What should we call you?</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Weight (kg)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 70"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* Real-time Calculation Display */}
        {weight > 0 && (
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>Your Daily Goal:</Text>
            <Text style={styles.goalValue}>{calculateGoal()} mL</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, !weight && { opacity: 0.5 }]} 
          disabled={!weight}
          onPress={() => alert(`Saved! Goal is ${calculateGoal()}ml`)}
        >
          <Text style={styles.buttonText}>Continue to Login</Text>
          <ChevronRight color={COLORS.textNavy} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 30, flex: 1, justifyContent: 'center' },
  title: { fontFamily: 'Quicksand-Bold', fontSize: 28, color: COLORS.textNavy, marginBottom: 10 },
  subtitle: { fontFamily: 'Quicksand-Regular', fontSize: 16, color: COLORS.textGrey, marginBottom: 40 },
  inputGroup: { marginBottom: 25 },
  label: { fontFamily: 'Quicksand-Bold', fontSize: 16, color: COLORS.textNavy, marginBottom: 10 },
  input: {
    backgroundColor: '#F7FAFC',
    padding: 15,
    borderRadius: 15,
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalCard: {
    backgroundColor: COLORS.accent + '30', // Mint with transparency
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  goalLabel: { fontFamily: 'Quicksand-Regular', color: COLORS.textNavy },
  goalValue: { fontFamily: 'Quicksand-Bold', fontSize: 32, color: COLORS.primary },
  button: {
    backgroundColor: COLORS.accent,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontFamily: 'Quicksand-Bold', fontSize: 18, color: COLORS.textNavy, marginRight: 10 },
});