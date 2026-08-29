
import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

    const [ user, setUser ] = useState(null)
    const [ checkingAuth, setCheckingAuth ] = useState(true)

    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setCheckingAuth(false))
    }, [])

    const login = async (email, password) => {
        const data = await loginUser(email, password)
        setUser(data.user)
    }

    const register = async (name, email, password) => {
        const data = await registerUser(name, email, password)
        setUser(data.user)
    }

    const logout = async () => {
        await logoutUser()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, checkingAuth, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
