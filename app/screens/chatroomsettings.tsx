import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import UserItem from '../components/UserItem';
import SelectAllItem from '../components/SelectAllItem';
import { useChatRoomSettings } from '../hooks/useChatRoomSettings';

const ChatRoomSettings = ({ route, navigation }) => {
    // Hent chatRoomId fra navigation params
    const { chatRoomId } = route.params;

    // Custom hook som håndterer state og logik for chatrumsindstillinger
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

    // Hent id for den nuværende bruger
    const currentUserId = auth().currentUser?.uid;

    // State til at indikere om sletning er i gang
    const [isDeleting, setIsDeleting] = useState(false);

    // Funktion der håndterer gem-knap tryk
    const onSavePress = async () => {
        try {
            await handleSaveChanges();  // Gem ændringer via hook useChatRoomSettings
            Alert.alert('Success', 'Ændringer er gemt.');
        } catch (error) {
            Alert.alert('Fejl', 'Kunne ikke gemme ændringer. Prøv igen.');
            console.error(error);
        }
    };

    // Funktion der viser bekræftelsesdialog og sletter chatrum hvis bekræftet
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
                  await handleDeleteRoom(); // Slet chatrum via hook
                  navigation.goBack(); // Naviger tilbage efter sletning
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

    // Render funktion til hvert bruger-item i listen
    const renderUserItem = ({ item }) => {
        const isSelected = selectedUsers.has(item.id);  // Tjek om bruger er valgt
        const disabled = item.id === currentUserId || !isAdmin; // Deaktiver for nuværende bruger eller hvis ikke admin

        return (
            <UserItem
                user={item}
                isSelected={isSelected}
                disabled={disabled}
                onPress={() => isAdmin && !disabled && toggleUserSelection(item.id)} // Kun admin kan ændre valg
                currentUserId={currentUserId}
            />
        );
    };

    // Render funktion til Select-all item
    const renderSelectAllItem = () => (
        <SelectAllItem allSelected={selectAll} onPress={toggleSelectAll} />
    );

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Indstillinger for chatrum</Text>

            {/* Vis admins liste */}
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

            {/* Advarsel hvis brugeren ikke er admin */}
            {!isAdmin && (
                <Text style={{ color: 'gray', fontStyle: 'italic', marginBottom: 10 }}>
                    Du har ikke tilladelse til at redigere dette chatrum.
                </Text>
            )}

            {/* Input til chatrums navn */}
            <TextInput
                style={styles.input}
                value={chatRoomName}
                onChangeText={setChatRoomName}
                placeholder="Navn på chatrum"
                editable={isAdmin} // Kun admin kan redigere
            />

            {/* Input til chatrums beskrivelse */}
            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={chatRoomDescription}
                onChangeText={setChatRoomDescription}
                placeholder="Beskrivelse af chatrum"
                multiline
                editable={isAdmin} // Kun admin kan redigere
            />

            <Text style={styles.selectUsersTitle}>Vælg medlemmer:</Text>

            {/* Liste over brugere med mulighed for at vælge */}
            <FlatList
                data={[{ id: 'select_all' }, ...users]} // Tilføj 'select_all' item for at vælge alle
                keyExtractor={item => item.id}
                renderItem={({ item }) => (item.id === 'select_all' ? renderSelectAllItem() : renderUserItem({ item }))}
                extraData={selectedUsers} // Opdater listen hvis valgte brugere ændres
                style={styles.usersList}
            />

            {/* Gem ændringer knap */}
            <TouchableOpacity
                style={[styles.button, !isAdmin && { backgroundColor: '#ccc' }]} // Grå hvis ikke admin
                onPress={onSavePress}
                disabled={!isAdmin} // Deaktiver knap hvis ikke admin
            >
                <Text style={styles.buttonText}>Gem ændringer</Text>
            </TouchableOpacity>

            {/* Slet chatrum knap */}
            <TouchableOpacity
                onPress={onDeletePress}
                disabled={!isAdmin} // Kun admin kan slette
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
