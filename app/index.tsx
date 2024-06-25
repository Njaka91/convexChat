import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Link } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Dialog from 'react-native-dialog'
import { Surface } from 'react-native-paper'

const Page = () => {
    const groups = useQuery(api.groups.get) || []
    const [name, setName] = useState("")
    const [visible, setVisible] = useState(false)
    const [greeting, setGreeting] = useState('')
    const perfomGreetingAction = useAction(api.greetings.getGreeting)

    useEffect(() => {
      const loadUser = async () => {
        const user = await AsyncStorage.getItem('user')
        if (!user) {
          setTimeout(() =>{
            setVisible(true)
          },100)
        } else{
          setName(user)
        }
      }
      loadUser()
    }, [])
    
    useEffect(() => {
      if (!name) return
      const loadGreeting = async () => {
        const greeting = await perfomGreetingAction({name})
        setGreeting(greeting)
      }
      loadGreeting()
    }, [name])

    const setUser = async () => {
      let r = (Math.random()+1).toString(36).substring(7)
      const userName = `${name}#${r}`
      await AsyncStorage.setItem('user', userName)
      setName(userName) 
      setVisible(false)
    }

    return (
      <View className='h-full bg-[#1b1b1b] py-2'>
        <ScrollView className='w-full' contentContainerStyle={{ paddingBottom: 20 }}>
          {groups.map((group) => (
            <View key={group._id}>
              <Link className='p-4 bg-[#1b1b1b]' href={{ pathname: '/(chat)/[chatid]', params: { chatid: group._id }}} asChild>
                <TouchableOpacity className='flex-row bg-white'>
                  <Surface elevation={5} className='relative rounded-full border-[#EEA217] border-[2px]'>
                    <Image source={{ uri: group.icon_url }} className='w-10 h-10 rounded-full bg-white' />
                  </Surface>
                  <View className='px-3'>
                    <Text className='font-bold text-slate-200'>
                      {group.name}
                    </Text>
                    <Text className='text-slate-400'>
                      {group.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
              <View className='border-b-[0.1px] border-b-slate-700' style={{ borderBottomWidth: 0.5, marginLeft: '20.33%', marginEnd: '5%' }} />
            </View>
          ))} 
          <Text className='items-center text-slate-300 font-semibold text-center m-5'>{greeting}</Text> 
        </ScrollView>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Username required</Dialog.Title>
          <Dialog.Description>
            Please insert a name to start chatting
          </Dialog.Description>
          <TextInput
            className="px-3 py-1 border-slate-400 border-[0.2px] rounded-xl"
            placeholder='please enter a name to start'
            value={name}
            onChangeText={setName}
          />
          <Dialog.Button label="Enter" onPress={setUser} />
        </Dialog.Container>
      </View>
    );
}

export default Page;
