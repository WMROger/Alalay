import { Href, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  FileText,
  FlaskConical,
  HeartHandshake,
  ReceiptText,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = {
  background: '#F4F7F6',
  surface: '#FFFFFF',
  ink: '#18312B',
  muted: '#667B75',
  line: '#DCE7E3',
  primary: '#137A67',
  primarySoft: '#E6F5F1',
  navy: '#173B4A',
  amber: '#AD6500',
  amberSoft: '#FFF3DD',
  red: '#B83A3A',
  redSoft: '#FFF0F0',
};

type AskDestination = {
  id: string;
  title: string;
  description: string;
  action: string;
  route: Href;
  keywords: string[];
  icon: ReactNode;
};

type AskResult = AskDestination | {
  id: 'urgent';
  title: string;
  description: string;
  action: string;
  route: Href;
  urgent: true;
};

const destinations: AskDestination[] = [
  {
    id: 'bill',
    title: 'Hospital bill',
    description: 'Review the sample bill breakdown and ask grounded questions about totals, PhilHealth, HMO, and the remaining balance.',
    action: 'Open Bill Explainer',
    route: '/bill',
    keywords: ['bill', 'billing', 'charge', 'charges', 'balance', 'owe', 'pay', 'payment', 'cost', 'hmo', 'maxicare', 'cf1', 'deduction'],
    icon: <ReceiptText color="#AD6500" size={21} />,
  },
  {
    id: 'lab',
    title: 'Lab result',
    description: 'Compare values only with the reference ranges printed on the sample hospital report.',
    action: 'Open Lab Explainer',
    route: '/document',
    keywords: ['lab', 'laboratory', 'blood', 'cbc', 'wbc', 'hemoglobin', 'platelet', 'result', 'test value'],
    icon: <FlaskConical color="#246BCE" size={21} />,
  },
  {
    id: 'admission',
    title: 'Admission guide',
    description: 'See what is complete, what needs attention, and where to go next after hospital check-in.',
    action: 'Open Admission Guide',
    route: '/admission',
    keywords: ['admission', 'admit', 'check-in', 'check in', 'room', 'consent', 'status', 'next step', 'where do i go'],
    icon: <ClipboardCheck color="#7655B5" size={21} />,
  },
  {
    id: 'family',
    title: 'Family profiles',
    description: 'Choose, add, or review a beneficiary such as Ben before preparing a hospital check-in.',
    action: 'Open Family',
    route: '/family',
    keywords: ['family', 'beneficiary', 'dependent', 'father', 'mother', 'child', 'ben', 'relative', 'phone reconciliation'],
    icon: <UsersRound color="#137A67" size={21} />,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Open the patient reference sheet, MDR, CF1, prescriptions, and generated admission documents.',
    action: 'Open Documents',
    route: '/documents',
    keywords: ['document', 'documents', 'mdr', 'prescription', 'reference sheet', 'form', 'paperwork', 'id card'],
    icon: <FileText color="#137A67" size={21} />,
  },
  {
    id: 'profile',
    title: 'Patient profile',
    description: 'Review identity, PhilHealth PIN, emergency contact, insurance, and notification preferences.',
    action: 'Open Profile',
    route: '/profile',
    keywords: ['profile', 'philhealth pin', 'pin number', 'emergency contact', 'identity', 'address', 'insurance', 'personal information'],
    icon: <UserRound color="#173B4A" size={21} />,
  },
  {
    id: 'opportunities',
    title: 'Health benefits',
    description: 'Review possible benefits and your optional health opportunity reminders in one place.',
    action: 'Open Health Benefits',
    route: '/benefits',
    keywords: ['benefit', 'benefits', 'sss', 'gsis', 'dswd', 'aics', 'assistance', 'notification', 'program'],
    icon: <HeartHandshake color="#137A67" size={21} />,
  },
];

const urgentKeywords = [
  'chest pain',
  'cannot breathe',
  "can't breathe",
  'difficulty breathing',
  'severe bleeding',
  'unconscious',
  'life threatening',
  'emergency now',
];

const suggestions = [
  'Why do I still owe ₱12,700?',
  'What happens after check-in?',
  'Where are Ben’s documents?',
];

function matchQuestion(question: string): AskResult | null {
  const normalized = question.toLowerCase().trim();

  if (urgentKeywords.some((keyword) => normalized.includes(keyword))) {
    return {
      id: 'urgent',
      title: 'This may need urgent help',
      description: 'Alalay cannot assess urgent symptoms. Contact local emergency services or go to the nearest emergency department now.',
      action: 'Open Hospital Check-In',
      route: '/qr',
      urgent: true,
    };
  }

  const ranked = destinations
    .map((destination, index) => ({
      destination,
      index,
      score: destination.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? keyword.split(' ').length : 0), 0),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return ranked[0]?.destination ?? null;
}

export default function AskAlalayScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState('');

  const ask = (nextQuestion = question) => {
    const cleaned = nextQuestion.trim();
    setQuestion(cleaned);

    if (cleaned.length < 3) {
      setResult(null);
      setError('Add a few words so Alalay can find the right feature.');
      return;
    }

    const match = matchQuestion(cleaned);
    setResult(match);
    setError(match ? '' : 'I could not match that question yet. Choose one of the supported destinations below.');
  };

  const openDestination = (route: Href) => router.push(route);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, isWide && styles.contentWide]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft color={COLORS.navy} size={21} />
            </TouchableOpacity>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>GUIDED ROUTING</Text>
            </View>
          </View>

          <View style={[styles.hero, isWide && styles.heroWide]}>
            <View style={styles.heroIcon}><Sparkles color="#FFFFFF" size={26} /></View>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>ASK ALALAY</Text>
              <Text style={styles.title}>Tell me what you need help with.</Text>
              <Text style={styles.subtitle}>
                I’ll guide you to the right Alalay feature based on what you ask. This prototype matches common phrases to available tools.
              </Text>
            </View>
          </View>

          <View style={styles.askCard}>
            <Text style={styles.inputLabel}>Your question</Text>
            <View style={[styles.inputRow, error && !result ? styles.inputRowError : null]}>
              <Search color={COLORS.muted} size={20} />
              <TextInput
                value={question}
                onChangeText={(value) => {
                  setQuestion(value);
                  if (error) setError('');
                }}
                onSubmitEditing={() => ask()}
                placeholder="Example: What happens after check-in?"
                placeholderTextColor="#8A9B96"
                returnKeyType="search"
                style={styles.input}
                accessibilityLabel="Ask Alalay question"
              />
              <TouchableOpacity
                style={[styles.askButton, !question.trim() && styles.askButtonDisabled]}
                onPress={() => ask()}
                disabled={!question.trim()}
                accessibilityRole="button"
                accessibilityLabel="Find the right Alalay feature"
              >
                <ArrowRight color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.suggestionLabel}>TRY A QUESTION</Text>
            <View style={styles.suggestionWrap}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => ask(suggestion)}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {result && (
            <View style={[styles.resultCard, 'urgent' in result && result.urgent ? styles.urgentCard : null]}>
              <View style={styles.resultHeader}>
                <View style={['urgent' in result && result.urgent ? styles.urgentIcon : styles.resultIcon]}>
                  {'urgent' in result && result.urgent
                    ? <AlertTriangle color={COLORS.red} size={22} />
                    : destinations.find((item) => item.id === result.id)?.icon}
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.resultEyebrow}>{'urgent' in result && result.urgent ? 'SAFETY RESPONSE' : 'BEST MATCH'}</Text>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                </View>
              </View>
              <Text style={styles.resultDescription}>{result.description}</Text>
              <TouchableOpacity
                style={['urgent' in result && result.urgent ? styles.urgentButton : styles.resultButton]}
                onPress={() => openDestination(result.route)}
                accessibilityRole="button"
              >
                <Text style={styles.resultButtonText}>{result.action}</Text>
                <ArrowRight color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>
          )}

          {!result && !!error && (
            <View style={[styles.destinationGrid, isWide && styles.destinationGridWide]}>
              {destinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={[styles.destinationCard, isWide && styles.destinationCardWide]}
                  onPress={() => openDestination(destination.route)}
                  accessibilityRole="button"
                >
                  <View style={styles.destinationIcon}>{destination.icon}</View>
                  <Text style={styles.destinationTitle}>{destination.title}</Text>
                  <Text style={styles.destinationDescription} numberOfLines={2}>{destination.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.scopeNote}>
            <Text style={styles.scopeTitle}>What I can help you find</Text>
            <Text style={styles.scopeText}>Bills, lab results, admission steps, family profiles, documents, profile details, and health opportunities.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  contentWide: { paddingHorizontal: 38, paddingTop: 24, paddingBottom: 56 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line },
  demoBadge: { backgroundColor: COLORS.primarySoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  demoBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1, color: COLORS.primary },
  hero: { backgroundColor: COLORS.navy, borderRadius: 26, padding: 22, gap: 17, marginBottom: 15 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 25 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.5, color: '#80D7C5', marginBottom: 6 },
  title: { fontFamily: 'Sora_700Bold', fontSize: 24, lineHeight: 31, color: '#FFFFFF' },
  subtitle: { maxWidth: 690, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: '#C9DADF', marginTop: 7 },
  askCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 22, padding: 18 },
  inputLabel: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: COLORS.ink, marginBottom: 9 },
  inputRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#CBDAD5', borderRadius: 16, backgroundColor: '#FBFDFC', paddingLeft: 14, paddingRight: 5 },
  inputRowError: { borderColor: '#E6A9A9', backgroundColor: '#FFF9F9' },
  input: { flex: 1, minWidth: 0, fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.ink, paddingVertical: 12 },
  askButton: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
  askButtonDisabled: { backgroundColor: '#A9BBB6' },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, color: COLORS.red, marginTop: 8 },
  suggestionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: COLORS.muted, marginTop: 17, marginBottom: 8 },
  suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: { backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: '#C5E5DD', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.primary },
  resultCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#BFDCD5', borderRadius: 22, padding: 19, marginTop: 14 },
  urgentCard: { borderColor: '#F0C0C0', backgroundColor: COLORS.redSoft },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' },
  urgentIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#FFE0E0', alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1 },
  resultEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 8, letterSpacing: 1.2, color: COLORS.primary },
  resultTitle: { fontFamily: 'Sora_700Bold', fontSize: 18, color: COLORS.ink, marginTop: 3 },
  resultDescription: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, color: COLORS.muted, marginTop: 13 },
  resultButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: COLORS.primary, borderRadius: 15, marginTop: 17 },
  urgentButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: COLORS.red, borderRadius: 15, marginTop: 17 },
  resultButtonText: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  destinationGrid: { gap: 10, marginTop: 14 },
  destinationGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  destinationCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, padding: 15 },
  destinationCardWide: { width: '48.9%' },
  destinationIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F0F6F4', alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  destinationTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: COLORS.ink },
  destinationDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: 4 },
  scopeNote: { backgroundColor: COLORS.amberSoft, borderWidth: 1, borderColor: '#F0D9AC', borderRadius: 17, padding: 15, marginTop: 14 },
  scopeTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: COLORS.ink },
  scopeText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, color: COLORS.muted, marginTop: 4 },
});
