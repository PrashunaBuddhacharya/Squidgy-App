import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, Platform, KeyboardAvoidingView, SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; 
import { auth, db } from '../src/services/firebaseConfig';
import { ref, update } from 'firebase/database';
import { COLORS } from '../src/constants/theme';
import { 
  User, Weight, Activity, HeartPulse,
  Sun, Moon, ChevronRight, Dumbbell, Footprints, Coffee, Clock
} from 'lucide-react-native';

export default function Onboarding() {
  const router = useRouter();

  // 1. Profile States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [forgetfulness, setForgetfulness] = useState('medium');
  const [activity, setActivity] = useState('low');

  // 2. Wake Time States
  const [wakeH, setWakeH] = useState('07');
  const [wakeM, setWakeM] = useState('00');
  const [wakeP, setWakeP] = useState('AM');

  // 3. Sleep Time States
  const [sleepH, setSleepH] = useState('10');
  const [sleepM, setSleepM] = useState('00');
  const [sleepP, setSleepP] = useState('PM');

  const hours = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const minutes = ['00','15','30','45'];

  const handleFinish = async () => {
    if (!name || !age || !weight) {
      Alert.alert("Missing Info", "Please provide your name, age, and weight.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    let baseGoal = parseInt(weight) * 35; 
    if (activity === 'walking') baseGoal += 300;
    if (activity === 'active') baseGoal += 600;
    if (activity === 'gym') baseGoal += 1000;
    
    let frequency = 120;
    if (forgetfulness === 'high') frequency = 45;
    if (forgetfulness === 'low') frequency = 180;

    try {
      await update(ref(db, `users/${user.uid}`), {
        username: name,
        age: parseInt(age),
        weight: parseInt(weight),
        activityLevel: activity,
        forgetfulnessLevel: forgetfulness,
        reminderFrequency: frequency,
        wakeTime: `${wakeH}:${wakeM} ${wakeP}`,
        sleepTime: `${sleepH}:${sleepM} ${sleepP}`,
        dailyGoal: Math.round(baseGoal),
        currentIntake: 0,
        bottleLevel: 0,
        onboardingCompleted: true,
      });
      router.replace('/dashboard');
    } catch (e) {
      Alert.alert("Error", "Could not save profile.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>Personalize Your Goal</Text>
          <Text style={styles.subtitle}>Help Squidgy calculate the best hydration for you.</Text>

          {/* SECTION: NAME */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <User color={COLORS.navy} size={20} />
              <TextInput style={styles.textInput} placeholder="Enter name" placeholderTextColor="#A0AEC0" value={name} onChangeText={setName}/>
            </View>
          </View>

          {/* SECTION: AGE & WEIGHT */}
          <View style={styles.row}>
            <View style={{width: '48%'}}>
              <Text style={styles.sectionLabel}>Age</Text>
              <View style={styles.inputBox}>
                <Clock color={COLORS.navy} size={20} />
                <TextInput style={styles.textInput} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge}/>
              </View>
            </View>
            <View style={{width: '48%'}}>
              <Text style={styles.sectionLabel}>Weight (kg)</Text>
              <View style={styles.inputBox}>
                <Weight color={COLORS.navy} size={20} />
                <TextInput style={styles.textInput} placeholder="Kg" keyboardType="numeric" value={weight} onChangeText={setWeight}/>
              </View>
            </View>
          </View>

          {/* SECTION: FORGETFULNESS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How often do you forget to drink?</Text>
            <View style={styles.pillContainer}>
              {['high', 'medium', 'low'].map((lvl) => (
                <TouchableOpacity 
                  key={lvl}
                  onPress={() => setForgetfulness(lvl)}
                  style={[styles.pillBtn, forgetfulness === lvl && styles.pillBtnActive]}
                >
                  <Text style={[styles.pillText, forgetfulness === lvl && {color: 'white'}]}>
                    {lvl === 'high' ? 'Often' : lvl === 'medium' ? 'Sometimes' : 'Rarely'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SECTION: ACTIVENESS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Activity Level</Text>
            <View style={styles.grid}>
               <ActivityCard icon={<Coffee size={20}/>} label="Low" active={activity==='low'} onPress={()=>setActivity('low')} />
               <ActivityCard icon={<Footprints size={20}/>} label="Walking" active={activity==='walking'} onPress={()=>setActivity('walking')} />
               <ActivityCard icon={<Activity size={20}/>} label="Active" active={activity==='active'} onPress={()=>setActivity('active')} />
               <ActivityCard icon={<Dumbbell size={20}/>} label="Athlete" active={activity==='gym'} onPress={()=>setActivity('gym')} />
            </View>
          </View>

          {/* SECTION: WAKE TIME */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Wake Up Time</Text>
            <View style={styles.timeControlRow}>
              <Sun color={COLORS.primary} size={22} style={{marginRight: 10}} />
              <TimeDropdownPill value={wakeH} onValueChange={setWakeH} items={hours} />
              <Text style={styles.timeSeparator}>:</Text>
              <TimeDropdownPill value={wakeM} onValueChange={setWakeM} items={minutes} />
              <View style={{width: 10}} />
              <TimeDropdownPill value={wakeP} onValueChange={setWakeP} items={['AM', 'PM']} />
            </View>
          </View>

          {/* SECTION: SLEEP TIME */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sleep Time</Text>
            <View style={styles.timeControlRow}>
              <Moon color={COLORS.secondary} size={22} style={{marginRight: 10}} />
              <TimeDropdownPill value={sleepH} onValueChange={setSleepH} items={hours} />
              <Text style={styles.timeSeparator}>:</Text>
              <TimeDropdownPill value={sleepM} onValueChange={setSleepM} items={minutes} />
              <View style={{width: 10}} />
              <TimeDropdownPill value={sleepP} onValueChange={setSleepP} items={['AM', 'PM']} />
            </View>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Create My Plan</Text>
            <ChevronRight color="white" size={24} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Sub-component: Time Dropdown Pill
const TimeDropdownPill = ({ value, onValueChange, items }) => (
  <View style={styles.pillWrapper}>
    <Picker
      selectedValue={value}
      onValueChange={onValueChange}
      style={styles.actualPicker}
      mode="dropdown"
      dropdownIconColor="#000"
    >
      {items.map(i => <Picker.Item key={i} label={i} value={i} color="#000000" />)}
    </Picker>
  </View>
);

// Sub-component: Activity Card
const ActivityCard = ({ icon, label, active, onPress }) => (
  <TouchableOpacity style={[styles.actCard, active && styles.actCardActive]} onPress={onPress}>
    <View style={[styles.actIconCircle, active && {backgroundColor: 'white'}]}>
      {React.cloneElement(icon, { color: active ? COLORS.primary : COLORS.navy })}
    </View>
    <Text style={[styles.actLabel, active && {color: 'white'}]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 25 },
  title: { fontSize: 26, fontFamily: 'Quicksand-Bold', color: COLORS.navy, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 25, marginTop: 5 },
  
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontFamily: 'Quicksand-Bold', color: COLORS.navy, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    height: 60, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EDF2F7' 
  },
  textInput: { flex: 1, marginLeft: 10, fontSize: 16, fontFamily: 'Quicksand-Bold', color: '#000' },

  pillContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 5, borderRadius: 25 },
  pillBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
  pillBtnActive: { backgroundColor: COLORS.secondary },
  pillText: { fontSize: 13, fontFamily: 'Quicksand-Bold', color: COLORS.navy },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actCard: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 25, padding: 15, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  actCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  actIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actLabel: { fontFamily: 'Quicksand-Bold', fontSize: 13, color: COLORS.navy },

  // TIME PICKER FIXED UI
  timeControlRow: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    padding: 12, borderRadius: 25, borderWidth: 1, borderColor: '#EDF2F7' 
  },
  pillWrapper: { 
    flex: 1, backgroundColor: '#E2E8F0', height: 45, borderRadius: 15, 
    overflow: 'hidden', justifyContent: 'center' 
  },
  actualPicker: { width: '100%', color: '#000' },
  timeSeparator: { fontSize: 20, fontFamily: 'Quicksand-Bold', color: '#000', marginHorizontal: 8 },

  finishBtn: { 
    backgroundColor: COLORS.primary, height: 70, borderRadius: 35, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    marginTop: 20, marginBottom: 40, elevation: 5, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10
  },
  finishBtnText: { color: 'white', fontSize: 18, fontFamily: 'Quicksand-Bold', marginRight: 10 }
});