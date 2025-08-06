import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const CreateChatRoom = ({ navigation }) => {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await firestore().collection('Users').get();
                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersList);
                // Som default marker alle brugere som valgt
                const allUserIds = usersList.map(u => u.id);
                setSelectedUsers(new Set(allUserIds));
                setSelectAll(true);
            } catch (error) {
                console.error('Fejl ved hentning af brugere:', error);
            }
        };

        fetchUsers();
    }, []);

    const toggleUserSelection = (userId) => {
        if (userId === 'select_all') {
            // Hvis select all toggles
            if (selectAll) {
                // Fjern alle
                setSelectedUsers(new Set());
                setSelectAll(false);
            } else {
                // Vælg alle
                const allUserIds = users.map(u => u.id);
                setSelectedUsers(new Set(allUserIds));
                setSelectAll(true);
            }
        } else {
            setSelectedUsers(prevSelected => {
                const newSelected = new Set(prevSelected);
                if (newSelected.has(userId)) {
                    newSelected.delete(userId);
                } else {
                    newSelected.add(userId);
                }

                // Opdater selectAll-status baseret på selection
                setSelectAll(newSelected.size === users.length);
                return newSelected;
            });
        }
    };

    const handleCreateRoom = async () => {
        const user = auth().currentUser;
        if (!user) {
            Alert.alert('Fejl', 'Du skal være logget ind for at oprette et chatrum.');
            return;
        }

        if (!roomName.trim()) {
            Alert.alert('Fejl', 'Navnet på chatrummet må ikke være tomt.');
            return;
        }

        if (selectedUsers.size === 0) {
            Alert.alert('Fejl', 'Du skal vælge mindst én bruger.');
            return;
        }

        try {
            // Medtag altid den oprettende bruger som medlem
            const members = Array.from(selectedUsers);
            if (!members.includes(user.uid)) {
                members.push(user.uid);
            }

            const newRoomRef = await firestore().collection('chatRooms').add({
                name: roomName.trim(),
                description: description.trim(),
                createdBy: user.uid,
                createdAt: firestore.FieldValue.serverTimestamp(),
                members,
                admins: [user.uid], //Tilføj admin-felt
                lastMessageAt: firestore.FieldValue.serverTimestamp(),
                lastMessageTimestamp: firestore.FieldValue.serverTimestamp(),
            });
            

            const batch = firestore().batch();
            members.forEach(uid => {
                const userRef = firestore().collection('Users').doc(uid);
                batch.set(
                    userRef,
                    { chatRooms: firestore.FieldValue.arrayUnion(newRoomRef.id) },
                    { merge: true }
                );
            });
            await batch.commit();

            navigation.goBack();
        } catch (error) {
            console.error('Fejl ved oprettelse af chatrum:', error);
            Alert.alert('Fejl', 'Noget gik galt. Prøv igen.');
        }
    };

    const renderUserItem = ({ item }) => {
        // Tjek om vi rendrer den "Tilføj alle brugere" checkbox
        if (item.id === 'select_all') {
            return (
                <TouchableOpacity style={styles.userItem} onPress={() => toggleUserSelection('select_all')}>
                    <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
                        {selectAll && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.userName}>Tilføj alle brugere</Text>
                </TouchableOpacity>
            );
        }

        const isSelected = selectedUsers.has(item.id);
        return (
            <TouchableOpacity style={styles.userItem} onPress={() => toggleUserSelection(item.id)}>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.userName}>
                    {item.displayName?.trim() || item.email?.trim() || 'Ukendt bruger'}
                </Text>
            </TouchableOpacity>
        );
    };

    // Tilføj select_all item øverst
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

            <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
                <Text style={styles.buttonText}>Opret</Text>
            </TouchableOpacity>
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
