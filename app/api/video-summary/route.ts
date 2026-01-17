import OpenAI from 'openai'

export async function POST(request: Request) {
    const { transcript, lang } = await request.json()

    if (!transcript) {
        return new Response(JSON.stringify({ error: '缺少字幕内容' }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
        })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return new Response(JSON.stringify({ error: '未配置OpenAI API密钥' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        })
    }

    const openai = new OpenAI({
        apiKey: apiKey
    })

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `你是一个专业的视频内容分析助手。请深度分析提供的视频字幕，并生成一份详细的结构化内容总结。

重点要求：
1. **详细总结**：请使用**中文**进行总结。不要只列出大纲，要详细阐述每个部分的具体内容、核心论点和关键细节。
2. **时间戳**：**必须**在每个关键点后面附上大概的时间戳，格式必须严格为 **[[MM:SS]]** 或 **[[HH:MM:SS]]**。例如："[[05:23]] 讲到了核心算法..."。请根据字幕中的上下文推断大概时间。
3. **论文提取**：如果视频中提到了相关学术论文（Paper）、技术报告或参考链接，请务必提取其标题和URL（如果字幕中包含URL，或者根据上下文补全常见论文的链接如arXiv）。
4. **格式结构**：
    - 使用 Markdown 格式。
    - 第一部分：详细的内容总结。
    - 第二部分（如果有论文）：在总结结束后，单独列出一个“## 相关论文/参考资源”章节，列出提取到的论文标题和链接。如果无法提取到具体链接，仅列出提到的论文标题也可。`
                },
                {
                    role: 'user',
                    content: `字幕内容如下（语言：${lang}）：\n\n${transcript.substring(0, 100000)}` // 简单的截断防止超长
                }
            ],
            model: 'gpt-4o',
        })

        const summary = completion.choices[0].message.content

        return new Response(JSON.stringify({ summary }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        })
    } catch (error: any) {
        console.error('OpenAI API Error:', error)
        return new Response(JSON.stringify({ error: error.message || '生成总结失败' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        })
    }
}
