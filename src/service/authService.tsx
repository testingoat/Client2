import axios from 'axios'
import { BASE_URL } from './config'
import { tokenStorage } from '@state/storage'
import { useAuthStore } from '@state/authStore'
import { resetAndNavigate } from '@utils/NavigationUtils'
import { appAxios } from './apiInterceptors'

// Type definitions
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    customer?: any;
    deliveryPartner?: any;
}

interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

interface UserResponse {
    user: any;
}

interface AuthResult {
    success: boolean;
    error?: string;
}

type SetUserFunction = (user: any) => void;

export const customerLogin = async (phone: string): Promise<AuthResult> => {
    try {
        const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/customer/login`, { phone })
        const { accessToken, refreshToken, customer } = response.data

        await tokenStorage.set("accessToken", accessToken)
        await tokenStorage.set("refreshToken", refreshToken)

        const { setUser } = useAuthStore.getState()
        setUser(customer)

        return { success: true }
    } catch (error) {
        console.log("Customer Login Error", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed'
        }
    }
}

export const deliveryLogin = async (email: string, password: string): Promise<AuthResult> => {
    try {
        const response = await axios.post<LoginResponse>(`${BASE_URL}/auth/delivery/login`, { email, password })
        const { accessToken, refreshToken, deliveryPartner } = response.data

        await tokenStorage.set("accessToken", accessToken)
        await tokenStorage.set("refreshToken", refreshToken)

        const { setUser } = useAuthStore.getState()
        setUser(deliveryPartner)

        return { success: true }
    } catch (error) {
        console.log("Delivery Login Error", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed'
        }
    }
}

export const refresh_tokens = async (): Promise<string | null> => {
    try {
        const refreshToken = tokenStorage.getString('refreshToken')

        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const response = await axios.post<RefreshTokenResponse>(`${BASE_URL}/auth/refresh-token`, {
            refreshToken
        })

        const new_access_token = response.data.accessToken
        const new_refresh_token = response.data.refreshToken

        await tokenStorage.set('accessToken', new_access_token)
        await tokenStorage.set('refreshToken', new_refresh_token)

        return new_access_token
    } catch (error) {
        console.log("REFRESH TOKEN ERROR", error)
        await tokenStorage.clearAll()
        resetAndNavigate("CustomerLogin")
        return null
    }
}

export const refetchUser = async (setUser: SetUserFunction): Promise<boolean> => {
    try {
        const response = await appAxios.get<UserResponse>(`/user`)
        
        if (response && response.data && response.data.user) {
            setUser(response.data.user)
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log("Refetch User Error", error)
        return false
    }
}

export const updateUserLocation = async (data: Record<string, any>, setUser: SetUserFunction): Promise<boolean> => {
    try {
        await appAxios.patch(`/user`, data)
        await refetchUser(setUser)
        return true
    } catch (error) {
        console.log("Update User Location Error", error)
        return false
    }
}