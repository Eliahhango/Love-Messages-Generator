import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Pause, Play, ChevronDown, Check } from 'lucide-react'

const LOVE_MESSAGES = [
  'My heart whispers your name, {name}, with every beat.',
  'Every moment with you feels like a beautiful dream, {name}.',
  'You are the sunshine that brightens my darkest days, {name}.',
  'My love for you grows deeper with each passing moment, {name}.',
  'In a world full of chaos, you are my peaceful escape, {name}.',
  'You make my heart smile in ways no one else ever could, {name}.',
  'I fall in love with you more and more every single day, {name}.',
  'Your love is the most precious gift I have ever received, {name}.',
]

function generateMessageId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateUrl(name: string): string {
  const base = window.location.origin
  const id = generateMessageId()
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
  return `${base}/message/${id}-${slug}`
}

export default function LoveMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const recipientName = slug ? slug.split('-').slice(1).join('-') : 'Someone'
  const displayName = recipientName.charAt(0).toUpperCase() + recipientName.slice(1)

  const [currentMessage, setCurrentMessage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [newName, setNewName] = useState('')
  const [copied, setCopied] = useState(false)

  const generatedUrl = isReady ? generateUrl(newName) : ''

  const nextMessage = useCallback(() => {
    setCurrentMessage((prev) => (prev + 1) % LOVE_MESSAGES.length)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.4
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextMessage, 4000)
    return () => clearInterval(interval)
  }, [isPaused, nextMessage])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPaused) {
      audio.pause()
    } else {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked by browser — user interaction required
        })
      }
    }
  }, [isPaused])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
      }
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleFirstInteraction = () => {
      if (audio.paused && !isPaused) {
        audio.play().catch(() => {})
      }
      document.removeEventListener('click', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    return () => document.removeEventListener('click', handleFirstInteraction)
  }, [isPaused])

  const getMessageText = (index: number) => {
    return LOVE_MESSAGES[index].replace(/\{name\}/g, displayName)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = generatedUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateAnother = () => {
    setIsReady(false)
    setIsCreating(true)
    setNewName('')
    setCopied(false)
  }

  const handleTogglePlay = () => {
    setIsPaused((prev) => !prev)
  }

  const handleNewMessage = () => {
    nextMessage()
    if (isPaused) {
      setIsPaused(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFE4E6] flex flex-col items-center py-8 px-4">
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/in-love.mp3" type="audio/mpeg" />
      </audio>

      <header className="text-center mb-6 space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-red-600">
          Love Message Generator
        </h1>
        <p className="text-sm text-gray-400">made by EliTechWiz</p>
      </header>

      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full overflow-hidden">
        <div className="relative bg-[#FFE4E1] px-6 pt-6 pb-4 flex flex-col items-center">
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-4 pt-1">
            <div className="flex gap-1">
              <span className="text-base opacity-70">💗</span>
              <span className="text-xs opacity-50 mt-1">💕</span>
            </div>
            <div className="flex gap-1">
              <span className="text-xs opacity-60 mt-1">💗</span>
              <span className="text-base opacity-70">💕</span>
              <span className="text-sm opacity-50 mt-2">💗</span>
            </div>
            <div className="flex gap-1">
              <span className="text-sm opacity-60 mt-1">💕</span>
              <span className="text-xs opacity-40">💗</span>
            </div>
          </div>
          <div className="mt-6">
            <ChevronDown className="w-10 h-10 text-[#C41E3A] stroke-[3]" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              A Special Message For You
            </h2>
            <p className="text-sm text-red-400">Dear {displayName}</p>
            <p className="text-xs text-gray-400">made by EliTechWiz</p>
          </div>

          <div className="border border-pink-200 rounded-xl p-6 mx-2 bg-white">
            <p className="text-gray-700 italic text-center leading-relaxed text-sm sm:text-base">
              "{getMessageText(currentMessage)}"
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleNewMessage}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold
                px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              New message
            </button>
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 bg-[#FFE4E6] hover:bg-[#FDDDE6] text-[#C41E3A] font-bold
                px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer border border-[#F8BBD0]"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2">
            {LOVE_MESSAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentMessage(i)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  i === currentMessage
                    ? 'bg-[#C41E3A]'
                    : 'bg-[#FFE0E6] hover:bg-[#FFCCD5]'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Someone special wanted to share these love messages with you.
          </p>
        </div>
      </div>

      {!isCreating && !isReady && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold
              px-8 py-3.5 rounded-full transition-colors text-sm sm:text-base cursor-pointer"
          >
            💗 Create Your Own Love Message 💗
          </button>
          <p className="text-xs text-gray-500 text-center">
            Spread the love by creating your own message to share
          </p>
        </div>
      )}

      {isCreating && !isReady && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 space-y-4">
          <h3 className="text-center font-bold text-red-600 text-lg">
            Create Your Own Love Message
          </h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your beloved's name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter their name"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsCreating(false)
                setNewName('')
              }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-red-600 text-red-600 font-bold
                text-sm cursor-pointer hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!newName.trim()}
              onClick={() => {
                setIsCreating(false)
                setIsReady(true)
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                newName.trim()
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Generate Link
            </button>
          </div>
        </div>
      )}

      {isReady && (
        <div className="mt-8 space-y-3 max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h3 className="text-center font-bold text-red-600 text-lg">
              Your Love Message is Ready!
            </h3>
            <div className="bg-[#F5E6F0] border border-[#E8D0E0] rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Share this link with {newName.trim()}:
              </label>
              <div className="flex items-stretch rounded-lg overflow-hidden border border-gray-300">
                <input
                  readOnly
                  value={generatedUrl}
                  className="flex-1 min-w-0 px-4 py-2.5 bg-white text-gray-900 text-sm border-0 outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm shrink-0 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" /> Copied!
                    </span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                When shared, this link will display with a beautiful love-themed
                thumbnail featuring {newName.trim()}'s name.
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateAnother}
            className="block mx-auto text-sm text-red-600 hover:text-red-800 underline cursor-pointer transition-colors"
          >
            Create another message
          </button>
        </div>
      )}
    </div>
  )
}
