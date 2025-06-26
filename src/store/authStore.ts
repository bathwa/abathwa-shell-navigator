
import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: 'entrepreneur' | 'investor' | 'admin'
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: User['role']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, password: string, role: User['role']) => {
    // Mock login - in real app this would call Supabase
    const mockUser: User = {
      id: '1',
      email,
      role,
      name: email.split('@')[0]
    }
    set({ user: mockUser, isAuthenticated: true })
  },
  logout: () => set({ user: null, isAuthenticated: false })
}))
