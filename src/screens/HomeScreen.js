import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Button } from 'react-native';
import { getSubjects, addSubject } from '../database';

export default function HomeScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Load subjects from SQLite when screen opens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSubjects();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSubjects = () => {
    const data = getSubjects();
    setSubjects(data);
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim() === '') return;
    addSubject(newSubjectName.trim());
    setNewSubjectName('');
    loadSubjects();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Subject', { subjectId: item.id, subjectName: item.name })}
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="New Subject (e.g. Physics)" 
          placeholderTextColor="#888"
          value={newSubjectName}
          onChangeText={setNewSubjectName}
        />
        <Button title="Add" onPress={handleAddSubject} color="#4CAF50" />
      </View>

      {subjects.length === 0 ? (
        <Text style={styles.emptyText}>No subjects yet. Add one above to get started!</Text>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
      
      {/* Settings Button placed at the bottom for easy access */}
      <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
        <Text style={{color: '#aaa', textAlign: 'center'}}>Account & AI Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#2C2C2C', color: '#FFF', padding: 10, borderRadius: 5, marginRight: 10 },
  row: { justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#333', 
    flex: 0.48, 
    aspectRatio: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 10, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444'
  },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', padding: 10 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20 },
  settingsBtn: { marginTop: 20, padding: 15, borderTopWidth: 1, borderColor: '#333' }
});
