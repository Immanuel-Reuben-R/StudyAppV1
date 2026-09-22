import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { getSubjects, addSubject } from '../database';

// Vibrant neon/pastel colors for Subject cards
const CARD_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6A0572', '#1A535C', '#F7FFF7', '#FF9F1C', '#2EC4B6'];

export default function HomeScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

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
    setModalVisible(false);
    loadSubjects();
  };

  const renderItem = ({ item, index }) => {
    const accentColor = CARD_COLORS[item.id % CARD_COLORS.length];
    
    return (
      <TouchableOpacity 
        style={[styles.card, { borderTopColor: accentColor, borderTopWidth: 4 }]} 
        onPress={() => navigation.navigate('Subject', { subjectId: item.id, subjectName: item.name, accentColor })}
      >
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.chapterCount}>{item.chapterCount} Chapter{item.chapterCount !== 1 ? 's' : ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {subjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Welcome to StudyNotes!</Text>
          <Text style={styles.emptyText}>Tap the + button to add your very first subject and get started.</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Subject Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Subject</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Physics, History..." 
              placeholderTextColor="#666"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.addBtn} onPress={handleAddSubject}>
                <Text style={styles.addText}>Add Subject</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#121212' },
  row: { justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#1E1E1E', 
    flex: 0.48, 
    aspectRatio: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 16, 
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  chapterCount: { color: '#888', fontSize: 12, fontWeight: '500' },
  
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyEmoji: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { color: '#888', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  
  // FAB
  fab: {
    position: 'absolute', right: 24, bottom: 30,
    backgroundColor: '#4ECDC4', width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  fabText: { color: '#121212', fontSize: 32, fontWeight: 'bold', marginTop: -2 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E1E1E', width: '85%', padding: 24, borderRadius: 16 },
  modalHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  cancelText: { color: '#888', fontSize: 16, fontWeight: '600' },
  addBtn: { backgroundColor: '#4ECDC4', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  addText: { color: '#121212', fontSize: 16, fontWeight: 'bold' }
});
