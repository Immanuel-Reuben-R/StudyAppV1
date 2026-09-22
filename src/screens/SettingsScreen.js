import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSetting, setSetting } from '../database';

// Neobrutalist Colors
const NEO_COLORS = {
  visual: '#FF90E8', // Pink
  eli5: '#FFC900',   // Yellow
  facts: '#23A094',  // Teal
  story: '#90A8ED',  // Periwinkle
};

const PERSONA_OPTIONS = [
  { id: 'visual', title: 'Visual & Structured', desc: 'Lots of bullet points, tables, and spatial organization.', color: NEO_COLORS.visual },
  { id: 'eli5', title: 'Explain like I\'m 5', desc: 'Simple words. No jargon. Break it down to the absolute basics.', color: NEO_COLORS.eli5 },
  { id: 'facts', title: 'Just the Facts', desc: 'Extremely dense, rapid-fire facts. No fluff. Just what I need for the test.', color: NEO_COLORS.facts },
  { id: 'story', title: 'Story & Analogy', desc: 'Teach me using real-world analogies and narratives.', color: NEO_COLORS.story },
];

export default function SettingsScreen() {
  const [expandedSection, setExpandedSection] = useState('persona'); // 'persona', 'wallet', 'data'
  
  // Settings State
  const [activePersona, setActivePersona] = useState('eli5');
  const [apiKeys, setApiKeys] = useState([
    { id: '1', nickname: 'OpenRouter Free', provider: 'OpenRouter', key: 'sk-or-v1-abc...', status: 'working' },
    { id: '2', nickname: 'Backup Key', provider: 'OpenRouter', key: 'sk-or-v1-xyz...', status: 'invalid' }
  ]);
  const [activeKeyId, setActiveKeyId] = useState('1');
  const [showAddKey, setShowAddKey] = useState(false);

  // Future integration: load/save to SQLite
  // useEffect(() => { ... load from getSetting('api_keys') }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSelectPersona = (id) => {
    setActivePersona(id);
    setSetting('persona', id);
  };

  // --- NEOBRUTALIST CARD COMPONENT ---
  const NeoCard = ({ option, isSelected, onPress }) => (
    <Pressable onPress={onPress} style={styles.neoCardContainer}>
      <View style={[styles.neoCardShadow, isSelected && { top: 0, left: 0 }]} />
      <View style={[
        styles.neoCard, 
        { backgroundColor: option.color },
        isSelected && { transform: [{ translateX: 4 }, { translateY: 4 }] } // Presses down into shadow
      ]}>
        <View style={styles.neoHeader}>
          <Text style={styles.neoTitle}>{option.title}</Text>
          {isSelected && <Ionicons name="checkmark-circle" size={24} color="#000" />}
        </View>
        <Text style={styles.neoDesc}>{option.desc}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        
        {/* SECTION 1: LEARNING PERSONA */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('persona')}>
          <Text style={styles.sectionTitle}>Learning Persona</Text>
          <Ionicons name={expandedSection === 'persona' ? "chevron-up" : "chevron-down"} size={24} color="#FFF" />
        </TouchableOpacity>
        
        {expandedSection === 'persona' && (
          <View style={styles.sectionContent}>
            <Text style={styles.helperText}>How do you want your AI tutor to talk to you?</Text>
            {PERSONA_OPTIONS.map(opt => (
              <NeoCard 
                key={opt.id} 
                option={opt} 
                isSelected={activePersona === opt.id} 
                onPress={() => handleSelectPersona(opt.id)} 
              />
            ))}
          </View>
        )}

        {/* SECTION 2: API WALLET */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('wallet')}>
          <Text style={styles.sectionTitle}>API Wallet</Text>
          <Ionicons name={expandedSection === 'wallet' ? "chevron-up" : "chevron-down"} size={24} color="#FFF" />
        </TouchableOpacity>
        
        {expandedSection === 'wallet' && (
          <View style={styles.sectionContent}>
            <Text style={styles.helperText}>Tap a card to make it your active AI key.</Text>
            
            {apiKeys.map(keyObj => {
              const isActive = activeKeyId === keyObj.id;
              const isWorking = keyObj.status === 'working';
              return (
                <TouchableOpacity 
                  key={keyObj.id} 
                  style={[styles.walletCard, isActive && styles.walletCardActive]}
                  onPress={() => setActiveKeyId(keyObj.id)}
                >
                  <View style={styles.walletCardTop}>
                    <Text style={styles.walletCardNickname}>{keyObj.nickname}</Text>
                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: isWorking ? '#4ECDC4' : '#FF6B6B' }]} />
                      <Text style={styles.statusText}>{isWorking ? 'Working' : 'Rate Limited'}</Text>
                    </View>
                  </View>
                  <Text style={styles.walletCardProvider}>{keyObj.provider} • {keyObj.key}</Text>
                  {isActive && <Text style={styles.activeLabel}>Current Active Key</Text>}
                </TouchableOpacity>
              )
            })}

            <TouchableOpacity style={styles.addKeyBtn} onPress={() => setShowAddKey(true)}>
              <Text style={styles.addKeyText}>+ Add New Key</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 3: DATA & BACKUP */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('data')}>
          <Text style={styles.sectionTitle}>Data & Appearance</Text>
          <Ionicons name={expandedSection === 'data' ? "chevron-up" : "chevron-down"} size={24} color="#FFF" />
        </TouchableOpacity>
        {expandedSection === 'data' && (
          <View style={styles.sectionContent}>
            <Text style={styles.helperText}>Future settings for dark mode tweaks and database exports will go here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginTop: 12,
    borderWidth: 1, borderColor: '#333'
  },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  sectionContent: { padding: 12, backgroundColor: '#181818', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  helperText: { color: '#aaa', fontSize: 14, marginBottom: 16 },

  // NEOBRUTALISM (Persona Quiz)
  neoCardContainer: { marginBottom: 16 },
  neoCardShadow: { 
    position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, 
    backgroundColor: '#000', borderRadius: 8 // Stark solid black shadow
  },
  neoCard: { 
    borderWidth: 3, borderColor: '#000', borderRadius: 8, padding: 16,
    position: 'relative', // ensures it sits above the absolute shadow
  },
  neoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  neoTitle: { color: '#000', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
  neoDesc: { color: '#222', fontSize: 15, fontWeight: '600' },

  // API WALLET
  walletCard: { 
    backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#333'
  },
  walletCardActive: { borderColor: '#4ECDC4', borderWidth: 2, backgroundColor: '#1a2b29' },
  walletCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  walletCardNickname: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  walletCardProvider: { color: '#888', fontSize: 14, fontFamily: 'monospace' },
  activeLabel: { color: '#4ECDC4', fontSize: 12, fontWeight: 'bold', marginTop: 10 },
  
  addKeyBtn: { backgroundColor: '#333', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addKeyText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
