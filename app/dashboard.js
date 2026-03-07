import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  TextInput, Alert, ActivityIndicator, Modal, Animated, Easing, Image, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Svg, { Path, Defs, ClipPath, Circle } from 'react-native-svg';
import { auth, db } from '../src/services/firebaseConfig';
import { ref, onValue, update, increment } from 'firebase/database';
import { COLORS } from '../src/constants/theme';
import { Droplet, Bell, Target, Droplets, Thermometer, Clock, Check, Home, BarChart2, Trophy, Settings, X } from 'lucide-react-native';

// --- MASCOT ASSETS (Placeholders for Elephant) ---
const MASCOT_HAPPY = "https://cdn-icons-png.flaticon.com/512/4392/4392471.png"; // Elephant 1
const MASCOT_SAD = "https://cdn-icons-png.flaticon.com/512/4392/4392505.png";   // Elephant 2
const MASCOT_NEUTRAL = "https://cdn-icons-png.flaticon.com/512/4392/4392524.png";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [currentIntake, setCurrentIntake] = useState(0);
  const [bottleLevel, setBottleLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  
  // Goal Modal States
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState('');

  // Wave horizontal sliding animation
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, 'users/' + user.uid);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(data);
          setCurrentIntake(data.currentIntake || 0);
          setBottleLevel(data.bottleLevel || 0);
          setNewGoalValue(data.dailyGoal?.toString() || '2000');
        }
        setLoading(false);
      });

      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      return () => unsubscribe();
    }
  }, []);

  // --- LOGIC: ADD WATER MANUALLY ---
  const handleManualAdd = async () => {
    const amt = parseInt(customAmount);
    if (!amt) {
      Alert.alert("How much?", "Please enter ml you drank.");
      return;
    }
    await update(ref(db, `users/${auth.currentUser.uid}`), {
      currentIntake: increment(amt),
      lastUpdated: new Date().toISOString()
    });
    setCustomAmount('');
  };

  // --- LOGIC: SET GOAL MANUALLY ---
  const handleUpdateGoal = async () => {
    const goal = parseInt(newGoalValue);
    if (isNaN(goal)) return;

    if (goal < 1500) {
      Alert.alert("Low Goal Warning", "Goals below 1500ml are not recommended for adults.");
    } else if (goal > 4500) {
      Alert.alert("High Goal Warning", "Goals over 4500ml carry water intoxication risks.");
    }

    await update(ref(db, `users/${auth.currentUser.uid}`), { dailyGoal: goal });
    setGoalModalVisible(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary}/></View>;

  const goal = userData?.dailyGoal || 2000;
  const progress = Math.min(currentIntake / goal, 1);
  
  // Mascot Logic
  let mascotImg = MASCOT_NEUTRAL;
  let mascotMsg = "Doing great! Keep it up.";
  let moodColor = "#F0F7FF";

  if (progress >= 0.8) {
    mascotImg = MASCOT_HAPPY;
    mascotMsg = "Yeah! You are near the goal!";
  } else if (progress < 0.4) {
    mascotImg = MASCOT_SAD;
    mascotMsg = "You need to hydrate! Squidgy is thirsty.";
    moodColor = "#FFF5F5";
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greet}>Hey, {userData?.username || 'suman'}!</Text>
            <View style={styles.weatherRow}>
               <Thermometer color={COLORS.primary} size={14} />
               <Text style={styles.weatherText}>Bhaktapur 21°C | Ideal Temperature</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.targetBtn} onPress={() => setGoalModalVisible(true)}>
            <Target color={COLORS.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* MASCOT SECTION */}
        <View style={[styles.mascotBox, {backgroundColor: moodColor}]}>
          <Image source={{ uri: mascotImg }} style={styles.mascotImg} />
          <Text style={styles.mascotMsg}>{mascotMsg}</Text>
        </View>

        {/* PROGRESS CIRCLE WITH REAL WAVE */}
        <View style={styles.circleWrapper}>
          <View style={styles.circleOuter}>
            <Svg height="240" width="240" style={styles.svgContainer}>
              <Defs>
                <ClipPath id="clip">
                  <Circle cx="120" cy="120" r="110" />
                </ClipPath>
              </Defs>
              
              {/* This is the Liquid Wave */}
              <Animated.View style={[
                styles.waveContainer,
                { transform: [{ translateX: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [-240, 0] }) }] }
              ]}>
                <Svg height="240" width="480">
                  <Path
                    d={`M 0 100 Q 60 70 120 100 T 240 100 Q 300 70 360 100 T 480 100 V 240 H 0 Z`}
                    fill="#5E81F4"
                    clipPath="url(#clip)"
                    translateY={240 - (progress * 240)} // This moves the water up
                  />
                </Svg>
              </Animated.View>
            </Svg>

            {/* TEXT ON TOP */}
            <View style={styles.textOverlay}>
              <Text style={styles.drankLarge}>{currentIntake}</Text>
              <Text style={styles.totalSmall}>OF {goal} ML</Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DRANK</Text>
            <Text style={styles.statVal}>{currentIntake}ml</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>LEFT</Text>
            <Text style={[styles.statVal, {color: COLORS.primary}]}>{Math.max(0, goal - currentIntake)}ml</Text>
          </View>
        </View>

        <View style={styles.timeInfoRow}>
          <Clock size={14} color="#A0AEC0" />
          <Text style={styles.timeInfoText}>3h 52m left to complete goal</Text>
        </View>

        {/* BOTTLE STATUS CARD */}
        <View style={[styles.bottleCard, bottleLevel < 200 && styles.bottleWarning]}>
          <Droplets color={bottleLevel < 200 ? '#E53E3E' : COLORS.primary} size={28} />
          <View style={{marginLeft: 15, flex: 1}}>
            <Text style={styles.bottleTitle}>Bottle Status: {bottleLevel}ml</Text>
            <Text style={styles.bottleSub}>Refill your bottle now!</Text>
          </View>
        </View>

        {/* MANUAL INPUT */}
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

      {/* GOAL MODAL */}
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
              style={styles.modalIn} keyboardType="numeric"
              value={newGoalValue} onChangeText={setNewGoalValue}
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateGoal}>
              <Text style={styles.saveBtnText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* NAVIGATION TAB BAR */}
      <View style={styles.tabBar}>
        <Home color={COLORS.primary} size={24} />
        <BarChart2 color="#CBD5E0" size={24} />
        <Trophy color="#CBD5E0" size={24} />
        <Settings color="#CBD5E0" size={24} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 25, paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greet: { fontSize: 24, fontFamily: 'Quicksand-Bold', color: '#000' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  weatherText: { fontSize: 12, color: '#718096', marginLeft: 5, fontFamily: 'Quicksand-Bold' },
  targetBtn: { backgroundColor: '#F7FAFC', padding: 12, borderRadius: 20 },

  mascotBox: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 25, marginBottom: 25 },
  mascotImg: { width: 60, height: 60, marginRight: 15 },
  mascotMsg: { flex: 1, fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },

  // WAVE CIRCLE FIX
  circleWrapper: { alignItems: 'center', marginVertical: 20 },
  circleOuter: { 
    width: 240, height: 240, borderRadius: 120, backgroundColor: '#F0F4FF', 
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#EDF2F7', elevation: 5 
  },
  svgContainer: { position: 'absolute', top: 0 },
  waveContainer: { position: 'absolute', width: 480, height: 240, bottom: 0 },
  textOverlay: { zIndex: 10, alignItems: 'center' },
  drankLarge: { fontSize: 60, fontFamily: 'Quicksand-Bold', color: '#000' },
  totalSmall: { fontSize: 14, color: '#718096', fontFamily: 'Quicksand-Bold', marginTop: -5 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  statBox: { width: '48%', backgroundColor: '#F7FAFC', padding: 20, borderRadius: 25, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#A0AEC0', fontFamily: 'Quicksand-Bold', marginBottom: 5 },
  statVal: { fontSize: 20, color: '#000', fontFamily: 'Quicksand-Bold' },

  timeInfoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  timeInfoText: { fontSize: 13, color: '#A0AEC0', fontFamily: 'Quicksand-Bold', marginLeft: 6 },

  bottleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', padding: 22, borderRadius: 30, marginTop: 25, borderWidth: 1, borderColor: '#FED7D7' },
  bottleTitle: { fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },
  bottleSub: { fontSize: 13, color: '#718096' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', height: 75, borderRadius: 35, paddingLeft: 25, marginTop: 25, borderWidth: 1, borderColor: '#EDF2F7' },
  manualInput: { flex: 1, fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },
  addBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#5E81F4', justifyContent: 'center', alignItems: 'center', marginRight: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', padding: 30, borderRadius: 35, alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'Quicksand-Bold' },
  modalIn: { width: '100%', height: 60, backgroundColor: '#F7FAFC', borderRadius: 20, textAlign: 'center', fontSize: 28, fontFamily: 'Quicksand-Bold', color: '#000', marginBottom: 20 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 25 },
  saveBtnText: { color: 'white', fontFamily: 'Quicksand-Bold' },

  tabBar: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 85, backgroundColor: 'white', borderRadius: 45, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 }
});