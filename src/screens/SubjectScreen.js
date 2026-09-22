import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getChaptersBySubject, addChapter } from '../database';

export default function SubjectScreen({ route, navigation }) {
  const { subjectId, subjectName, accentColor } = route.params;
  const [chapters, setChapters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  useEffect(() => {
    // Inject the subject's ambient color into the header
    navigation.setOptions({
      title: subjectName,
      headerStyle: { backgroundColor: '#121212', borderBottomWidth: 1, borderBottomColor: accentColor + '40' }, 
      headerTintColor: accentColor,
    });
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadChapters();
    });
    return unsubscribe;
  }, [navigation, accentColor, subjectName]);

  const loadChapters = () => {
    setChapters(getChaptersBySubject(subjectId));
  };

  const handleAddChapter = () => {
    if (newChapterTitle.trim() === '') return;
    addChapter(subjectId, newChapterTitle.trim());
    setNewChapterTitle('');
    setModalVisible(false);
    loadChapters();
  };

  // The Traffic Light System
  const renderStatusDot = (status) => {
    if (status === 'enhanced') return <Text style={styles.sparkle}>✨</Text>;
    if (status === 'draft') return <View style={[styles.dot, {backgroundColor: '#4ECDC4'}]} />; // Blue/Teal for draft
    return <View style={[styles.dot, {backgroundColor: '#333'}]} />; // Grey for empty
  };

  const renderItem = ({ item }) => {
    const hasNotes = item.status !== 'empty';
    
    return (
      <TouchableOpacity 
        style={styles.chapterRow}
        onPress={() => navigation.navigate('NoteEditor', { chapterId: item.id, chapterTitle: item.title, accentColor })}
      >
        <View style={styles.chapterInfo}>
          {renderStatusDot(item.status)}
          <Text style={styles.chapterTitle}>{item.title}</Text>
        </View>
        
        {/* Placeholder for Quick Revision */}
        <TouchableOpacity disabled={!hasNotes} style={[styles.revisionBtn, !hasNotes && {opacity: 0.3}]}>
          <Ionicons name="flash-outline" size={14} color={hasNotes ? accentColor : '#666'} />
          <Text style={[styles.revisionText, {color: hasNotes ? accentColor : '#666'}]}>Revise</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon, { color: accentColor }]}>📖</Text>
            <Text style={styles.emptyText}>No chapters yet. Tap the + to build your syllabus.</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, {backgroundColor: accentColor}]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Chapter</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Quantum Mechanics..." 
              placeholderTextColor="#666"
              value={newChapterTitle}
              onChangeText={setNewChapterTitle}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.addBtn, {backgroundColor: accentColor}]} onPress={handleAddChapter}>
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  chapterRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#333'
  },
  chapterInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  sparkle: { fontSize: 12, marginRight: 10, marginTop: -2 },
  chapterTitle: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  revisionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  revisionText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 15 },
  emptyText: { color: '#888', textAlign: 'center' },
  
  fab: {
    position: 'absolute', right: 24, bottom: 30,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8,
  },
  fabText: { color: '#121212', fontSize: 32, fontWeight: 'bold', marginTop: -2 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E1E1E', width: '85%', padding: 24, borderRadius: 16 },
  modalHeader: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#2C2C2C', color: '#FFF', padding: 16, borderRadius: 8, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 12, marginRight: 8 },
  cancelText: { color: '#888', fontSize: 16, fontWeight: '600' },
  addBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  addText: { color: '#121212', fontSize: 16, fontWeight: 'bold' }
});
