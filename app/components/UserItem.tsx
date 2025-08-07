import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type User = {
  id: string;
  displayName?: string;
  email?: string;
};

type Props = {
  user: User;               // Brugerobjekt der skal vises
  isSelected: boolean;      // Om brugeren er valgt (checkbox)
  disabled: boolean;        // Om elementet er deaktiveret (ikke klikbart)
  onPress: () => void;      // Funktion til håndtering af klik
  currentUserId: string;    // Id for den aktuelle bruger (for at markere "Dig")
};

const UserItem: React.FC<Props> = ({ user, isSelected, disabled, onPress, currentUserId }) => {
  const isCurrentUser = user.id === currentUserId; // Tjek om brugeren er den aktuelle bruger

  return (
    <TouchableOpacity
      style={[styles.userItem, disabled && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={disabled}
    >
      {/* Checkbox med markering hvis valgt */}
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>

      {/* Vis navn eller email, fallback til "Ukendt bruger", tilføjer "(Dig)" hvis den aktuelle bruger */}
      <Text style={styles.userName}>
        {user.displayName?.trim() || user.email?.trim() || 'Ukendt bruger'}
        {isCurrentUser && ' (Dig)'}
      </Text>
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

export default UserItem;
