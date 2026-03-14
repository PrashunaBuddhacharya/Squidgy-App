import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from "react-native-gifted-charts";
import Svg, { Polygon, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { auth, db } from '../src/services/firebaseConfig';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { COLORS } from '../src/constants/theme';
import { Calendar, Activity, Zap, Home, BarChart2, Trophy, Settings, LayoutGrid } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function Stats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const historyRef = query(ref(db, `users/${user.uid}/history`), limitToLast(7));
      const unsubscribe = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const processed = Object.keys(data).map(dateKey => {
            const dateObj = new Date(dateKey);
            // Fallback to the key itself if the date is invalid
            const label = isNaN(dateObj) ? dateKey : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
            return {
              value: data[dateKey].total || 0,
              label: label,
              frontColor: (data[dateKey].total >= 2000) ? '#62C1B5' : '#DDE7F5', 
              topLabelComponent: () => (
                <Text style={styles.barTopLabel}>{data[dateKey].total}</Text>
              ),
            };
          });
          setWeeklyData(processed);
        } else {
            // Mock Data perfectly matching UI colors
            setWeeklyData([
                {value: 1600, label: 'Mon', frontColor: '#DDE7F5'},
                {value: 2400, label: 'Tue', frontColor: '#62C1B5', topLabelComponent: () => <Text style={styles.barTopLabel}>2400</Text>},
                {value: 1800, label: 'Wed', frontColor: '#DDE7F5'},
                {value: 2600, label: 'Thu', frontColor: '#62C1B5', topLabelComponent: () => <Text style={styles.barTopLabel}>2600</Text>},
                {value: 2100, label: 'Fri', frontColor: '#62C1B5', topLabelComponent: () => <Text style={styles.barTopLabel}>2100</Text>},
                {value: 1400, label: 'Sat', frontColor: '#DDE7F5'},
                {value: 1100, label: 'Sun', frontColor: '#DDE7F5'},
            ]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary}/></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Health Lab</Text>
          <Text style={styles.subtitle}>Deep dive into your hydration patterns.</Text>
        </View>

        {/* 1. WEEKLY PERFORMANCE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Calendar color={COLORS.secondary} size={20} />
             <Text style={styles.cardTitle}>Weekly Performance</Text>
          </View>
          <View style={styles.chartWrapper}>
            <BarChart
                data={weeklyData}
                barWidth={18}
                spacing={22}
                roundedTop
                roundedBottom
                hideRules
                hideYAxisText
                yAxisThickness={0}
                xAxisThickness={0}
                xAxisLabelTextStyle={styles.axisText}
                noOfSections={3}
                maxValue={3000}
                isAnimated
            />
          </View>
        </View>

        {/* 2. HOURLY INTENSITY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Activity color={COLORS.secondary} size={20} />
             <Text style={styles.cardTitle}>Hourly Intensity</Text>
          </View>
          <LineChart
            areaChart
            curved
            data={[
                {value: 20, label: '8am'}, {value: 45, label: '10am'}, 
                {value: 90, label: '12pm'}, {value: 50, label: '2pm'}, 
                {value: 40, label: '4pm'}, {value: 55, label: '6pm'}, {value: 20, label: '10pm'}
            ]}
            height={150}
            color="#7F9CF5"
            thickness={3}
            startFillColor="rgba(127, 156, 245, 0.3)"
            endFillColor="rgba(127, 156, 245, 0.01)"
            hideRules
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={styles.axisText}
            pointerConfig={{
                pointerStripColor: '#7F9CF5',
                pointerLabelComponent: items => (
                    <View style={styles.tooltip}><Text style={styles.tooltipText}>{items[0].value}%</Text></View>
                ),
            }}
          />
        </View>

        {/* 3. HYDRATION BALANCE (Radar) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <Zap color="#81E6D9" size={20} />
             <Text style={styles.cardTitle}>Hydration Balance</Text>
          </View>
          <View style={styles.radarContainer}>
            {/* Radar Labels */}
            <Text style={[styles.radarLabel, {top: -10}]}>Morning</Text>
            <Text style={[styles.radarLabel, {right: -10, top: 50}]}>Afternoon</Text>
            <Text style={[styles.radarLabel, {right: 10, bottom: -5}]}>Evening</Text>
            <Text style={[styles.radarLabel, {left: 10, bottom: -5}]}>Exercise</Text>
            <Text style={[styles.radarLabel, {left: -10, top: 50}]}>Focus</Text>
            
            <Svg height="160" width="160" viewBox="0 0 100 100">
               {/* Background Pentagon Web */}
               <Polygon points="50,5 95,38 78,92 22,92 5,38" fill="none" stroke="#EDF2F7" strokeWidth="1" />
               <Polygon points="50,25 75,45 65,75 35,75 25,45" fill="none" stroke="#EDF2F7" strokeWidth="1" />
               {/* User Data Polygon */}
               <Polygon points="50,15 85,40 70,85 40,80 20,50" fill="rgba(129, 230, 217, 0.3)" stroke="#81E6D9" strokeWidth="2" />
            </Svg>
          </View>
          <View style={styles.radarLegend}>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#81E6D9'}]}/><Text style={styles.legendText}>YOU</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: '#E2E8F0'}]}/><Text style={styles.legendText}>IDEAL</Text></View>
          </View>
        </View>

        {/* 4. CONSISTENCY HEATMAP */}
        <View style={styles.card}>
           <View style={styles.cardHeader}>
             <LayoutGrid color="#F6AD55" size={20} />
             <Text style={styles.cardTitle}>Consistency Heatmap</Text>
          </View>
          <View style={styles.heatmapGrid}>
             {[...Array(28)].map((_, i) => (
               <View key={i} style={[styles.heatBox, {backgroundColor: i > 14 ? (i % 3 === 0 ? '#7F9CF5' : '#A3BFFA') : '#EDF2F7'}]} />
             ))}
          </View>
          <View style={styles.heatLabelRow}>
            <Text style={styles.heatMinMax}>LESS</Text>
            <View style={styles.heatIndicators}>
                <View style={styles.indicator}/><View style={styles.indicator}/><View style={styles.indicatorActive}/><View style={styles.indicator}/>
            </View>
            <Text style={styles.heatMinMax}>MORE</Text>
          </View>
        </View>

        {/* HEALTH INSIGHT CARD */}
        <View style={styles.insightCard}>
            <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.insightTitle}>Health Insight</Text>
                <Text style={styles.insightSub}>SQUIDGY INTELLIGENCE</Text>
                <Text style={styles.insightBody}>
                    "Your hydration levels dip significantly between <Text style={{color: '#81E6D9'}}>2 PM and 4 PM</Text>. We've scheduled a high-priority buzzer reminder for this window tomorrow."
                </Text>
            </View>
        </View>

      </ScrollView>

      {/* CUSTOM NAV BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/dashboard')}><Home color="#CBD5E0" size={26} /></TouchableOpacity>
        <TouchableOpacity><BarChart2 color="#4A90E2" size={26} /></TouchableOpacity>
        <TouchableOpacity><Trophy color="#CBD5E0" size={26} /></TouchableOpacity>
        <TouchableOpacity><Settings color="#CBD5E0" size={26} /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { marginBottom: 25, paddingLeft: 10 },
  title: { fontSize: 32, fontWeight: '700', color: '#1A202C' },
  subtitle: { fontSize: 15, color: '#718096', marginTop: 4 },

  card: { backgroundColor: 'white', padding: 20, borderRadius: 30, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#2D3748', marginLeft: 10 },
  
  chartWrapper: { alignItems: 'center', justifyContent: 'center', marginLeft: -20 },
  axisText: { fontSize: 11, color: '#A0AEC0', fontWeight: '600' },
  barTopLabel: { fontSize: 10, color: '#A0AEC0', fontWeight: '700', marginBottom: 5 },

  tooltip: { backgroundColor: '#2D3748', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tooltipText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // Radar Styling
  radarContainer: { height: 180, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  radarLabel: { position: 'absolute', fontSize: 11, color: '#718096', fontWeight: '600' },
  radarLegend: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, color: '#A0AEC0', fontWeight: '700' },

  // Heatmap Styling
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  heatBox: { width: 34, height: 34, borderRadius: 8, margin: 4 },
  heatLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingHorizontal: 10 },
  heatMinMax: { fontSize: 11, color: '#CBD5E0', fontWeight: '700' },
  heatIndicators: { flexDirection: 'row', alignItems: 'center' },
  indicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EDF2F7', marginHorizontal: 3 },
  indicatorActive: { width: 14, height: 6, borderRadius: 3, backgroundColor: '#7F9CF5', marginHorizontal: 3 },

  // AI Card Styling
  insightCard: { backgroundColor: '#0F172A', padding: 25, borderRadius: 40, flexDirection: 'row' },
  aiBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  aiText: { color: 'white', fontWeight: '900', fontSize: 12 },
  insightTitle: { color: 'white', fontSize: 19, fontWeight: '700' },
  insightSub: { color: '#4A90E2', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginVertical: 6 },
  insightBody: { color: '#94A3B8', fontSize: 14, lineHeight: 22, fontWeight: '500' },

  // Navbar
  tabBar: { position: 'absolute', bottom: 25, left: 20, right: 20, height: 80, backgroundColor: 'white', borderRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 15 }
});