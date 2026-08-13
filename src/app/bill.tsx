import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Maximize2, Receipt, Lightbulb, MessageCircle, Send, X } from 'lucide-react-native';

type BillingMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const suggestedQuestions = [
  'Why do I still owe ₱12,700?',
  'What is CF1?',
  'What did my HMO cover?',
];

const initialMessages: BillingMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Ask me about the totals and deductions shown on this bill. I will only answer using the information displayed here.',
  },
];

function getBillingAnswer(question: string) {
  const normalized = question.toLowerCase().replace(/[,₱]/g, '');

  if (normalized.includes('cf1') || normalized.includes('philhealth')) {
    return 'This bill labels CF1 as the PhilHealth deduction. It shows ₱12,500 as applied. For details about the form or benefit calculation, please confirm with the billing office.';
  }

  if (normalized.includes('hmo') || normalized.includes('maxicare')) {
    return 'This bill shows a ₱20,000 HMO / Maxicare deduction as applied. It does not include a detailed breakdown of which individual charges Maxicare covered.';
  }

  if (
    normalized.includes('owe') ||
    normalized.includes('due') ||
    normalized.includes('pay') ||
    normalized.includes('balance') ||
    normalized.includes('remaining') ||
    normalized.includes('12700')
  ) {
    return 'Your gross charges are ₱45,200. After the ₱12,500 PhilHealth deduction and ₱20,000 HMO deduction, the remaining amount is ₱12,700.';
  }

  if (
    normalized.includes('total') ||
    normalized.includes('gross') ||
    normalized.includes('charge') ||
    normalized.includes('45200')
  ) {
    return 'The gross hospital charge is ₱45,200 before the PhilHealth and HMO deductions shown on this bill.';
  }

  if (normalized.includes('percent') || normalized.includes('covered') || normalized.includes('deduction')) {
    return 'The two displayed deductions total ₱32,500, which is about 72% of the ₱45,200 gross charge. The displayed balance is ₱12,700.';
  }

  return 'I cannot answer that confidently from the information shown on this bill. Please ask the billing office for the exact charge or coverage details.';
}

export default function BillReaderScreen() {
  const router = useRouter();
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<BillingMessage[]>(initialMessages);

  const askQuestion = (value: string) => {
    const trimmedQuestion = value.trim();

    if (!trimmedQuestion) return;

    const messageId = Date.now().toString();
    setMessages((current) => [
      ...current,
      { id: `${messageId}-question`, role: 'user', text: trimmedQuestion },
      { id: `${messageId}-answer`, role: 'assistant', text: getBillingAnswer(trimmedQuestion) },
    ]);
    setQuestion('');
  };

  return (
    <View style={styles.container}>
      {/* Offline-safe branded header */}
      <View style={styles.imageHeader}>
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => router.back()}>
              <ChevronLeft color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <View style={styles.glassPill}>
              <Text style={styles.glassText}>Original Bill</Text>
            </View>
            <TouchableOpacity style={styles.glassBtn}>
              <Maximize2 color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>GROUNDED BILL EXPLANATION</Text>
          <Text style={styles.heroTitle}>Your hospital bill</Text>
          <Text style={styles.heroSubtitle}>Explained using a seeded Cebu hospital billing glossary</Text>
        </View>
      </View>

      {/* Main Content Sheet */}
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Receipt color="#FFFFFF" size={24} />
            </View>
            <View>
              <Text style={styles.title}>AI Bill Analysis</Text>
              <Text style={styles.subtitle}>Cebu hospital demo bill • OCT 12</Text>
            </View>
          </View>

          {/* Metric 1 - Total */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>GROSS HOSPITAL CHARGES</Text>
              <View style={styles.badgeNeutral}><Text style={styles.badgeTextNeutral}>TOTAL</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>₱45,200</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is the total cost of your stay before any insurance or PhilHealth deductions were applied.
            </Text>
          </View>

          {/* Metric 2 - PhilHealth */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>PHILHEALTH DEDUCTION (CF1)</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>APPLIED</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={[styles.metricValue, { color: '#38A169' }]}>-₱12,500</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is the PhilHealth deduction marked as applied on the bill.
            </Text>
          </View>

          {/* Metric 3 - HMO */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>HMO / MAXICARE</Text>
              <View style={styles.badgeNormal}><Text style={styles.badgeTextNormal}>APPLIED</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={[styles.metricValue, { color: '#38A169' }]}>-₱20,000</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is the HMO / Maxicare deduction marked as applied on the bill.
            </Text>
          </View>

          {/* Metric 4 - Due */}
          <View style={[styles.metricCard, styles.metricCardHigh]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>NET AMOUNT PAYABLE</Text>
              <View style={styles.badgeHigh}><Text style={styles.badgeTextHigh}>DUE NOW</Text></View>
            </View>
            <View style={styles.valueRow}>
              <Text style={styles.metricValue}>₱12,700</Text>
              <Text style={styles.metricUnit}>.00</Text>
            </View>
            <Text style={styles.metricDesc}>
              This is your final out-of-pocket balance to be settled at the billing counter.
            </Text>
          </View>

          {/* Overall Summary Callout */}
          <View style={styles.summaryCallout}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12}}>
              <Lightbulb color="#FFFFFF" size={20} />
              <Text style={styles.summaryTitle}>AI Summary</Text>
            </View>
            <Text style={styles.summaryText}>
              The displayed PhilHealth and HMO deductions cover about 72% of the total hospital bill. The remaining balance shown is ₱12,700.
            </Text>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => setIsQuestionOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Ask a billing question"
            >
              <MessageCircle color="#FFFFFF" size={19} />
              <Text style={styles.saveBtnText}>Ask a Billing Question</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
        <View style={styles.disclaimerBanner}>
          <Text style={styles.disclaimer}>This is for understanding only - confirm with the billing office.</Text>
        </View>
      </View>

      <Modal
        visible={isQuestionOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQuestionOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsQuestionOpen(false)}
            accessibilityLabel="Close billing questions"
          />
          <View style={styles.questionSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.questionHeader}>
              <View style={styles.questionIcon}>
                <MessageCircle color="#FFFFFF" size={20} />
              </View>
              <View style={styles.questionHeaderCopy}>
                <Text style={styles.questionTitle}>Ask about this bill</Text>
                <Text style={styles.questionSubtitle}>Answers use only the bill shown above</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsQuestionOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X color="#35545F" size={21} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.messageList}
              contentContainerStyle={styles.messageContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user' && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionRow}
              keyboardShouldPersistTaps="handled"
            >
              {suggestedQuestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => askQuestion(suggestion)}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.questionInput}
                value={question}
                onChangeText={setQuestion}
                onSubmitEditing={() => askQuestion(question)}
                placeholder="Type a billing question..."
                placeholderTextColor="#8AA0A8"
                returnKeyType="send"
                accessibilityLabel="Billing question"
              />
              <TouchableOpacity
                style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
                onPress={() => askQuestion(question)}
                disabled={!question.trim()}
                accessibilityRole="button"
                accessibilityLabel="Send billing question"
              >
                <Send color="#FFFFFF" size={19} />
              </TouchableOpacity>
            </View>
            <Text style={styles.questionDisclaimer}>
              For understanding only — confirm with the billing office.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A202C' },
  
  imageHeader: { height: 280, width: '100%', backgroundColor: '#173B4A' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 },
  glassBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  glassPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  glassText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFFFFF' },
  heroCopy: { paddingHorizontal: 28, marginTop: 30 },
  heroEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, color: '#80D7C5', marginBottom: 7 },
  heroTitle: { fontFamily: 'Sora_700Bold', fontSize: 27, color: '#FFFFFF' },
  heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#C9DADF', marginTop: 5 },

  sheet: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    marginTop: -40, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10
  },
  scrollContent: { padding: 24, paddingBottom: 60 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#38A169', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Sora_700Bold', fontSize: 22, color: '#1A202C', marginBottom: 4 },
  subtitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#718096' },

  metricCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24, 
    marginBottom: 16,
    borderWidth: 1, borderColor: '#EDF2F7',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  metricCardHigh: { borderColor: '#FEB2B2', backgroundColor: '#FFF5F5' },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricTitle: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#718096', letterSpacing: 1 },
  
  badgeHigh: { backgroundColor: '#FED7D7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextHigh: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#C53030', letterSpacing: 0.5 },
  badgeNormal: { backgroundColor: '#C6F6D5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextNormal: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#276749', letterSpacing: 0.5 },
  badgeNeutral: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextNeutral: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#4A5568', letterSpacing: 0.5 },

  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  metricValue: { fontFamily: 'Sora_700Bold', fontSize: 32, color: '#1A202C' },
  metricUnit: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#A0AEC0' },
  metricDesc: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#4A5568', lineHeight: 22 },

  summaryCallout: { backgroundColor: '#38A169', borderRadius: 24, padding: 24, marginTop: 16, marginBottom: 24 },
  summaryTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#FFFFFF' },
  summaryText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 24 },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },

  disclaimerBanner: { backgroundColor: '#FFFAF0', borderTopWidth: 1, borderTopColor: '#FEEBC8', paddingHorizontal: 18, paddingVertical: 13 },
  disclaimer: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#975A16', textAlign: 'center', lineHeight: 18 },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15, 38, 47, 0.52)' },
  questionSheet: {
    height: '78%',
    maxHeight: 680,
    backgroundColor: '#F7FAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    shadowColor: '#0F262F',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 20,
  },
  sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#CEDBDD', marginTop: 10, marginBottom: 15 },
  questionHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E1EAEB' },
  questionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#167D72', alignItems: 'center', justifyContent: 'center' },
  questionHeaderCopy: { flex: 1, marginLeft: 12 },
  questionTitle: { fontFamily: 'Sora_700Bold', fontSize: 17, color: '#173B4A' },
  questionSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#69838C', marginTop: 3 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0F1', alignItems: 'center', justifyContent: 'center' },
  messageList: { flex: 1 },
  messageContent: { paddingVertical: 18, gap: 10 },
  messageBubble: { maxWidth: '86%', borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderTopLeftRadius: 6, borderWidth: 1, borderColor: '#E1EAEB' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#167D72', borderTopRightRadius: 6 },
  messageText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: '#35545F' },
  userMessageText: { color: '#FFFFFF' },
  suggestionRow: { gap: 8, paddingBottom: 12 },
  suggestionChip: { backgroundColor: '#E5F3F0', borderWidth: 1, borderColor: '#BFDCD6', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  suggestionText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#16675F' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  questionInput: { flex: 1, height: 50, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D6E2E4', paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#173B4A' },
  sendButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#167D72', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#A9BCBF' },
  questionDisclaimer: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, color: '#7A6262', textAlign: 'center', marginTop: 10 },
});
