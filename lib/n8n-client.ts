import axios from 'axios';

interface N8nMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface N8nRequestPayload {
  chatInput: string;
  messages: N8nMessage[];
  sessionId?: string;
  context?: Record<string, unknown>;
}

interface N8nResponse {
  output: string;
  context?: Record<string, unknown>;
}

export class N8nClient {
  private baseUrl: string;
  private webhookUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678';
    this.webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

    if (!this.webhookUrl) {
      throw new Error('NEXT_PUBLIC_N8N_WEBHOOK_URL environment variable is not set');
    }
  }

  async sendMessage(userMessage: string, conversationHistory: N8nMessage[], sessionId?: string): Promise<string> {
    try {
      const payload: N8nRequestPayload = {
        chatInput: userMessage,
        messages: [
          ...conversationHistory,
          { role: 'user', content: userMessage },
        ],
        ...(sessionId && { sessionId }),
      };

      const response = await axios.post<N8nResponse>(
        this.webhookUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minute timeout
        }
      );

      if (!response.data.output) {
        throw new Error('No response received from n8n agent');
      }

      return response.data.output;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout: n8n agent took too long to respond');
        }
        throw new Error(
          `Failed to communicate with n8n agent: ${error.message}`
        );
      }
      throw error;
    }
  }
}

export function createN8nClient(): N8nClient {
  return new N8nClient();
}
