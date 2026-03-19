import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { getUser, saveTransaction, getMilestones, saveMilestones } from '../storage';
import { Feather } from '@expo/vector-icons';

const CATEGORIES = ['Masjid', 'Zakat', 'Sadaqah', 'Other'];
const RAMADAN_DATES = [
  { startDate: '2024-03-10', endDate: '2024-04-09' },
  { startDate: '2025-02-28', endDate: '2025-03-30' },
  { startDate: '2026-02-17', endDate: '2026-03-19' },
  { startDate: '2027-02-07', endDate: '2027-03-09' },
];

const DepositScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const todayDateStr = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

    const isRamadanActive = RAMADAN_DATES.some(r => {
      const today = new Date();
      return today >= new Date(r.startDate) && today <= new Date(r.endDate);
    });

    const newTx = {
      id: Date.now().toString(),
      amount: numAmount,
      category,
      date: todayDateStr,
      ramadanActive: isRamadanActive,
    };

    await saveTransaction(newTx);

    const milestones = await getMilestones();
    if (milestones) {
      milestones.totalDeposited += numAmount;
      await saveMilestones(milestones);
    }

    // Usually you'd show a toast, but navigating back triggers the dashboard refresh
    navigation.goBack();
  };

  const isRamadan = RAMADAN_DATES.some(r => {
    const today = new Date();
    return today >= new Date(r.startDate) && today <= new Date(r.endDate);
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Make a Deposit</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {isRamadan && (
            <View style={styles.ramadanBadge}>
              <Feather name="zap" size={16} color={COLORS.primaryGold} />
              <Text style={styles.ramadanText}>70x Reward Active</Text>
            </View>
          )}

          <Text style={styles.label}>Select Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.categoryPill, category === c && styles.categoryPillActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.categoryText, category === c && styles.categoryTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.dateInput}
            value={new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            editable={false}
          />
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Deposit to Aakhirah</Text>
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
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.primaryGold,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountInput: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 64,
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  label: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginTop: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryPill: {
    borderColor: COLORS.primaryGold,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryGold,
  },
  categoryText: {
    color: COLORS.primaryGold,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
  },
  categoryTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    padding: 16,
    opacity: 0.8,
  },
  ramadanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  ramadanText: {
    color: COLORS.primaryGold,
    fontFamily: TYPOGRAPHY.body,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    ...COMMON_STYLES.button,
    margin: 24,
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  buttonText: COMMON_STYLES.buttonText,
});

export default DepositScreen;
