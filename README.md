# AI Insights Chat

A standalone Next.js application for AI-powered chat interface that integrates with n8n agents. This app provides a clean, modern UI for interacting with your custom n8n AI workflows.

## Features

- Modern chat interface with message history
- Real-time messaging with loading indicators
- Suggested prompts for quick start
- Full conversation context support
- Error handling and recovery
- Responsive design (mobile and desktop)
- Built with Next.js, React, and TypeScript
- Styled with Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn
- Access to an n8n instance with a configured webhook/agent

## Setup

### 1. Clone or create the project

```bash
cd ~/Documents/ai-insights-chat
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and update with your n8n webhook URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-path
NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n-instance.com
```

### 4. Run development server

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Building for production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── ai-chat.tsx                # Main chat component
│   └── ui/
│       ├── button.tsx             # Button component
│       └── input.tsx              # Input component
├── lib/
│   ├── n8n-client.ts              # n8n API client
│   └── utils.ts                   # Utility functions
├── .env.example                   # Environment variables template
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Project dependencies
```

## n8n Integration

### Webhook Requirements

Your n8n webhook should accept POST requests with the following payload structure:

```json
{
  "chatInput": "user message",
  "messages": [
    {
      "role": "user",
      "content": "previous user message"
    },
    {
      "role": "assistant",
      "content": "previous assistant response"
    }
  ],
  "sessionId": "session_1234567890_abc123"
}
```

### Expected Response

The webhook should return a response in this format:

```json
{
  "output": "assistant response text",
  "context": {}
}
```

## Development

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:fix
```

## Troubleshooting

### Connection Issues

If you're getting connection errors:

1. Verify your `NEXT_PUBLIC_N8N_WEBHOOK_URL` is correct and accessible
2. Check that your n8n instance is running
3. Ensure CORS is properly configured if running on different domains
4. Check the browser console (F12) for detailed error messages

### Timeout Issues

If requests are timing out:

1. The default timeout is 30 seconds - modify in `lib/n8n-client.ts` if needed
2. Check if your n8n workflow is experiencing delays
3. Verify network connectivity to your n8n instance

## License

MIT

## Support

For issues or questions, check your n8n workflow configuration or reach out to your development team.
