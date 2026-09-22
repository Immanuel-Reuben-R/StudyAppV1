import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { initDB } from './src/database';
import { Ionicons } from '@expo/vector-icons';

// Import all the actual screens we built
import HomeScreen from './src/screens/HomeScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    try {
      initDB();
      setDbInitialized(true);
    } catch (e) {
      console.error("Failed to initialize database:", e);
    }
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: 'white', marginTop: 10 }}>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1E1E1E' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={({ navigation }) => ({ 
            title: 'My Study Notes',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginRight: 20, opacity: 0.4 }} disabled={true}>
                  <Ionicons name="search" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )
          })} 
        />
        <Stack.Screen name="Subject" component={SubjectScreen} />
        <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Account Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
