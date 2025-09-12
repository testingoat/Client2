import AsyncStorage from '@react-native-async-storage/async-storage'

// AsyncStorage-based token storage for better Android 8 compatibility
export const tokenStorage = {
    set: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(`token_${key}`, value)
            // Update cache immediately
            tokenCache[key] = value;
        } catch (error) {
            console.error('Token storage set error:', error)
        }
    },
    getString: (key: string): string | undefined => {
        try {
            // For synchronous compatibility, we'll use a cached approach
            const value = tokenCache[key];
            return value;
        } catch (error) {
            console.error('Token storage get error:', error)
            return undefined
        }
    },
    clearAll: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys()
            const tokenKeys = keys.filter(key => key.startsWith('token_'))
            await AsyncStorage.multiRemove(tokenKeys)
            // Clear cache
            Object.keys(tokenCache).forEach(key => delete tokenCache[key])
        } catch (error) {
            console.error('Token storage clear error:', error)
        }
    }
}

// Cache for synchronous access
const tokenCache: Record<string, string> = {}

// Initialize token cache
const initTokenCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys()
        const tokenKeys = keys.filter(key => key.startsWith('token_'))
        const values = await AsyncStorage.multiGet(tokenKeys)
        values.forEach(([key, value]) => {
            if (value) {
                const cleanKey = key.replace('token_', '')
                tokenCache[cleanKey] = value
            }
        })
    } catch (error) {
        console.error('Token cache init error:', error)
    }
}

// Initialize cache on app start
initTokenCache()

export const storage = AsyncStorage

export const mmkvStorage = {
    setItem: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value)
        } catch (error) {
            console.error('Storage set error:', error)
        }
    },
    getItem: async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key)
            return value
        } catch (error) {
            console.error('Storage get error:', error)
            return null
        }
    },
    removeItem: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key)
        } catch (error) {
            console.error('Storage remove error:', error)
        }
    }
}