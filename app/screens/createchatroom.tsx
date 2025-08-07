import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import UserItem from '../components/UserItem';
import SelectAllItem from '../components/SelectAllItem';
import { useCreateChatRoom } from '../hooks/useCreateChatRoom';
import auth from '@react-native-firebase/auth';

const CreateChatRoom = ({ navigation }) => {
  // Hent state og funktioner til at håndtere oprettelse af chatrum fra custom hook useCreateChatRoom
  const {
    roomName,
    setRoomName,
    description,
    setDescription,
    users,
    selectedUsers,
    selectAll,
    toggleUserSelection,
    handleCreateRoom,
  } = useCreateChatRoom({ navigation });

  // Lokal state til loading status og fejlbeskeder
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Funktion der kaldes når brugeren trykker "Opret" knappen
  const onCreatePress = async () => {
    setLoading(true);    
    setError('');        
    try {
      await handleCreateRoom();  // Forsøg at oprette chatrummet via hook
    } catch (err) {
      console.error(err);
      setError('Kunne ikke oprette chatrum. Prøv igen.');  
    } finally {
      setLoading(false);  
    }
  };

  // Render funktion til hver bruger i listen
  const renderUserItem = ({ item }) => {
    // Hvis item er objektet 'select_all', render SelectAllItem komponent
    if (item.id === 'select_all') {
      return (
        <SelectAllItem
          allSelected={selectAll}
          onPress={() => toggleUserSelection('select_all')}
        />
      );
    }

    // Tjek om brugeren er valgt
    const isSelected = selectedUsers.has(item.id);
    const isDisabled = false; 

    // Render brugeritem med valgbarhed
    return (
      <UserItem
        user={item}
        isSelected={isSelected}
        disabled={isDisabled}
        onPress={() => toggleUserSelection(item.id)}
        currentUserId={auth().currentUser?.uid ?? ''}
      />
    );
  };

  // Data til FlatList: først 'select_all' optionen, derefter alle brugere
  const listData = [{ id: 'select_all' }, ...users];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opret nyt chatrum</Text>

      {/* Inputfelt til chatrummets navn */}
      <TextInput
        placeholder="Navn på chatrum"
        value={roomName}
        onChangeText={setRoomName}
        style={styles.input}
      />

      {/* Inputfelt til valgfri beskrivelse */}
      <TextInput
        placeholder="Beskrivelse (valgfrit)"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.descriptionInput]}
        multiline
      />

      <Text style={styles.selectUsersTitle}>Vælg brugere til chatrummet:</Text>

      {/* Liste over brugere, inkl. mulighed for at vælge alle */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        extraData={[selectedUsers, selectAll]}  
        style={styles.usersList}
      />

      {/* Knap til at oprette chatrummet */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]} 
        onPress={onCreatePress}
        disabled={loading} // Deaktiver knappen under loading
      >
        <Text style={styles.buttonText}>{loading ? 'Opretter...' : 'Opret'}</Text>
      </TouchableOpacity>

      {/* Vis fejlbesked hvis oprettelse fejler */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

export default CreateChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  descriptionInput: {
    height: 80,
  },
  selectUsersTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  usersList: {
    maxHeight: 250,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center',
  },
});
