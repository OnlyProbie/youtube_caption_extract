export function segmentText(content: string, language: string) {
  const t = content.trim()
  if (!t) return []
  if (language.toLowerCase().startsWith('zh')) {
    return t.split(/(?<=[。！？；！？])/).map(s => s.trim()).filter(Boolean)
  }
  return t.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean)
}
