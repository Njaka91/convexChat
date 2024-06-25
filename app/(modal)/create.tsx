import { View, Text, KeyboardAvoidingView, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Surface } from 'react-native-paper';

const Page = () => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState(' ');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const startGroup = useMutation(api.groups.create);

  const onCreateGroup = async () => {
    setUploading(true);

    try {
      let iconUrl = '';

      // Si une icône est sélectionnée, la télécharger
      if (icon) {
        const response = await fetch(icon);
        const blob = await response.blob();

        // Construire l'URL pour l'upload de l'image
        const url = `${process.env.EXPO_PUBLIC_CONVEX_SITE}/sendImageGroup?description=${encodeURIComponent(desc)}&name=${encodeURIComponent(name)}`;

        // Envoyer l'image au serveur
        const uploadResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': blob.type,
          },
          body: blob,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          iconUrl = uploadData.storageId;
        }
      }

      // Créer le groupe avec l'URL de l'icône (icon_url)
      // const groupId = await startGroup({
      //   name,
      //   description: desc,
      //   icon_url: iconUrl,
      // });

      // if (!groupId) {
      //   throw new Error('Failed to create group.');
      // }

      setIcon(' ');
      router.back();
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const captureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setIcon(uri);
    }
  };

  return (
    <KeyboardAvoidingView className='bg-[#1a1a1a] px-5 flex-1 justify-center'>
      <Surface elevation={3} className='p-6 rounded-3xl bg-[#1a1a1a]'>
        <View className='justify-center items-center'>
          <TouchableOpacity
            className='relative border-[#EEA217] border-4 bg-[#2b2b2b] h-44 w-44 p-1 rounded-full shadow-lg items-center flex justify-center'
            onPress={captureImage}
          >
            <Ionicons className='absolute' name='camera-outline' size={95} style={{ color: '#525252', fontWeight: 'bold' }} />
            <Image source={{ uri: icon }} className='absolute rounded-full h-[163px] w-[163px]' />
          </TouchableOpacity>
        </View>
        
        <View className=''>
          <Text className='mt-4 mb-1 text-slate-200'>Name</Text>
          <TextInput 
            placeholderTextColor='#525252'
            className="px-3 py-1 bg-[#2b2b2b] text-slate-200 border-[0.2px] rounded-xl border-neutral-800 focus:border-yellow-200"
            placeholder='Name of the group'
            value={name} onChangeText={setName}
          />
        </View> 
        
        <View className=''>
          <Text className='mt-4 mb-1 text-slate-200'>Description</Text>
          <TextInput 
            placeholderTextColor='#525252'
            className="px-3 py-1 border-neutral-800 text-slate-200 bg-[#2b2b2b] border-[0.2px] rounded-xl focus:border-yellow-200"
            placeholder='Description of the group'
            value={desc} onChangeText={setDesc}
          />
        </View>
          
        <View className=''>
          <TouchableOpacity onPress={onCreateGroup} className='bg-[#EEA217] p-3 mt-9 rounded-xl'>
            <Text className='text-white text-center font-semibold'>Create</Text>
          </TouchableOpacity>
        </View>
      </Surface>
      
      {uploading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default Page;
