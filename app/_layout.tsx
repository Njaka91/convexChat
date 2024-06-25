import { Link, Stack } from 'expo-router';
import {ConvexProvider, ConvexReactClient} from 'convex/react'
import { StatusBar, TouchableOpacity } from 'react-native';
import {Ionicons} from '@expo/vector-icons'
import { useEffect } from 'react';
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false
});

export default function RootLayoutNav() {

  useEffect(() => {
    // Configuration du StatusBar
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#1a1a1a');
  }, []);

  return (
    <ConvexProvider client={convex}>
      
       <Stack
       screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
          color: '#fff'
        }
      }}>
        <Stack.Screen
        name='index'
        options={{
          headerTitle: 'HAFATRA',
          headerRight: () => (
            <Link href={'/(modal)/create'} asChild>
              <TouchableOpacity
              style={{
                backgroundColor: '#EEA217',
                borderColor : "#2b2a2a",
                padding: 1,
                borderRadius: 30,
                borderWidth: 3, 
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#fff', 
                shadowOffset: { width: -10, height: 10 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 2, 
                elevation: 5, 
              }}>
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            </Link>
          )
        }}
        />
        <Stack.Screen
        name='(modal)/create'
        options={{
          headerTitle: 'Start a chat',
          presentation: 'modal',
          headerRight: () => (
            <Link href={'/'} asChild>
              <TouchableOpacity>
              </TouchableOpacity>
            </Link>
          )
        }}
        />
        <Stack.Screen name="(chat)/[chatid]" options={{
          headerTitle: '',
        }}/>
      </Stack>
    </ConvexProvider>
     
  );
}
