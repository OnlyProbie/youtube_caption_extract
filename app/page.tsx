'use client'

import { useState, useRef } from 'react'
import { segmentText } from '../lib/segment'
import { extractVideoId, parseTimestampToSeconds } from '../lib/utils'
import YouTube, { YouTubePlayer } from 'react-youtube'

type TranscriptResponse = {
  content?: string
  lang?: string
  availableLangs?: string[]
  error?: string
}

export default function Page() {

  const [url, setUrl] = useState('')
  const [lang, setLang] = useState('en')
  const [textOnly, setTextOnly] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TranscriptResponse | null>(null)

  // Summary & Video Player State
  const [videoId, setVideoId] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const playerRef = useRef<YouTubePlayer | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSummary(null)
    setVideoId(null)

    if (!url) {
      setError('请输入有效的YouTube链接')
      return
    }

    const id = extractVideoId(url)
    if (!id) {
      setError('无法解析YouTube视频ID')
      return
    }
    setVideoId(id)

    setLoading(true)
    try {
      const params = new URLSearchParams({
        url,
        lang,
        text: textOnly ? 'true' : 'false'
      })
      const res = await fetch(`/api/transcript?${params.toString()}`)
      const data = (await res.json()) as TranscriptResponse
      if (!res.ok) {
        setError(data.error || '提取失败')
      } else {
        setResult(data)
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  async function generateSummary() {
    if (!result?.content) return
    setIsSummarizing(true)
    try {
      const res = await fetch('/api/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: result.content, lang: result.lang })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '总结生成失败')
      } else {
        setSummary(data.summary)
      }
    } catch {
      setError('网络错误')
    } finally {
      setIsSummarizing(false)
    }
  }

  function onPlayerReady(event: { target: YouTubePlayer }) {
    playerRef.current = event.target
  }

  function handleTimestampClick(timeStr: string) {
    const seconds = parseTimestampToSeconds(timeStr)
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true)
      playerRef.current.playVideo()
    }
  }

  // Custom renderer for summary to make timestamps clickable
  function renderSummary(text: string) {
    // Regex to find [[MM:SS]] or [[HH:MM:SS]]
    const parts = text.split(/(\[\[\d{1,2}:\d{2}(?::\d{2})?\]\])/g)
    return parts.map((part, i) => {
      const match = part.match(/^\[\[(\d{1,2}:\d{2}(?::\d{2})?)\]\]$/)
      if (match) {
        return (
          <button
            key={i}
            onClick={() => handleTimestampClick(match[1])}
            className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-1 rounded mx-1 cursor-pointer"
          >
            {match[1]}
          </button>
        )
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>
    })
  }

  function downloadText() {
    if (!result?.content) return
    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' })
    const urlObj = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = urlObj
    a.download = 'transcript.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(urlObj)
  }

  const segments: string[] = result?.content ? segmentText(result.content, lang) : []

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold mb-6">YouTube 视频字幕提取 & 总结</h1>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
          <div className="space-y-2">
            <label className="block text-sm font-medium">视频链接</label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">语言</label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">en</option>
                <option value="zh">zh</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={textOnly}
                onChange={e => setTextOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>返回纯文本</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? '提取中...' : '提取字幕'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>

        {/* Video Player (Visible when ID is present) */}
        {videoId && (
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow">
            <YouTube
              videoId={videoId}
              onReady={onPlayerReady}
              opts={{ width: '100%', height: '100%' }}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Caption Result */}
        {result?.content && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">字幕内容</h2>
              <div className="space-x-2">
                <button
                  onClick={generateSummary}
                  disabled={isSummarizing}
                  className="rounded bg-green-600 text-white px-3 py-1 hover:bg-green-700 disabled:opacity-60"
                >
                  {isSummarizing ? '生成总结中...' : 'AI 总结'}
                </button>
                <button
                  onClick={downloadText}
                  className="rounded bg-gray-800 text-white px-3 py-1 hover:bg-black"
                >
                  下载字幕
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {segments.length > 0 ? (
                <ul className="bg-white p-4 space-y-2">
                  {segments.map((s, i) => (
                    <li key={i} className="whitespace-pre-wrap">{s}</li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap bg-white p-4">
                  {result.content}
                </pre>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              语言: {result.lang} 可用语言: {result.availableLangs?.join(', ')}
            </p>
          </section>
        )}
      </div>

      {/* AI Summary Side Panel (Desktop) or Bottom (Mobile) */}
      <div className="md:col-span-1">
        {summary && (
          <div className="sticky top-4 bg-white p-4 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🤖 AI 智能总结</span>
            </h2>
            <div className="prose prose-sm prose-blue max-w-none text-gray-700">
              {renderSummary(summary)}
            </div>
          </div>
        )}
        {!summary && result?.content && !isSummarizing && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
            点击“AI 总结”生成带有时间戳的视频摘要
          </div>
        )}
        {isSummarizing && (
          <div className="mt-4 p-8 bg-white rounded-lg shadow flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">正在分析视频内容...</p>
          </div>
        )}
      </div>
    </main>
  )
}
