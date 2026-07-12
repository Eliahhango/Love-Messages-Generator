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
  'You turned my ordinary life into something extraordinary, {name}.',
  'Loving you is the easiest and best thing I have ever done, {name}.',
  'You are the reason I believe in forever, {name}.',
  'My favorite place in the world is right next to you, {name}.',
  'You make the hard days softer and the good days brighter, {name}.',
  'I didn\'t know what love was until I found you, {name}.',
  'You are my calm in the storm and my fire in the cold, {name}.',
  'Every love song suddenly makes sense because of you, {name}.',
  'You are the missing piece I never knew I was looking for, {name}.',
  'Being loved by you feels like coming home, {name}.',
  'You are my today and all of my tomorrows, {name}.',
  'I love the way you make even the smallest moments feel magical, {name}.',
  'You are my favorite notification, {name}.',
  'You + me = my favorite love story, {name}.',
  'Falling for you was like breathing — I just didn\'t notice at first, {name}.',
  'You had me at hello, {name}.',
  'My heart did a little flip the moment I saw you, {name}.',
  'You are the plot twist I never saw coming, {name}.',
  'Just thinking about you makes me smile like a fool, {name}.',
  'You are my sunrise and my sunset, {name}.',
  'I love you more than yesterday and less than tomorrow, {name}.',
  'You are the best thing that has ever happened to me, {name}.',
  'Together is my favorite place to be, {name}.',
  'I want to grow old with you and still hold your hand, {name}.',
  'You are the one my soul loves, {name}.',
  'No matter where life takes me, my heart will always find its way back to you, {name}.',
  'You are my once in a lifetime, {name}.',
  'I carry your heart with me everywhere I go, {name}.',
  'You are my greatest adventure and my sweetest destination, {name}.',
  'Time stops when I look into your eyes, {name}.',
  'I choose you, today and every day, {name}.',
  'You are the love of my life and the song in my heart, {name}.',
]

const HEART_EMOJIS = ['💗', '💕', '💖', '💘', '❤️', '💓']

interface FloatingHeart {
  id: number
  left: number
  size: number
  duration: number
  drift: number
  emoji: string
}

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
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([])
  const [generatedUrl, setGeneratedUrl] = useState('')

  const nextMessage = useCallback(() => {
    setCurrentMessage((prev) => (prev + 1) % LOVE_MESSAGES.length)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.4
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: 14 + Math.random() * 14,
        duration: 3 + Math.random() * 3,
        drift: -30 + Math.random() * 60,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      }
      setFloatingHearts((prev) => [...prev.slice(-15), newHeart])
    }, 700)

    return () => clearInterval(interval)
  }, [isPaused])

  useEffect(() => {
    const cleanup = setInterval(() => {
      setFloatingHearts((prev) => prev.filter((h) => Date.now() - h.id < 7000))
    }, 2000)
    return () => clearInterval(cleanup)
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
        playPromise.catch(() => {})
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
    <div className="min-h-screen w-full bg-[#FFE4E6] flex flex-col items-center py-8 px-4 sm:px-6 md:px-8">
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/in-love.mp3" type="audio/mpeg" />
      </audio>

      <header className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">
          Love Message Generator
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">made by EliTechWiz</p>
      </header>

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="relative bg-[#FFE4E1] px-4 sm:px-6 pt-6 pb-4 flex flex-col items-center overflow-hidden h-28 sm:h-32">
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            {floatingHearts.map((heart) => (
              <span
                key={heart.id}
                className="float-heart absolute bottom-0"
                style={{
                  left: `${heart.left}%`,
                  fontSize: `${heart.size}px`,
                  '--duration': `${heart.duration}s`,
                  '--drift': `${heart.drift}px`,
                } as React.CSSProperties}
              >
                {heart.emoji}
              </span>
            ))}
          </div>
          <div className="relative z-10 mt-6">
            <ChevronDown className="w-8 h-8 sm:w-10 sm:h-10 text-[#C41E3A] stroke-[3]" />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">
              A Special Message For You
            </h2>
            <p className="text-sm text-red-400">Dear {displayName}</p>
            <p className="text-xs text-gray-400">made by EliTechWiz</p>
          </div>

          <div className="border border-pink-200 rounded-xl p-4 sm:p-6 mx-0 sm:mx-2 bg-white">
            <p className="text-gray-700 italic text-center leading-relaxed text-sm sm:text-base lg:text-lg">
              "{getMessageText(currentMessage)}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleNewMessage}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold
                px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer w-full sm:w-auto"
            >
              <Heart className="w-4 h-4 fill-white" />
              New message
            </button>
            <button
              onClick={handleTogglePlay}
              className="flex items-center justify-center gap-2 bg-[#FFE4E6] hover:bg-[#FDDDE6] text-[#C41E3A] font-bold
                px-5 py-2.5 rounded-lg transition-colors text-sm cursor-pointer border border-[#F8BBD0] w-full sm:w-auto"
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

          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
        <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold
              px-6 sm:px-8 py-3 sm:py-3.5 rounded-full transition-colors text-sm sm:text-base cursor-pointer w-full sm:w-auto"
          >
            💗 Create Your Own Love Message 💗
          </button>
          <p className="text-xs text-gray-500 text-center px-4">
            Spread the love by creating your own message to share
          </p>
        </div>
      )}

      {isCreating && !isReady && (
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg w-full max-w-md p-5 sm:p-6 space-y-4">
          <h3 className="text-center font-bold text-red-600 text-base sm:text-lg">
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
          <div className="flex flex-col sm:flex-row gap-3">
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
                setGeneratedUrl(generateUrl(newName))
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
        <div className="mt-6 sm:mt-8 space-y-3 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 space-y-4">
            <h3 className="text-center font-bold text-red-600 text-base sm:text-lg">
              Your Love Message is Ready!
            </h3>
            <div className="bg-[#F5E6F0] border border-[#E8D0E0] rounded-lg p-3 sm:p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Share this link with {newName.trim()}:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 rounded-lg overflow-hidden border border-gray-300">
                <input
                  readOnly
                  value={generatedUrl}
                  className="flex-1 min-w-0 px-4 py-2.5 bg-white text-gray-900 text-xs sm:text-sm border-0 outline-none truncate sm:border-r sm:border-gray-300"
                />
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm shrink-0 cursor-pointer transition-colors"
                >
                  {copied ? (
                    <span className="flex items-center justify-center gap-1">
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
