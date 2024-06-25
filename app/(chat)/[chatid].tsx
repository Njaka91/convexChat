import { View, Text,SafeAreaView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ListRenderItem, FlatList, Keyboard, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc, Id } from '@/convex/_generated/dataModel'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { Modal, PaperProvider, Portal, Surface } from 'react-native-paper'
import ImageViewer from 'react-native-image-zoom-viewer';

const Page = () => {
  const {chatid} = useLocalSearchParams()
  const [user, setUser] = useState<string | null>()
  const convex = useConvex()
  const navigation = useNavigation()
  const [newMessage, setNewMessage] = useState('')
  const addMessage = useMutation(api.messages.sendMessage)
  const messages = useQuery(api.messages.get, {chatId: chatid as Id<'groups'>}) || []
  const [visible, setVisible] = React.useState(false);
  const listRef = useRef<FlatList>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [pressedImage, setPressedImage] = useState<string | null>(null)
  // const [imageUrls, setImageUrls] = useState<{ url: string }[]>([]);
  // const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [uploading, setUploading] = useState(false)

  const showModal = () => {
    setVisible(true)
  };
  const hideModal = () => {
    setVisible(false);
    setPressedImage(null);
  }
  const containerStyle = {backgroundColor: '#1a1a1a', padding: 10};

  useEffect(() => {
    const loadGroup = async () => {
      const groupInfo = await convex.query(api.groups.getGroup, {id: chatid as Id<'groups'>});
      navigation.setOptions({headerTitle: groupInfo?.name});
    }
    loadGroup();
  }, [chatid]);  

  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem('user');
      setUser(user);
    }
    loadUser();
  }, []);
  

  // useEffect(() => {
  //   if (messages.length > 0) {
  //     const urls = messages
  //       .filter((message) => message.file !== undefined) 
  //       .map((message) => ({ url: message.file! }));
  //       console.log(urls);
  //     setImageUrls(urls);
  //   }
  // }, [messages]);
  
  
  

  useEffect(() =>{
    setTimeout(() => {
      listRef.current?.scrollToEnd({animated: true})
    },100)
  }, [messages])

  const handleSendMessage = async () => {
    Keyboard.dismiss()
 
    if (selectedImage) {
      setUploading(true)
      const url = `${process.env.EXPO_PUBLIC_CONVEX_SITE}/sendImage?user=${encodeURIComponent(user!)}&group_id=${chatid}&content=${encodeURIComponent(newMessage)}`;

      
      const response = await fetch(selectedImage)
      const blob = await response.blob()

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': blob.type!
        },
        body: blob
      }).then(() => {
        setSelectedImage(null)
        setNewMessage('')
      })
      .catch((error) => console.log(error))
      .finally(() => setUploading(false))

    } else {
      addMessage({
        group_id: chatid as Id<'groups'>,
        content: newMessage,
        user:  user || 'Anon'
      })
    }
   
    setNewMessage('')
  }

  const renderMessage: ListRenderItem<Doc<'messages'>> = ({item, index}) => {
    const isUserMessage = item.user === user

    return (
      
      <View className={`${isUserMessage? 'items-end' : 'items-start'}`}>
        
        <Surface 
        elevation={3}
        style={styles.container}
        className={`p-1 relative rounded-2xl mt-3 max-w-[80%] mx-3 ${
        isUserMessage? 'bg-[#EEA217]' : 'bg-[#2b2b2b]'
        }`}>
        <View className={` rounded-xl px-2 py-1 ${isUserMessage? 'bg-[#ce962f]' : 'bg-[#1a1a1a]'}`}>
        <Text className=' font-semibold text-white'>{isUserMessage ? 'You': `${item.user}`}</Text>
        </View>
        <View className='p-1'>
        {item.content !== '' && <Text className="text-white">{item.content}</Text>}
        {item.file &&
        <TouchableOpacity
        onPress={() => {
          if (item.file) {
            setPressedImage(item.file); 
            showModal();
          }
        }}
        >
          <Image source={{uri: item.file}} className='w-52 h-72 rounded-lg mt-1'/>
        </TouchableOpacity>
        }
        <Text style={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: 11 }}>
        {new Date(item._creationTime).toLocaleTimeString()} 
      </Text>
        </View>
      </Surface> 
      </View> 
    )
  } 

  const captureImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    })
    if (!result.canceled) {
      const uri = result.assets[0].uri
      setSelectedImage(uri)
    }
  }

  return (
    <PaperProvider>
    <SafeAreaView className='flex-1 bg-slate-50'>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      
      className='flex-1 bg-[#1a1a1a]'>
      
      <FlatList
      ref={listRef}
      ListFooterComponent={<View className='p-2'></View>}
      data={messages} renderItem={renderMessage}
      keyExtractor={(item) => item._id.toString()}
      ></FlatList>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <Pressable onPress={hideModal}
          className=' w-10 h-10 rounded-full justify-center items-center flex absolute top-0 right-1 z-50'>
            <Ionicons name='close-outline' size={25} style={{ color: '#EEA217', fontWeight: 'bold' }} />
          </Pressable>
         {pressedImage && <Image source={{uri: pressedImage}} style={{width: '100%', height: '100%', resizeMode: 'contain'}} />}
        </Modal>
      </Portal>


      <View className='py-2 px-5 items-center  bg-[#1a1a1a]'>
        <View className='flex-row justify-start w-full pb-2'>
        {selectedImage && <Image
        source={{uri: selectedImage}} 
        style={{width: 70, height: 90,}}/>}
        </View>
        
        <View className='flex-row '>
        <TextInput className="w-5/6 max-h-[78px] text-slate-200  shadow-lg px-3 py-1 border-neutral-800 bg-[#2b2b2b] border-[0.2px] rounded-xl focus:border-yellow-200"
        placeholder='Type your message'
        placeholderTextColor='#525252'
        value={newMessage} onChangeText={setNewMessage} multiline={true}
        />

        <TouchableOpacity
        className='bg-[#EEA217]   max-h-[35px] shadow-lg items-center flex justify-center px-2  rounded-lg ml-1'
        onPress={captureImage}
        >
          <Ionicons name="image-outline"
          size={18} style={{ color: 'white', fontWeight: 'bold' }}></Ionicons>
        </TouchableOpacity>

        <TouchableOpacity
        className='bg-[#EEA217]   max-h-[35px] shadow-lg items-center flex justify-center px-2  rounded-lg ml-1'
        onPress={handleSendMessage}
        disabled={!selectedImage && !newMessage}
        >
          <Ionicons name='send' 
          size={18} style={{ color: 'white', fontWeight: 'bold' }} 
          />
        </TouchableOpacity>
        </View>
      </View>

      </KeyboardAvoidingView>

        {uploading && (
          <View
          className=''
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
            <ActivityIndicator
            color="#fff" animating size="large"
            />
          </View>
        )}

    </SafeAreaView>
    </PaperProvider>

  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 16,
    marginTop: 12,
    maxWidth: '80%',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8, 
  },
 
});

export default Page