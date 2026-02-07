import { images } from '@/constants';
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { useDebouncedCallback } from 'use-debounce';

const SearchBar = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query)
  
  const debouncedSearch = useDebouncedCallback(
    (text: string) => router.setParams({ query: text }),
    500,
  )

  const handleSearch = (text: string) => {
    setQuery(text)
    debouncedSearch(text)
  }
  
  return (
    <View className='searchbar'>
      <TextInput 
        className='flex-1 p-5' 
        placeholder='Search for Pizzas, Burgers and more'
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#A0A0A0"
      />
      <TouchableOpacity className='pr-5' onPress={() => console.log("Searched Pressed")}>
        <Image 
          source={images.search}
          className='size-7'
          resizeMode='contain'
          tintColor="#5D5F6D"
        />
      </TouchableOpacity>
    </View>
  )
}

export default SearchBar