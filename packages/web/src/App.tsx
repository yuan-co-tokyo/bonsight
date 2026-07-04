import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { fetchAuthSession } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import S0Landing from './screens/S0Landing'
import S1Home from './screens/S1Home'
import S2Form from './screens/S2Form'
import S3Detail from './screens/S3Detail'
import S4Upload from './screens/S4Upload'
import S5AiResult from './screens/S5AiResult'
import S6AiChat from './screens/S6AiChat'
import S7Viewer from './screens/S7Viewer'
import S8Settings from './screens/S8Settings'
import { UserProvider } from './contexts/UserContext'

function AppRoutes({ authed }: { authed: boolean }) {
  if (!authed) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<S0Landing />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/s0" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<S1Home />} />
        <Route path="/s1" element={<S1Home />} />
        <Route path="/s2" element={<S2Form />} />
        <Route path="/bonsai/new" element={<S2Form />} />
        <Route path="/bonsai/:id/edit" element={<S2Form />} />
        <Route path="/bonsai/:id/photo" element={<S4Upload />} />
        <Route path="/bonsai/:id/ai" element={<S5AiResult />} />
        <Route path="/bonsai/:id" element={<S3Detail />} />
        <Route path="/s3/:id" element={<S3Detail />} />
        <Route path="/s3" element={<S3Detail />} />
        <Route path="/s4/:bonsaiId" element={<S4Upload />} />
        <Route path="/s4" element={<S4Upload />} />
        <Route path="/s5/:photoId" element={<S5AiResult />} />
        <Route path="/s5" element={<S5AiResult />} />
        <Route path="/s6" element={<S6AiChat />} />
        <Route path="/s7/:mediaId" element={<S7Viewer />} />
        <Route path="/s7" element={<S7Viewer />} />
        <Route path="/s8" element={<S8Settings />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        setAuthed(!!session.tokens?.idToken)
      })
      .catch(() => setAuthed(false))

    const unsubscribe = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setAuthed(true)
          break
        case 'signInWithRedirect':
          try {
            await fetchAuthSession()
            setAuthed(true)
            if (window.location.search.includes('code=')) {
              window.history.replaceState({}, document.title, window.location.pathname)
            }
          } catch {
            setAuthed(false)
          }
          break
        case 'signInWithRedirect_failure':
          setAuthed(false)
          break
        case 'signedOut':
          setAuthed(false)
          break
      }
    })

    return unsubscribe
  }, [])

  if (authed === null) return null

  return (
    <UserProvider authed={authed}>
      <AppRoutes authed={authed} />
    </UserProvider>
  )
}
