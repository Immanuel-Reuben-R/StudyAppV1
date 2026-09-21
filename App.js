import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator } from 'react-native';
import { initDB } from './src/database';

import HomeScreen from './src/screens/HomeScreen';

// Placeholders for the other screens we will build next
const SubjectScreen = () => <View style={{flex: 1, backgroundColor: '#121212'}}><Text style={{color: 'white'}}>Subject Chapters Here</Text></View>;
const NoteEditorScreen = () => <View style={{flex: 1, backgroundColor: '#121212'}}><Text style={{color: 'white'}}>Notes & AI Enhancer Here</Text></View>;
const SettingsScreen = () => <View style={{flex: 1, backgroundColor: '#121212'}}><Text style={{color: 'white'}}>API Keys Here</Text></View>;

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
          options={{ title: 'My Study Notes' }} 
        />
        <Stack.Screen name="Subject" component={SubjectScreen} options={({ route }) => ({ title: route.params?.subjectName || 'Subject' })} />
        <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Account Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
