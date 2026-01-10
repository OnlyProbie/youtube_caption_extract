'use client'

import { useState } from 'react'
import { segmentText } from '../lib/segment'

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!url) {
      setError('请输入有效的YouTube链接')
      return
    }
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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">YouTube 视频字幕提取</h1>
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

      {result?.content && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">字幕内容</h2>
            <button
              onClick={downloadText}
              className="rounded bg-gray-800 text-white px-3 py-1 hover:bg-black"
            >
              下载字幕
            </button>
          </div>
          {segments.length > 0 ? (
            <ul className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-2">
              {segments.map((s, i) => (
                <li key={i} className="whitespace-pre-wrap">{s}</li>
              ))}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap bg-white p-4 rounded-lg shadow border border-gray-200">
              {result.content}
            </pre>
          )}
          <p className="text-sm text-gray-600 mt-2">
            语言: {result.lang} 可用语言: {result.availableLangs?.join(', ')}
          </p>
        </section>
      )}
    </main>
  )
}
