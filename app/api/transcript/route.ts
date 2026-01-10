export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const lang = searchParams.get('lang') || 'en'
  const text = searchParams.get('text') || 'true'

  if (!url) {
    return new Response(JSON.stringify({ error: '缺少url参数' }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    })
  }

  const apiKey = process.env.SUPADATA_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: '未配置API密钥' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }

  const supaUrl = `https://api.supadata.ai/v1/transcript?url=${encodeURIComponent(
    url
  )}&lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`

  const resp = await fetch(supaUrl, {
    headers: {
      'x-api-key': apiKey
    }
  })

  const body = await resp.text()
  return new Response(body, {
    status: resp.status,
    headers: {
      'content-type': resp.headers.get('content-type') || 'application/json'
    }
  })
}
