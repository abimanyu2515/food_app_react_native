import { View, Text, Button } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const SignIn = () => {
  return (
    <View>
        <Text>sign-in</Text>
        <Button title='Sign Up' onPress={() => router.push("/sign-up")} />
        <Button title='Home' onPress={() => router.push("/")} />
    </View>
  )
}

export default SignIn