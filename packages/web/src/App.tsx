import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import S0Landing from './screens/S0Landing'
import S1Home from './screens/S1Home'
import S2Form from './screens/S2Form'
import S3Detail from './screens/S3Detail'
import S4Upload from './screens/S4Upload'
import S5AiResult from './screens/S5AiResult'
import S6AiChat from './screens/S6AiChat'
import S7Viewer from './screens/S7Viewer'
import S8Settings from './screens/S8Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/s0" replace />} />
        <Route path="/s0" element={<S0Landing />} />
        <Route path="/s1" element={<S1Home />} />
        <Route path="/s2" element={<S2Form />} />
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
      </Routes>
    </BrowserRouter>
  )
}
