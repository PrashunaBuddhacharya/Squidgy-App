import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  TextInput, Alert, ActivityIndicator, Modal, Animated, Easing, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router'; // For navigating between pages

// Firebase imports
import { auth, db } from '../src/services/firebaseConfig';
import { ref, onValue, update, increment } from 'firebase/database';

// Design & Icons
import { COLORS } from '../src/constants/theme';
import { 
  Droplet, Bell, Target, Droplets, Thermometer, 
  Clock, Check, Home, BarChart2, Trophy, Settings, X, Info 
} from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter(); // Initialize navigation

  // --- STATE MANAGEMENT ---
  const [userData, setUserData] = useState(null);
  const [currentIntake, setCurrentIntake] = useState(0);
  const [bottleLevel, setBottleLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  
  // Goal Modal & Safety States
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState('');
  const [goalError, setGoalError] = useState('');

  // --- ANIMATION VALUES ---
  const waveAnim = useRef(new Animated.Value(0)).current;  // Controls the left-to-right "slosh"
  const heightAnim = useRef(new Animated.Value(0)).current; // Controls the rising water level

  // --- REAL-TIME DATA SYNC ---
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      
      // onValue keeps the app updated automatically if the IoT bottle sends data
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setCurrentIntake(data.currentIntake || 0);
          setBottleLevel(data.bottleLevel || 0);
          setNewGoalValue(data.dailyGoal?.toString() || '2450');
          
          // ANIMATION LOGIC: Calculate how high the water should rise (0 to 240 pixels)
          const goal = data.dailyGoal || 2450;
          const progress = Math.min(data.currentIntake / goal, 1);
          
          Animated.timing(heightAnim, {
            toValue: progress * 240, // Match the height of our circle
            duration: 1500, // Smooth 1.5 second rise
            useNativeDriver: false, // Height doesn't support Native Driver
          }).start();
        }
        setLoading(false);
      });

      // LOOPING WAVE ANIMATION: Moves the SVG path horizontally forever
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      return () => unsubscribe();
    }
  }, []);

  // --- LOGIC: HYDRATION GOAL SAFETY (The +/- 500ml Rule) ---
  const handleUpdateGoal = async () => {
    const enteredGoal = parseInt(newGoalValue);
    
    // We get the scientific goal calculated during onboarding from Firebase
    // If not found, we use a healthy average of 2450ml
    const calculatedBase = userData?.calculatedBaseGoal || 2450; 
    
    // Check the difference between what the user typed and what science recommends
    const diff = Math.abs(enteredGoal - calculatedBase);
    
    if (diff > 500) {
      setGoalError(`⚠️ Safety Limit: Please stay within 500ml of your scientific goal (${calculatedBase}ml).`);
      return;
    }

    setGoalError('');
    await update(ref(db, `users/${auth.currentUser.uid}`), { dailyGoal: enteredGoal });
    setGoalModalVisible(false);
  };

  // --- LOGIC: MANUAL WATER ADD ---
  const handleManualAdd = async () => {
    const amt = parseInt(customAmount);
    if (!amt) return;

    const user = auth.currentUser;
    const today = new Date().toISOString().split('T')[0]; // Result: "2024-05-20"
    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes()}`; // Result: "14:30"

    try {
      // 1. Update Today's Total (For the Blue Circle)
      await update(ref(db, `users/${user.uid}`), {
        currentIntake: increment(amt)
      });

      // 2. Update Weekly History (For the Bar Chart)
      // This creates or updates a node for "2024-05-20"
      await update(ref(db, `users/${user.uid}/history/${today}`), {
        total: increment(amt)
      });

      // 3. Log the specific Sip (For the Hourly Line Chart)
      // This creates a list of sips under today's date
      const sipRef = ref(db, `users/${user.uid}/logs/${today}`);
      await update(sipRef, {
        [Date.now()]: {
          amount: amt,
          time: timestamp
        }
      });

      setCustomAmount('');
      Alert.alert("Logged!", `Added ${amt}ml to your history.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary}/></View>;

  const goal = userData?.dailyGoal || 2450;
  const progress = Math.min(currentIntake / goal, 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER: Weather and Profile */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greet}>Hey, {userData?.username || 'Squidgy User'}!</Text>
            <View style={styles.weatherRow}>
               <Thermometer color={COLORS.primary} size={14} />
               <Text style={styles.weatherText}>Bhaktapur 21°C | Ideal Temperature</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.targetBtn} onPress={() => {
            setGoalError('');
            setGoalModalVisible(true);
          }}>
            <Target color={COLORS.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* DYNAMIC MOTIVATION CARD: Changes text based on % drank */}
        <View style={[styles.mascotBox, progress < 0.4 && styles.mascotBoxSad]}>
          <Info color={progress < 0.4 ? "#E53E3E" : COLORS.primary} size={20} />
          <Text style={[styles.mascotMsg, progress < 0.4 && {color: "#E53E3E"}]}>
            {progress >= 0.8 ? "Yeah! You are near the goal!" : 
             progress < 0.4 ? "You need to hydrate! Squidgy recommends drinking now." : 
             "Doing great! Keep the momentum going."}
          </Text>
        </View>

        {/* PROGRESS CIRCLE: Features the rising liquid wave */}
        <View style={styles.circleWrapper}>
          <View style={styles.circleOuter}>
            {/* The rising liquid background - Z-Index 1 */}
            <Animated.View style={[styles.waveFill, { height: heightAnim }]}>
              {/* The Sloshing Surface Wave - Moves horizontally via translate */}
              <Animated.View style={{
                position: 'absolute',
                top: -15, // Sits exactly on the surface of the fill
                width: 480, // Double width so we can slide it
                transform: [{
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-240, 0]
                  })
                }]
              }}>
                <Svg height="30" width="480">
                  <Path
                    d="M 0 15 Q 60 5 120 15 T 240 15 Q 300 5 360 15 T 480 15 V 30 H 0 Z"
                    fill="#5E81F4"
                  />
                </Svg>
              </Animated.View>
            </Animated.View>

            {/* TEXT OVERLAY: Z-Index 10 ensures it stays on top of the water */}
            <View style={styles.textOverlay}>
              <Text style={styles.drankLarge}>{currentIntake}</Text>
              <Text style={styles.totalSmall}>OF {goal} ML</Text>
            </View>
          </View>
        </View>

        {/* STATS SUMMARY */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DRANK</Text>
            <Text style={styles.statValue}>{currentIntake}ml</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LEFT</Text>
            <Text style={[styles.statValue, {color: COLORS.primary}]}>{Math.max(0, goal - currentIntake)}ml</Text>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <Clock size={14} color="#A0AEC0" />
          <Text style={styles.timeInfoText}>3h 52m left to complete goal</Text>
        </View>

        {/* IOT BOTTLE STATUS CARD */}
        <View style={[styles.bottleCard, bottleLevel < 200 && styles.bottleWarning]}>
          <Droplets color={bottleLevel < 200 ? '#E53E3E' : COLORS.primary} size={28} />
          <View style={{marginLeft: 15, flex: 1}}>
            <Text style={styles.bottleTitle}>Bottle Status: {bottleLevel}ml</Text>
            <Text style={styles.bottleSub}>{bottleLevel < 200 ? 'Refill your bottle now!' : 'You have enough water'}</Text>
          </View>
        </View>

        {/* MANUAL ENTRY PILL */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.manualInput}
            placeholder="Log water intake (ml)..."
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="numeric"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleManualAdd}>
            <Droplet color="white" size={24} fill="white" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* GOAL MODAL: Pops up when Target icon is clicked */}
      <Modal visible={isGoalModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Goal</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                <X color="#000" size={24} />
              </TouchableOpacity>
            </View>
            
            <TextInput 
              style={[styles.modalIn, goalError && styles.modalInError]} 
              keyboardType="numeric"
              value={newGoalValue} 
              onChangeText={(val) => {
                setNewGoalValue(val);
                setGoalError('');
              }}
              autoFocus
            />

            {goalError ? <Text style={styles.errorText}>{goalError}</Text> : null}

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateGoal}>
              <Text style={styles.saveBtnText}>Update Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CUSTOM NAVIGATION TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard')}>
          <Home color={COLORS.primary} size={24} />
          <Text style={[styles.tabLabel, {color: COLORS.primary}]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/stats')}>
          <BarChart2 color="#CBD5E0" size={24} />
          <Text style={styles.tabLabel}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/awards')}>
          <Trophy color="#CBD5E0" size={24} />
          <Text style={styles.tabLabel}>Awards</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/settings')}>
          <Settings color="#CBD5E0" size={24} />
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 25, paddingBottom: 150 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greet: { fontSize: 24, fontFamily: 'Quicksand-Bold', color: '#000' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  weatherText: { fontSize: 12, color: '#718096', marginLeft: 5, fontFamily: 'Quicksand-Bold' },
  targetBtn: { backgroundColor: '#F7FAFC', padding: 12, borderRadius: 20 },

  mascotBox: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 25, marginBottom: 25, backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#EDF2F7' },
  mascotBoxSad: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
  mascotMsg: { flex: 1, fontSize: 15, fontFamily: 'Quicksand-Bold', color: '#2C3E50', marginLeft: 12 },

  circleWrapper: { alignItems: 'center', marginVertical: 15 },
  circleOuter: { 
    width: 240, height: 240, borderRadius: 120, backgroundColor: '#F0F4FF', 
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EDF2F7', elevation: 5 
  },
  waveFill: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: '#5E81F4',
    zIndex: 1
  },
  textOverlay: { 
    zIndex: 10, // Keeps numbers on top of the water
    alignItems: 'center', 
    backgroundColor: 'transparent' 
  },
  drankLarge: { fontSize: 60, fontFamily: 'Quicksand-Bold', color: '#000' },
  totalSmall: { fontSize: 14, color: '#718096', fontFamily: 'Quicksand-Bold', marginTop: -5 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  statBox: { width: '48%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 25, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#A0AEC0', fontFamily: 'Quicksand-Bold', marginBottom: 5 },
  statValue: { fontSize: 20, color: '#000', fontFamily: 'Quicksand-Bold' },

  timeInfoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  timeInfoText: { fontSize: 13, color: '#A0AEC0', fontFamily: 'Quicksand-Bold', marginLeft: 6 },

  bottleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', padding: 22, borderRadius: 30, marginTop: 25, borderWidth: 1, borderColor: '#EDF2F7' },
  bottleWarning: { backgroundColor: '#FFF5F5', borderColor: '#FED7D7' },
  bottleTitle: { fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },
  bottleSub: { fontSize: 13, color: '#718096' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', height: 75, borderRadius: 35, paddingLeft: 25, marginTop: 20, borderWidth: 1, borderColor: '#EDF2F7' },
  manualInput: { flex: 1, fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },
  addBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#5E81F4', justifyContent: 'center', alignItems: 'center', marginRight: 8 },

  tabBar: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 85, backgroundColor: 'white', borderRadius: 45, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, fontFamily: 'Quicksand-Bold', color: '#A0AEC0', marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 35, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'Quicksand-Bold' },
  modalIn: { width: '100%', height: 60, backgroundColor: '#F7FAFC', borderRadius: 20, textAlign: 'center', fontSize: 28, fontFamily: 'Quicksand-Bold', color: '#000', marginBottom: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  modalInError: { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' },
  errorText: { color: '#E53E3E', fontSize: 12, fontFamily: 'Quicksand-Bold', textAlign: 'center', marginBottom: 15 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 25 },
  saveBtnText: { color: 'white', fontFamily: 'Quicksand-Bold' },
});