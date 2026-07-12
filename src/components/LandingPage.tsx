import { useState } from 'react'
import { Music, Check } from 'lucide-react'

const FEATURES = [
  'Automatic slideshow of love messages',
  'Beautiful link thumbnails with your beloved\'s name',
  'Shorter, more shareable links',
  'Unlimited romantic quotes',
  'Beautiful background music',
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

export default function LandingPage() {
  const [name, setName] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')

  const handleGenerate = () => {
    if (!name.trim()) return
    setGeneratedUrl(generateUrl(name))
    setIsGenerated(true)
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

  return (
    <div className="min-h-screen w-full bg-[#FFE4E6] flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8 space-y-5 sm:space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600">
            Love Message Generator
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">made by EliTechWiz</p>
        </header>

        <p className="text-gray-500 text-center leading-relaxed text-sm sm:text-base">
          Create a special love message with romantic background music for your
          beloved one. Enter their name, generate a link, and share it with them
          to show your affection.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-purple-700">
          <Music className="w-4 h-4 shrink-0" />
          <span className="text-center">Now with beautiful background music!</span>
          <span className="shrink-0">💝</span>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
          <h2 className="text-center font-bold text-orange-700 flex items-center justify-center gap-1 text-sm sm:text-base">
            ✨ New Features ✨
          </h2>
          <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-gray-800 marker:text-gray-800">
            {FEATURES.map((feature) => (
              <li key={feature}>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {!isGenerated ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerate()
            }}
          >
            <label
              htmlFor="beloved-name"
              className="block text-sm font-medium text-gray-700"
            >
              Your beloved's name
            </label>
            <input
              id="beloved-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600
                transition-colors"
              placeholder="Enter name..."
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold
                py-2.5 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
            >
              Generate Love Message Link
            </button>
          </form>
        ) : (
          <div className="space-y-3 bg-pink-50 border border-pink-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700">
              Share this link with {name.trim()}:
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
              thumbnail featuring {name.trim()}'s name.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
