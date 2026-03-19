import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { saveUser, saveSettings, saveMilestones } from '../storage';


const CURRENCIES = ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'PKR', 'SAR'];

const OnboardingScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) return;
      setStep(3);
    } else if (step === 3) {
      if (!income) return;
      const annualIncome = parseFloat(income);
      const user = { name, annualIncome, currency, onboardingComplete: true };
      const settings = { currency };
      const initialGoal = annualIncome * 0.05;
      const milestones = { currentGoal: initialGoal, totalDeposited: 0, milestonesReached: 0 };
      
      await saveUser(user);
      await saveSettings(settings);
      await saveMilestones(milestones);
      
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Aakhirah Bank</Text>
              <Text style={styles.subtitle}>"Your investment in the eternal."</Text>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Set Your Foundation</Text>
              <Text style={styles.bodyText}>We recommend a 5% Sadaqah goal based on your annual income.</Text>
              <TextInput
                style={styles.input}
                placeholder="Annual Income"
                placeholderTextColor={COLORS.textSecondary}
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.label}>Select Currency</Text>
              <View style={styles.currencyContainer}>
                {CURRENCIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.currencyPill, currency === c && styles.currencyPillActive]}
                    onPress={() => setCurrency(c)}
                  >
                    <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step === 3 ? 'Complete Setup' : 'Continue'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 32,
    color: COLORS.primaryGold,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bodyText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    padding: 16,
    marginBottom: 16,
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  currencyPill: {
    borderColor: COLORS.primaryGold,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  currencyPillActive: {
    backgroundColor: COLORS.primaryGold,
  },
  currencyText: {
    color: COLORS.primaryGold,
    fontFamily: TYPOGRAPHY.body,
  },
  currencyTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  button: {
    ...COMMON_STYLES.button,
    margin: 24,
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  buttonText: COMMON_STYLES.buttonText,
});

export default OnboardingScreen;
