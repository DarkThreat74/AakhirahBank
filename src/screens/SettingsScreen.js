import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { getUser, saveUser, getSettings, saveSettings, getMilestones, saveMilestones } from '../storage';

const CURRENCIES = ['USD', 'GBP', 'CAD', 'AUD', 'EUR', 'PKR', 'SAR'];

const SettingsScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProps = async () => {
      const u = await getUser();
      if (u) {
        setName(u.name);
        setIncome(u.annualIncome.toString());
        setCurrency(u.currency);
      }
      setLoading(false);
    };
    loadProps();
  }, []);

  const handleSave = async () => {
    const numIncome = parseFloat(income);
    if (!name.trim() || isNaN(numIncome) || numIncome <= 0) {
      Alert.alert('Invalid Input', 'Please check your name and income.');
      return;
    }

    const prevUser = await getUser();
    const incomeChanged = prevUser.annualIncome !== numIncome;

    const saveUpdated = async () => {
      await saveUser({ ...prevUser, name, annualIncome: numIncome, currency });
      await saveSettings({ currency });

      if (incomeChanged) {
        const milestones = await getMilestones();
        if (milestones) {
          // If the goal is not altered by milestonesReached yet, or we recalculate the goal
          // "recalculates 5% goal — warn user this will update their milestone target"
          // Let's reset their base goal or adapt the current one.
          // Since it warns, changing income will reset current goal to new 5% or recalculate appropriately. 
          // For simplicity, update currentGoal to income * 0.05
          milestones.currentGoal = numIncome * 0.05;
          await saveMilestones(milestones);
        }
      }

      navigation.goBack();
    };

    if (incomeChanged) {
      Alert.alert(
        'Update Milestone Target',
        'Changing your annual income will recalculate your baseline Sadaqah goal. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Update', style: 'destructive', onPress: saveUpdated }
        ]
      );
    } else {
      saveUpdated();
    }
  };

  if (loading) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Settings</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Annual Income</Text>
          <TextInput
            style={styles.input}
            value={income}
            onChangeText={setIncome}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Currency</Text>
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

        </ScrollView>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
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
    paddingTop: 60,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.primaryGold,
    marginBottom: 32,
  },
  label: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    padding: 16,
    marginBottom: 24,
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 40,
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
  saveBtn: {
    ...COMMON_STYLES.button,
    margin: 24,
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  saveBtnText: COMMON_STYLES.buttonText,
});

export default SettingsScreen;
