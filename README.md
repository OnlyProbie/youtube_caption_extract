# 项目启动流程

- 安装依赖

```bash
npm install
```

- 配置环境变量（本地开发）

在项目根目录创建 .env.local 并设置：

```
SUPADATA_API_KEY=xxxxx
OPENAI_API_KEY=sk-xxxxx
```

- 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:3000/

- 生产构建与启动

```bash
npm run build
npm run start
```

- 可选：类型检查与代码规范

```bash
npm run typecheck
npm run lint
```

# 项目方案
需求：实现一个Youtube视频字幕提取工具
工具形式：web
前端技术栈：Next.js (App Router)、Tailwind CSS、TypeScript
交互：
- 输入Youtube视频链接，点击提取字幕按钮，获取字幕。
- 点击“AI 总结”按钮，生成带有时间戳的视频内容摘要。
- 点击摘要中的时间戳（如 [05:23]），视频播放器自动跳转到对应进度。
- 支持下载字幕文件。
UI风格：
- 简洁 clean
- 响应式设计，适配PC、平板、手机等设备
- 颜色方案：使用Tailwind CSS的颜色类，保持一致的视觉风格
- 字体：使用系统默认字体，保持简洁易读
API来源：
- 字幕提取：Supadata YouTube Transcript API
- 内容总结：OpenAI API (GPT-4o)

# 端点
GET https://api.supadata.ai/v1/transcript

# 请求头
x-api-key: sd_8095b3b1a3d00776111693a9b5d29d10

# 请求参数
- url: Youtube视频链接（必填）
- lang: 语言，如en、zh等（可选，默认en）
- text: 设为 true 返回纯文本，否则返回带时间戳的分段数据（可选）

# 请求示例
curl 'https://api.supadata.ai/v1/transcript?url=https://www.youtube.com/watch?v=1234567890&lang=en&text=true'
 -H 'x-api-key: sd_8095b3b1a3d00776111693a9b5d29d10'

 # 响应示例（text=true 纯文本模式）
{
  "content": "Hello, world! This is a test transcript.",
  "lang": "en",
  "availableLangs": [
    "en",
    "zh"
  ]
}
