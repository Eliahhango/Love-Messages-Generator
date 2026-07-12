import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoveMessagePage from './components/LoveMessagePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/message/:slug" element={<LoveMessagePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
