import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

export default function ScanDocScreen() {
  const router = useRouter();
  const [status, setStatus] = useState('Align document within frame');
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Simulation workflow
    const t1 = setTimeout(() => setStatus('Detecting edges...'), 1000);
    const t2 = setTimeout(() => setStatus('Scanning document...'), 2000);
    const t3 = setTimeout(() => setStatus('Processing AI extraction...'), 3500);
    const t4 = setTimeout(() => {
      router.push('/document');
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600]
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Document</Text>
        <View style={{width: 40}} />
      </View>

      {/* Viewfinder */}
      <View style={styles.cameraView}>
        <View style={styles.viewfinder}>
          {/* Corners */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          
          {/* Scanner Line */}
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          
          <View style={styles.documentGhost}>
            <Text style={{color: 'rgba(255,255,255,0.2)', fontSize: 40, fontWeight: 'bold'}}>+</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.captureBtn} onPress={() => router.push('/document')}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <Text style={{color: '#718096', marginTop: 16, fontFamily: 'Inter_400Regular'}}>Auto-capture is on</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, zIndex: 10 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  title: { color: '#FFFFFF', fontFamily: 'Sora_600SemiBold', fontSize: 16 },
  
  cameraView: { flex: 1, position: 'relative', marginTop: 16, marginBottom: 16, marginHorizontal: 16 },
  
  viewfinder: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  documentGhost: { position: 'absolute', opacity: 0.5, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', width: '90%', height: '90%', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3182CE' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },

  scanLine: { width: '100%', height: 2, backgroundColor: '#38A169', shadowColor: '#38A169', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5, position: 'absolute', top: 0, zIndex: 10 },

  statusContainer: { position: 'absolute', bottom: 32, width: '100%', alignItems: 'center' },
  statusBox: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  statusText: { color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 14 },

  footer: { padding: 32, alignItems: 'center', justifyContent: 'center', paddingBottom: 64 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFFFFF' }
});
