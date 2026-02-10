import { View, Text, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCartStore } from '@/store/cart.store'
import CustomHeader from '@/components/CustomHeader';
import { PaymentInfoStripeProps } from '@/type';
import cn from 'clsx'
import CustomButton from '@/components/CustomButton';
import CartItem from '@/components/CartItem';

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle }: PaymentInfoStripeProps) => (
  <View>
    <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
      {label}
    </Text>
    <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
      {value}
    </Text>
  </View>
)

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  
  return (
    <SafeAreaView className='bg-white h-full'>
      <FlatList 
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName='pb-28 px-5 pt-5'
        ListHeaderComponent={() => <CustomHeader title='Your Cart' />}
        ListEmptyComponent={() => <Text>Cart Empty</Text>}
        ListFooterComponent={() => totalItems > 0 && (
          <View className='gap-5'>
            <View className='mt-6 border border-gray-200 p-5 rounded-2xl'>
              <Text className='mb-5 h3-bold text-dark-100'>
                Payment Summary
              </Text>

              <PaymentInfoStripe
                 label={`Total items (${totalItems})`}
                 value={`$${totalPrice.toFixed(2)}`} 
              />
              <PaymentInfoStripe
                 label={`Delivery fee`}
                 value={`$5.00`} 
              />

              <View className='border-t border-gray-600 my-2' />
              <PaymentInfoStripe
                label={`Total Amount`}
                value={`$${(totalPrice + 5).toFixed(2)}`} 
                labelStyle='base-bold !text-dark-100'
                valueStyle='base-bold !text-dark-100'
              />
            </View>

            <CustomButton title='Place Order' />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Cart