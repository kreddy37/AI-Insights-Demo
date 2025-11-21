import { createN8nClient } from '@/lib/n8n-client';

interface RequestBody {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  sessionId?: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    if (!body.message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const n8nClient = createN8nClient();
    const response = await n8nClient.sendMessage(
      body.message,
      body.conversationHistory || [],
      body.sessionId
    );

    return Response.json({
      response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
