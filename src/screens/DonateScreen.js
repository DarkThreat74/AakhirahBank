import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, COMMON_STYLES } from '../theme';
import { Feather } from '@expo/vector-icons';
import { getCorporations, saveCorporations } from '../storage';

const DonateScreen = () => {
  const [corporations, setCorporations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newZelle, setNewZelle] = useState('');

  const loadData = async () => {
    const list = await getCorporations();
    setCorporations(list);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAdd = async () => {
    if (!newName.trim() || !newZelle.trim()) {
      Alert.alert('Missing Fields', 'Please provide a name and Zelle email.');
      return;
    }
    const newCorp = {
      id: Date.now().toString(),
      name: newName,
      description: newDesc,
      zelle: newZelle,
    };
    const updated = [...corporations, newCorp];
    await saveCorporations(updated);
    setCorporations(updated);
    
    setModalVisible(false);
    setNewName('');
    setNewDesc('');
    setNewZelle('');
  };

  const removeCorp = async (id) => {
    Alert.alert(
      "Remove Corporation",
      "Are you sure you want to remove this corporation from your list?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            const updated = corporations.filter(c => c.id !== id);
            await saveCorporations(updated);
            setCorporations(updated);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.patternContainer} pointerEvents="none">
        <Feather name="hexagon" size={300} color="rgba(201, 168, 76, 0.03)" style={styles.patternIcon} />
        <Feather name="hexagon" size={400} color="rgba(201, 168, 76, 0.02)" style={[styles.patternIcon, { top: -100 }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Give Sadaqah</Text>
        <Text style={styles.subtitle}>Send donations directly using Zelle below.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {corporations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="plus-square" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No corporations added yet.</Text>
            <Text style={styles.emptySubtext}>Add organizations you regularly donate to.</Text>
          </View>
        ) : (
          corporations.map(corp => (
            <View key={corp.id} style={styles.corpCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Feather name="heart" size={20} color={COLORS.primaryGold} />
                </View>
                <Text style={styles.corpName}>{corp.name}</Text>
                <TouchableOpacity onPress={() => removeCorp(corp.id)} style={styles.deleteIcon}>
                  <Feather name="trash-2" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              
              {corp.description ? <Text style={styles.corpDescription}>{corp.description}</Text> : null}
              
              <View style={styles.separator} />

              <View style={styles.zelleContainer}>
                <Text style={styles.zelleLabel}>Zelle Email</Text>
                <View style={styles.zelleBox}>
                  <Text style={styles.zelleEmail} selectable={true}>{corp.zelle}</Text>
                  <Feather name="copy" size={16} color={COLORS.primaryGold} />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={32} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Corporation</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Corporation Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Islamic Relief"
                placeholderTextColor={COLORS.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.label}>Zelle Email</Text>
              <TextInput
                style={styles.input}
                placeholder="donate@example.com"
                placeholderTextColor={COLORS.textSecondary}
                value={newZelle}
                onChangeText={setNewZelle}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Orphan sponsorship, local masjid, etc."
                placeholderTextColor={COLORS.textSecondary}
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />

              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Save Corporation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    zIndex: 10,
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
  scroll: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  corpCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
  },
  corpName: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.textPrimary,
    flex: 1,
  },
  deleteIcon: {
    padding: 8,
  },
  corpDescription: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  zelleContainer: {
    backgroundColor: 'rgba(10, 10, 8, 0.5)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
  },
  zelleLabel: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  zelleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zelleEmail: {
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.primaryGold,
    fontWeight: 'bold',
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternIcon: {
    position: 'absolute',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryGold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primaryGold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '60%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: 24,
    color: COLORS.primaryGold,
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
    marginBottom: 20,
  },
  addBtn: {
    ...COMMON_STYLES.button,
    marginTop: 10,
  },
  addBtnText: COMMON_STYLES.buttonText,
});

export default DonateScreen;
