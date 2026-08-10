import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlaskConical, ReceiptText, Sparkles, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type DocumentType = 'bill' | 'lab';

export default function ScanDocScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const documentType: DocumentType = params.type === 'bill' ? 'bill' : 'lab';
  const [status, setStatus] = useState('Position the full document inside the frame');
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const isBill = documentType === 'bill';
  const targetRoute = isBill ? '/bill' : '/document';

  useEffect(() => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    scanAnimation.start();

    const edgeTimer = setTimeout(() => setStatus('Document detected - checking clarity'), 1100);
    const captureTimer = setTimeout(() => setStatus('Captured - extracting text'), 2300);
    const groundingTimer = setTimeout(
      () => setStatus(isBill ? 'Matching terms with the hospital glossary' : 'Matching values with hospital reference ranges'),
      3400,
    );
    const resultTimer = setTimeout(() => router.replace(targetRoute), 5000);

    return () => {
      scanAnimation.stop();
      clearTimeout(edgeTimer);
      clearTimeout(captureTimer);
      clearTimeout(groundingTimer);
      clearTimeout(resultTimer);
    };
  }, [isBill, router, scanLineAnim, targetRoute]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 330],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close document scanner"
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X color="#FFFFFF" size={22} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>ALALAY DOCUMENT ASSISTANT</Text>
          <Text style={styles.title}>{isBill ? 'Scan hospital bill' : 'Scan lab result'}</Text>
        </View>
        <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>
      </View>

      <View style={styles.body}>
        <View style={styles.contextCard}>
          <View style={[styles.contextIcon, { backgroundColor: isBill ? '#4B391F' : '#173B55' }]}>
            {isBill ? <ReceiptText color="#F4C46C" size={23} /> : <FlaskConical color="#8BC8F5" size={23} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contextTitle}>{isBill ? 'Billing explanation mode' : 'Lab comparison mode'}</Text>
            <Text style={styles.contextDescription}>
              {isBill
                ? 'Terms will be explained using the selected hospital\'s billing glossary.'
                : 'Values will be compared only with the hospital ranges provided.'}
            </Text>
          </View>
        </View>

        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <View style={styles.documentPreview}>
            <View style={styles.documentHeaderLine} />
            <View style={styles.documentLine} />
            <View style={[styles.documentLine, { width: '76%' }]} />
            <View style={styles.documentDivider} />
            <View style={[styles.documentLine, { width: '86%' }]} />
            <View style={[styles.documentLine, { width: '64%' }]} />
            <View style={styles.documentDivider} />
            <View style={[styles.documentLine, { width: '78%' }]} />
          </View>

          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.processingIcon}><Sparkles color="#7DE0CB" size={18} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>PROCESSING</Text>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.demoButton}
          onPress={() => router.replace(targetRoute)}
        >
          <Text style={styles.demoButtonText}>Use Seeded Demo Document</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>For the pitch, this uses the hospital's prepared sample document.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1820' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 16 },
  closeButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#1C2B34', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, marginHorizontal: 13 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: '#7DE0CB', marginBottom: 3 },
  title: { fontFamily: 'Sora_600SemiBold', fontSize: 17, color: '#FFFFFF' },
  demoBadge: { backgroundColor: '#243640', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  demoBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.8, color: '#B8C8CE' },
  body: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 24 },
  contextCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#14262F', borderWidth: 1, borderColor: '#243B46', borderRadius: 17, padding: 14, marginBottom: 15 },
  contextIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  contextTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  contextDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: '#AFC1C8', marginTop: 3 },
  viewfinder: { flex: 1, minHeight: 350, position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 24, backgroundColor: '#101F27' },
  documentPreview: { width: '72%', height: '82%', maxWidth: 330, backgroundColor: '#EEF2F1', borderRadius: 10, padding: 28, justifyContent: 'center' },
  documentHeaderLine: { width: '48%', height: 10, borderRadius: 5, backgroundColor: '#8CA09B', marginBottom: 24 },
  documentLine: { width: '100%', height: 7, borderRadius: 4, backgroundColor: '#C7D2CF', marginBottom: 12 },
  documentDivider: { width: '100%', height: 1, backgroundColor: '#BAC8C4', marginVertical: 13 },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: '#7DE0CB', zIndex: 3 },
  topLeft: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  topRight: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bottomLeft: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  bottomRight: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
  scanLine: { position: 'absolute', top: 18, left: 22, right: 22, height: 2, borderRadius: 2, backgroundColor: '#7DE0CB', shadowColor: '#7DE0CB', shadowOpacity: 0.8, shadowRadius: 10 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#14262F', borderRadius: 16, padding: 13, marginTop: 14 },
  processingIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#1B3B3B', alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.1, color: '#7DE0CB' },
  statusText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17, color: '#E2EAEC', marginTop: 2 },
  demoButton: { minHeight: 50, backgroundColor: '#FFFFFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 13 },
  demoButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#173B4A' },
  helperText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#82969E', textAlign: 'center', marginTop: 9 },
});
