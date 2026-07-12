import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './components/LandingPage'
import LoveMessagePage from './components/LoveMessagePage'

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/message/:slug" element={<LoveMessagePage />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
