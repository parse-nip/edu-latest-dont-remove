// OpenRouter API integration for real AI app generation
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateApp(prompt: string, model: string = 'x-ai/grok-4-fast:free'): Promise<{
    explanation: string;
    files: Array<{ path: string; content: string }>;
    education: string;
  }> {
    const systemPrompt = `You are an expert React developer. When given a prompt to build an app, you should:

1. Generate a complete, runnable React application
2. Include all necessary files (App.jsx, App.css, package.json)
3. Make the app functional and interactive
4. Use modern React patterns (hooks, functional components)
5. Include proper styling with CSS
6. Make sure the code is production-ready

Respond with a JSON object containing:
- explanation: Brief description of what you built
- files: Array of file objects with path and content
- education: Learning notes about the implementation

Example response format:
{
  "explanation": "I built a timer app with start/pause/reset functionality",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "import React, { useState, useEffect } from 'react';\n// ... complete component code"
    },
    {
      "path": "src/App.css", 
      "content": ".app { /* ... complete styles */ }"
    },
    {
      "path": "package.json",
      "content": "{ \"name\": \"timer-app\", \"dependencies\": { \"react\": \"^18.0.0\" } }"
    }
  ],
  "education": "This app demonstrates React hooks, state management, and timer functionality"
}`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Edu App Builder'
        },
        body: JSON.stringify({
          model: model,
          messages,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenRouter');
      }

      // Parse the JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          explanation: parsed.explanation || 'App generated successfully',
          files: parsed.files || [],
          education: parsed.education || 'Generated with AI assistance'
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          explanation: 'App generated successfully',
          files: [
            {
              path: 'src/App.jsx',
              content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Generated App</h1>\n      <p>${prompt}</p>\n    </div>\n  );\n}`
            }
          ],
          education: content
        };
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient | null {
  return openRouterClient;
}

export function initializeOpenRouter(apiKey: string): void {
  openRouterClient = new OpenRouterClient(apiKey);
}
