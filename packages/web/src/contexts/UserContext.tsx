import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { UserDto } from 'shared'
import { getMe } from '../api/meApi'

interface UserContextValue {
  user: UserDto | null
  refreshUser: () => void
}

export const UserContext = createContext<UserContextValue>({
  user: null,
  refreshUser: () => {},
})

export function UserProvider({ authed, children }: { authed: boolean; children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)

  const fetchUser = useCallback(() => {
    getMe().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (authed) {
      fetchUser()
    } else {
      setUser(null)
    }
  }, [authed, fetchUser])

  return (
    <UserContext.Provider value={{ user, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
