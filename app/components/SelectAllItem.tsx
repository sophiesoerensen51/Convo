// components/SelectAllItem.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  allSelected: boolean;
  onPress: () => void;
};

const SelectAllItem: React.FC<Props> = ({ allSelected, onPress }) => {
  return (
    <TouchableOpacity style={styles.userItem} onPress={onPress}>
      <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
        {allSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.userName}>Vælg alle</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
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
