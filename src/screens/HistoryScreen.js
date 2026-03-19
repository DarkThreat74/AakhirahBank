import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteAllTransactions, deleteTransaction, getUser } from '../storage';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { Feather } from '@expo/vector-icons';

const formatAmount = (amount, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const HistoryScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = async () => {
    const tx = await getTransactions();
    const usr = await getUser();
    setTransactions(tx);
    setUser(usr);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const confirmDeleteAll = async () => {
    await deleteAllTransactions();
    setTransactions([]);
    setModalVisible(false);
  };

  const confirmDeleteSingle = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to completely erase this single deposit?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
             await deleteTransaction(id);
             setTransactions(prev => prev.filter(t => t.id !== id));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.txCard}>
      <View style={styles.txLeft}>
        <View style={styles.txIcon}>
          <Feather name="heart" size={16} color={COLORS.primaryGold} />
        </View>
        <View>
          <Text style={styles.txCategory}>{item.category}</Text>
          <Text style={styles.txDate}>{item.date}</Text>
        </View>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.txAmount}>{formatAmount(item.amount, user?.currency || 'USD')}</Text>
        <TouchableOpacity style={{marginLeft: 16, padding: 8}} onPress={() => confirmDeleteSingle(item.id)}>
          <Feather name="trash-2" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{transactions.length} deposits made</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="folder-minus" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No deposits yet. Start your journey.</Text>
          </View>
        }
      />

      {transactions.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.deleteButtonText}>Delete All History</Text>
        </TouchableOpacity>
      )}

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalBody}>
              This will permanently erase your entire history and balance. This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmDeleteAll}>
                <Text style={styles.confirmBtnText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 28,
    color: COLORS.primaryGold,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 20,
    flexGrow: 1,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txCategory: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  txDate: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  txAmount: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.primaryGold,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteButtonText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 24,
    color: COLORS.danger,
    marginBottom: 12,
  },
  modalBody: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontFamily: TYPOGRAPHY.body,
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
