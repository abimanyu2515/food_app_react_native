import { Text, Button, FlatList, View } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import seed from '@/lib/seed'
import useAppwrite from '@/lib/useAppwrite'
import { getCategories, getMenu } from '@/lib/appwrite'
import { useLocalSearchParams } from 'expo-router'
import CartButton from '@/components/CartButton'
import cn from 'clsx'
import MenuCard from '@/components/MenuCard'
import { MenuItem } from '@/type'
import SearchBar from '@/components/SearchBar'
import Filter from '@/components/Filter'

const search = () => {
  const { query, category } = useLocalSearchParams<{ query: string; category: string }>();
  
  const { data, refetch, loading } = useAppwrite({ fn: getMenu, params: { category, query, limit: 5, }});
  const { data : categories } = useAppwrite({ fn: getCategories })

  useEffect(() => {
    refetch({ category, query, limit: 5 })
  }, [category, query])
  
  return (
    <SafeAreaView className='bg-white h-full'>
      <FlatList 
        data={data} 
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;
          return (
            <View className={cn('flex-1 max-w-[48%]', isEven ? 'mt-10' : 'mt-0')}>
              <MenuCard item={item as MenuItem} />
            </View>
          )
        }} 
        keyExtractor={item => item.$id}
        numColumns={2}
        columnWrapperClassName='gap-7'
        contentContainerClassName='gap-7 px-5 pb-32'
        ListHeaderComponent={() => (
          <View className='my-5 gap-5 px-2.5'>
            <View className='flex-between flex-row w-full'>
              <View className='flex-start'>
                <Text className='small-bold uppercase text-primary'>SEARCH</Text>
                <View className='flex-start flex-row gap-x-1 mt-0.5'>
                  <Text className='paragraph-semibold text-dark-100'>Find your favourite food</Text>
                </View>
              </View>

              <CartButton />
            </View>

            <SearchBar />

            <Filter categories={categories!} />
          </View>
        )}
        ListEmptyComponent={() => !loading && <Text>No results found</Text>}
      />
    </SafeAreaView>
  )
}

export default search