import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

type Props = {
  allSelected: boolean;      // Angiver om alle brugere er valgt eller ej
  onPress: () => void;       
};

const SelectAllItem: React.FC<Props> = ({ allSelected, onPress }) => {
  return (
    // TouchableOpacity gør elementet trykbart med visuel feedback
    <TouchableOpacity style={styles.userItem} onPress={onPress}>
      {/* Checkbox-udseendet */}
      <View style={[styles.checkbox, allSelected && styles.checkboxSelected]}>
        {/* Viser checkmark hvis alle er valgt */}
        {allSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {/* Label til checkbox */}
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
