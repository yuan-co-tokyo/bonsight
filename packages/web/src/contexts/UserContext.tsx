import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { UserDto } from 'shared'
import { getMe } from '../api/meApi'

interface UserContextValue {
  user: UserDto | null
  refreshUser: () => void
}

// eslint-disable-next-line react-refresh/only-export-components -- Existing public context API is shared with its provider.
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear the authenticated profile when Amplify signals sign-out.
      setUser(null)
    }
  }, [authed, fetchUser])

  return (
    <UserContext.Provider value={{ user, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Existing public hook shares the provider module.
export function useUser() {
  return useContext(UserContext)
}
