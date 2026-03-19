import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUser, getMilestones, getTransactions, saveMilestones } from '../storage';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { Feather } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';

const RAMADAN_DATES = [
  { startDate: '2024-03-10', endDate: '2024-04-09' },
  { startDate: '2025-02-28', endDate: '2025-03-30' },
  { startDate: '2026-02-17', endDate: '2026-03-19' },
  { startDate: '2027-02-07', endDate: '2027-03-09' },
];

const formatAmount = (amount, currency) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const getHijriDate = () => {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  } catch (e) {
    return '1 Ramadan 1445';
  }
};

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [milestones, setMilestones] = useState({ currentGoal: 0, totalDeposited: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSpecialScreen, setShowSpecialScreen] = useState(false);

  const loadData = async () => {
    const userData = await getUser();
    const milestoneData = await getMilestones();
    const transactionsData = await getTransactions();

    setUser(userData);
    if (milestoneData) {
      setMilestones(milestoneData);
      checkMilestones(milestoneData);
    }
    setRecentTransactions(transactionsData.slice(0, 3));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const checkMilestones = async (currentMilestones) => {
    if (currentMilestones.totalDeposited >= currentMilestones.currentGoal && currentMilestones.currentGoal > 0) {
      let nextGoal = currentMilestones.currentGoal * 2;
      
      const newMilestones = { 
        ...currentMilestones, 
        currentGoal: nextGoal, 
        milestonesReached: (currentMilestones.milestonesReached || 0) + 1 
      };
      await saveMilestones(newMilestones);
      setMilestones(newMilestones);

      if (newMilestones.milestonesReached % 5 === 0) {
        setShowSpecialScreen(true);
      } else {
        setShowConfetti(true);
      }
    }
  };

  const isRamadan = RAMADAN_DATES.some(r => {
    const today = new Date();
    return today >= new Date(r.startDate) && today <= new Date(r.endDate);
  });

  const progress = milestones.currentGoal > 0 ? Math.min(milestones.totalDeposited / milestones.currentGoal, 1) : 0;

  if (!user) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'},</Text>
            <Text style={styles.nameHeader}>{user.name}</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{getHijriDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Feather name="settings" size={24} color={COLORS.primaryGold} style={{marginLeft: 16}} />
          </TouchableOpacity>
        </View>

        {/* Premium Bank Card UI */}
        <View style={styles.cardWrapper}>
          <View style={styles.bankCard}>
             <View style={styles.glowEffect} />
             <View style={styles.glowEffectBottom} />
             <View style={styles.cardTopRow}>
                <View style={[styles.chip, styles.chipIcon]}>
                    <View style={styles.chipLine1} />
                    <View style={styles.chipLine2} />
                    <View style={styles.chipLine3} />
                </View>
                <Text style={styles.cardType}>AAKHIRAH ELITE™</Text>
             </View>
             
             <View style={styles.cardMiddleRow}>
                <Text style={styles.cardNumber}>••••  ••••  ••••  7860</Text>
             </View>

             <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.balanceLabel}>Total Balance (Sadaqah)</Text>
                  <Text style={styles.balanceValue} adjustsFontSizeToFit={true} numberOfLines={1}>
                    {formatAmount(milestones.totalDeposited, user.currency)}
                  </Text>
                </View>
                <Feather name="globe" size={32} color="rgba(201, 168, 76, 0.4)" style={{marginBottom: 5}}/>
             </View>
          </View>
        </View>

        {/* Milestone Tracker */}
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneLabel}>Your Active Goal</Text>
          <View style={styles.progressHeader}>
             <Text style={styles.progressTextSmall}>{formatAmount(0, user.currency)}</Text>
             <Text style={styles.progressTextSmall}>{formatAmount(milestones.currentGoal, user.currency)}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {isRamadan && (
          <View style={styles.ramadanBanner}>
            <Feather name="moon" size={20} color={COLORS.primaryGold} />
            <Text style={styles.ramadanText}>Ramadan Multiplier Active — Rewards 70x</Text>
          </View>
        )}

        {/* Recent Activity Ledger */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Transferences</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
               <Text style={styles.seeAllText}>See full ledger</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((tx, idx) => (
            <View key={idx} style={styles.txCard}>
              <View style={styles.txLeft}>
                <View style={styles.txIcon}>
                  <Feather name="arrow-up-right" size={20} color={COLORS.success} />
                </View>
                <View>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
              </View>
              <Text style={styles.txAmount}>+{formatAmount(tx.amount, user.currency)}</Text>
            </View>
          ))}
          {recentTransactions.length === 0 && (
            <Text style={styles.emptyText}>No ledger entries. Make a deposit to begin tracking.</Text>
          )}
        </View>
      </ScrollView>

      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.celebrationOverlay}>
            <Text style={styles.celebrationVerse}>"The example of those who spend their wealth in the way of Allah is like a seed that grows seven ears"</Text>
            <Text style={styles.celebrationRef}>— Quran 2:261</Text>
          </View>
          <ConfettiCannon count={200} origin={{x: -10, y: 0}} colors={[COLORS.primaryGold, COLORS.goldLight, COLORS.textPrimary]} fadeOut onAnimationEnd={() => setShowConfetti(false)} />
        </View>
      )}
      {showSpecialScreen && (
        <View style={[StyleSheet.absoluteFill, styles.specialScreen]}>
          <Text style={styles.specialHadith}>"The only regret of the people of Jannah is the hours they passed without remembering Allah and doing good."</Text>
          <TouchableOpacity style={styles.specialButton} onPress={() => setShowSpecialScreen(false)}>
            <Text style={styles.specialButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 40,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nameHeader: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.primaryGold,
  },
  dateBadge: {
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  dateBadgeText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.primaryGold,
    fontWeight: 'bold',
  },
  cardWrapper: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  bankCard: {
    backgroundColor: '#11110A',
    borderRadius: 24,
    padding: 28,
    minHeight: 240,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.4)',
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -80,
    right: -20,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201, 168, 76, 0.05)',
  },
  glowEffectBottom: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201, 168, 76, 0.03)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  chipIcon: {
    width: 44,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#E5C065',
    borderWidth: 1,
    borderColor: '#F0D080',
    opacity: 0.9,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chipLine1: { width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  chipLine2: { width: '80%', height: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  chipLine3: { width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardType: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 14,
    color: '#8A8070',
    letterSpacing: 3,
  },
  cardMiddleRow: {
    justifyContent: 'center',
    zIndex: 2,
  },
  cardNumber: {
    fontFamily: 'monospace',
    fontSize: 22,
    color: COLORS.textSecondary,
    letterSpacing: 5,
    marginTop: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  balanceLabel: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    color: '#8A8070',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  balanceValue: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 34,
    color: COLORS.textPrimary,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primaryGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconBgDark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#11110A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  milestoneCard: {
    backgroundColor: '#11110A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.15)',
    marginBottom: 32,
  },
  milestoneLabel: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTextSmall: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryGold,
    borderRadius: 4,
  },
  ramadanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryGold,
    marginBottom: 32,
  },
  ramadanText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.primaryGold,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 40,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.primaryGold,
    textDecorationLine: 'underline',
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#11110A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.1)',
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  txCategory: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  txDate: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  txAmount: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,8,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 10,
  },
  celebrationVerse: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 24,
    color: COLORS.primaryGold,
    textAlign: 'center',
    lineHeight: 36,
  },
  celebrationRef: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.goldLight,
    marginTop: 20,
  },
  specialScreen: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 20,
  },
  specialHadith: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.primaryGold,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 40,
  },
  specialButton: {
    ...COMMON_STYLES.button,
    paddingHorizontal: 40,
  },
  specialButtonText: COMMON_STYLES.buttonText,
});

export default DashboardScreen;
