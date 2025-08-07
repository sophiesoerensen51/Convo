import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import UserItem from '../components/UserItem';
import SelectAllItem from '../components/SelectAllItem';
import { useChatRoomSettings } from '../hooks/useChatRoomSettings';

const ChatRoomSettings = ({ route, navigation }) => {
    const { chatRoomId } = route.params;

    const {
        chatRoomName,
        setChatRoomName,
        chatRoomDescription,
        setChatRoomDescription,
        users,
        selectedUsers,
        toggleUserSelection,
        selectAll,
        toggleSelectAll,
        handleSaveChanges,
        handleDeleteRoom,
        isAdmin,
        admins,
        loading,
    } = useChatRoomSettings(chatRoomId, navigation);

    const currentUserId = auth().currentUser?.uid;
    const [isDeleting, setIsDeleting] = useState(false);

    const onSavePress = async () => {
        try {
            await handleSaveChanges();
            Alert.alert('Success', 'Ændringer er gemt.');
        } catch (error) {
            Alert.alert('Fejl', 'Kunne ikke gemme ændringer. Prøv igen.');
            console.error(error);
        }
    };

    const onDeletePress = () => {
        Alert.alert(
          'Bekræft sletning',
          'Er du sikker på, at du vil slette chatrummet?',
          [
            { text: 'Annuller', style: 'cancel' },
            {
              text: 'Slet',
              style: 'destructive',
              onPress: async () => {
                setIsDeleting(true);
                try {
                  await handleDeleteRoom();
                  navigation.goBack();
                } catch (error) {
                  Alert.alert('Fejl', 'Kunne ikke slette chatrummet. Prøv igen.');
                  console.error(error);
                } finally {
                  setIsDeleting(false);
                }
              }
            }
          ]
        );
      };
      

    const renderUserItem = ({ item }) => {
        const isSelected = selectedUsers.has(item.id);
        const disabled = item.id === currentUserId || !isAdmin;

        return (
            <UserItem
                user={item}
                isSelected={isSelected}
                disabled={disabled}
                onPress={() => isAdmin && !disabled && toggleUserSelection(item.id)}
                currentUserId={currentUserId}
            />
        );
    };

    const renderSelectAllItem = () => (
        <SelectAllItem allSelected={selectAll} onPress={toggleSelectAll} />
    );

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Indstillinger for chatrum</Text>

            {admins.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 4 }}>Admin{admins.length > 1 ? 's' : ''}:</Text>
                    {admins.map(admin => (
                        <Text key={admin.id} style={{ fontSize: 14, color: '#007AFF' }}>
                            {admin.displayName || admin.email || 'Ukendt bruger'}
                        </Text>
                    ))}
                </View>
            )}

            {!isAdmin && (
                <Text style={{ color: 'gray', fontStyle: 'italic', marginBottom: 10 }}>
                    Du har ikke tilladelse til at redigere dette chatrum.
                </Text>
            )}

            <TextInput
                style={styles.input}
                value={chatRoomName}
                onChangeText={setChatRoomName}
                placeholder="Navn på chatrum"
                editable={isAdmin}
            />

            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={chatRoomDescription}
                onChangeText={setChatRoomDescription}
                placeholder="Beskrivelse af chatrum"
                multiline
                editable={isAdmin}
            />

            <Text style={styles.selectUsersTitle}>Vælg medlemmer:</Text>

            <FlatList
                data={[{ id: 'select_all' }, ...users]}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (item.id === 'select_all' ? renderSelectAllItem() : renderUserItem({ item }))}
                extraData={selectedUsers}
                style={styles.usersList}
            />

            <TouchableOpacity
                style={[styles.button, !isAdmin && { backgroundColor: '#ccc' }]}
                onPress={onSavePress}
                disabled={!isAdmin}
            >
                <Text style={styles.buttonText}>Gem ændringer</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onDeletePress}
                disabled={!isAdmin}
                style={{ opacity: isAdmin ? 1 : 0.4, marginTop: 16 }}
            >
                <Text style={[styles.buttonText, { color: '#FF3B30' }]}>Slet chatrum</Text>
            </TouchableOpacity>

        </View >
    );
};

export default ChatRoomSettings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 16,
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
    selectUsersTitle: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    usersList: {
        maxHeight: 300,
        marginBottom: 16,
    },
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
});
