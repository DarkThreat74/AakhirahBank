import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'aakhirah_user';
const TRANSACTIONS_KEY = 'aakhirah_transactions';
const MILESTONES_KEY = 'aakhirah_milestones';
const SETTINGS_KEY = 'aakhirah_settings';
const CORPORATIONS_KEY = 'aakhirah_corporations';

export const getUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getTransactions = async () => {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = async (transaction) => {
  const transactions = await getTransactions();
  transactions.unshift(transaction); // Newest first
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return transactions;
};

export const deleteTransaction = async (id) => {
  const transactions = await getTransactions();
  const txIndex = transactions.findIndex(t => t.id === id);
  if (txIndex === -1) return;
  const removedTx = transactions[txIndex];
  transactions.splice(txIndex, 1);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  
  const milestones = await getMilestones();
  if (milestones) {
    milestones.totalDeposited -= removedTx.amount;
    if (milestones.totalDeposited < 0) milestones.totalDeposited = 0;
    await saveMilestones(milestones);
  }
};

export const deleteAllTransactions = async () => {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  const milestones = await getMilestones();
  if (milestones) {
    const user = await getUser();
    const initialGoal = user ? user.annualIncome * 0.05 : 0;
    milestones.totalDeposited = 0;
    milestones.currentGoal = initialGoal;
    await saveMilestones(milestones);
  }
};

export const getMilestones = async () => {
  const data = await AsyncStorage.getItem(MILESTONES_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveMilestones = async (milestones) => {
  await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
};

export const getSettings = async () => {
  const data = await AsyncStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveSettings = async (settings) => {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getCorporations = async () => {
  const data = await AsyncStorage.getItem(CORPORATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCorporations = async (corporations) => {
  await AsyncStorage.setItem(CORPORATIONS_KEY, JSON.stringify(corporations));
};
