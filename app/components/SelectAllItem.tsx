import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  allSelected: boolean;      // Angiver om alle brugere er valgt eller ej
  onPress: () => void;
  disabled?: boolean;        // Om knappen skal være disabled
};

const SelectAllItem: React.FC<Props> = ({ allSelected, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.userItem, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}  // Deaktiverer tryk hvis disabled er true
      activeOpacity={disabled ? 1 : 0.7}  // Slår feedback fra hvis disabled
    >
      <View style={[styles.checkbox, allSelected && styles.checkboxSelected, disabled && styles.checkboxDisabled]}>
        {allSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.userName, disabled && styles.userNameDisabled]}>Vælg alle</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.5,   // Slør hele knappen når disabled
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userNameDisabled: {
    color: '#999',  // Mere grå tekst når disabled
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDisabled: {
    borderColor: '#999',
    backgroundColor: '#eee',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SelectAllItem;
