import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = api.getToken()
    if (token) {
      try {
        const userData = await api.getMe()
        setUser(userData)
      } catch (error) {
        api.logout()
        setUser(null)
      }
    }
    setLoading(false)
  }

  const login = async (username, password) => {
    const data = await api.login(username, password)
    setUser(data.user)
    return data
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'admin' || user?.role === 'manager',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
