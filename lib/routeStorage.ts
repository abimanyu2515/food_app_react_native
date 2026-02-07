import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ROUTE_KEY='@last_active_route'

export const saveLastRoute = async (routeName: string) => {
    try {
        await AsyncStorage.setItem(LAST_ROUTE_KEY, routeName)
    } catch (e) {
        console.error('Error saving last route: ', e)
    }
}

export const getLastRoute = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(LAST_ROUTE_KEY)
    } catch (e) {
        console.error('Error getting last route: ', e)
        return null;
    }
}