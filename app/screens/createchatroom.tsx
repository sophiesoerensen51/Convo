import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import UserItem from '../components/UserItem';
import SelectAllItem from '../components/SelectAllItem';
import { useCreateChatRoom } from '../hooks/useCreateChatRoom';
import auth from '@react-native-firebase/auth';


const CreateChatRoom = ({ navigation }) => {
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

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const onCreatePress = async () => {
    setLoading(true);
    setError('');
    try {
      await handleCreateRoom();
    } catch (err) {
      console.error(err);
      setError('Kunne ikke oprette chatrum. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => {
    if (item.id === 'select_all') {
      return (
        <SelectAllItem
          allSelected={selectAll}
          onPress={() => toggleUserSelection('select_all')}
        />
      );
    }

    const isSelected = selectedUsers.has(item.id);
    const isDisabled = false;

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

  const listData = [{ id: 'select_all' }, ...users];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opret nyt chatrum</Text>

      <TextInput
        placeholder="Navn på chatrum"
        value={roomName}
        onChangeText={setRoomName}
        style={styles.input}
      />

      <TextInput
        placeholder="Beskrivelse (valgfrit)"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.descriptionInput]}
        multiline
      />

      <Text style={styles.selectUsersTitle}>Vælg brugere til chatrummet:</Text>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        extraData={[selectedUsers, selectAll]}
        style={styles.usersList}
      />


<TouchableOpacity
  style={[styles.button, loading && { opacity: 0.6 }]}
  onPress={onCreatePress}
  disabled={loading}
>
  <Text style={styles.buttonText}>{loading ? 'Opretter...' : 'Opret'}</Text>
</TouchableOpacity>
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
