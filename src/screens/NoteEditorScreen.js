import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNoteForChapter, saveNote } from '../database';

// PMS 148 (Warm Sandy Terracotta)
const TERRACOTTA = '#FFC77B'; 

export default function NoteEditorScreen({ route, navigation }) {
  const { chapterId, chapterTitle, accentColor } = route.params;
  
  const [activeTab, setActiveTab] = useState('draft'); // 'draft' | 'enhanced'
  const [content, setContent] = useState('');
  
  // History Icon in Header
  useEffect(() => {
    navigation.setOptions({
      title: chapterTitle,
      headerStyle: { backgroundColor: TERRACOTTA, shadowOpacity: 0, elevation: 0, borderBottomWidth: 0 }, 
      headerTintColor: '#333', // Dark text on terracotta
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Ionicons name="time-outline" size={24} color="#333" />
        </TouchableOpacity>
      )
    });
    
    // Load Note
    const note = getNoteForChapter(chapterId);
    if (note) {
      setContent(note.content);
      setActiveTab(note.is_ai_enhanced ? 'enhanced' : 'draft');
    }
  }, [navigation, chapterTitle, chapterId]);

  const handleSave = () => {
    saveNote(chapterId, content, activeTab === 'enhanced' ? 1 : 0);
  };

  // Custom Glassmorphic + Pushed-in Button Component
  const GlassButton = ({ onPress, icon, title, isTab, isActive, style }) => (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.glassBtn,
        isTab && !isActive && styles.glassBtnInactive,
        pressed && styles.glassBtnPressed, // The "Pushed in" effect
        style
      ]}
    >
      {icon && <Text style={[styles.glassIcon, isTab && !isActive && {opacity: 0.5}]}>{icon}</Text>}
      {title && <Text style={[styles.glassBtnText, isTab && !isActive && {opacity: 0.5}]}>{title}</Text>}
    </Pressable>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Tab Switcher */}
      <View style={styles.tabContainer}>
        <GlassButton 
          title="Draft" 
          isTab={true} 
          isActive={activeTab === 'draft'} 
          onPress={() => setActiveTab('draft')} 
          style={{ flex: 1, marginRight: 10 }}
        />
        <GlassButton 
          icon="✨" 
          title="Enhanced" 
          isTab={true} 
          isActive={activeTab === 'enhanced'} 
          onPress={() => setActiveTab('enhanced')} 
          style={{ flex: 1 }}
        />
      </View>

      {/* Editor Area */}
      <View style={styles.editorWrapper}>
        {activeTab === 'draft' ? (
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Start typing your rough notes here..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={content}
            onChangeText={setContent}
            onBlur={handleSave}
            autoCapitalize="sentences"
          />
        ) : (
          <ScrollView style={styles.readingView}>
            {/* Future: Render real Markdown here. For now, it's a styled text block */}
            <Text style={styles.readingText}>
              {content || "No enhanced notes yet. Switch to Draft to write, then hit ✨ Enhance!"}
            </Text>
          </ScrollView>
        )}
      </View>

      {/* Draft Formatting Toolbar (Pinned above keyboard) */}
      {activeTab === 'draft' && (
        <View style={styles.toolbar}>
          <Pressable style={({pressed}) => [styles.toolBtn, pressed && styles.toolBtnPressed]}>
            <Text style={styles.toolText}>B</Text>
          </Pressable>
          <Pressable style={({pressed}) => [styles.toolBtn, pressed && styles.toolBtnPressed]}>
            <Text style={styles.toolText}>•</Text>
          </Pressable>
          <Pressable style={({pressed}) => [styles.toolBtn, pressed && styles.toolBtnPressed]}>
            <Text style={styles.toolText}>H1</Text>
          </Pressable>
          <View style={{flex: 1}} />
          {/* The Core Action Button */}
          <GlassButton icon="✨" title="Enhance" style={styles.actionBtn} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TERRACOTTA },
  
  // Tabs
  tabContainer: { flexDirection: 'row', padding: 16, paddingTop: 10 },
  
  // Glassmorphism System
  glassBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Frosted white
    borderColor: 'rgba(255, 255, 255, 0.6)', // Bright edge
    borderWidth: 1.5,
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 16,
    // Soft outer glow/shadow
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  glassBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0, elevation: 0,
  },
  glassBtnPressed: {
    transform: [{ scale: 0.95 }], // The physical "Squish"
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Darkens slightly
    shadowOpacity: 0, elevation: 0, // Drop shadow to look pushed into the surface
  },
  glassIcon: { fontSize: 16, marginRight: 6 },
  glassBtnText: { color: '#333', fontSize: 16, fontWeight: '700' },

  // Editor
  editorWrapper: { flex: 1, paddingHorizontal: 20 },
  textInput: { 
    flex: 1, fontSize: 18, color: '#222', lineHeight: 28, 
    textAlignVertical: 'top' // Android fix
  },
  readingView: { flex: 1 },
  readingText: { 
    fontSize: 18, color: '#111', lineHeight: 32, 
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' // Serif body text as requested
  },

  // Minimal Toolbar
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Glass strip at bottom
    borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  toolBtn: { padding: 10, marginHorizontal: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
  toolBtnPressed: { transform: [{ scale: 0.9 }], backgroundColor: 'rgba(255,255,255,0.2)' },
  toolText: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  actionBtn: { paddingVertical: 10, backgroundColor: 'rgba(255, 255, 255, 0.6)' }
});
