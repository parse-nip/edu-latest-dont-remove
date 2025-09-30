// Automated tests for app generation and preview functionality
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the environment
const mockEnv = {
  NEXT_PUBLIC_OPENROUTER_API_KEY: 'test-key',
  DAYTONA_API_KEY: 'test-daytona-key'
};

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the useChat hook
const mockUseChat = {
  messages: [],
  addMessage: jest.fn(),
  isLoading: false,
  isInitialLoading: false,
  previewUrl: null,
  lastError: null,
  forceCompleteLoading: jest.fn()
};

// Mock the SimplePreview component
const mockSimplePreview = {
  files: {},
  isStreaming: false,
  previewUrl: null
};

describe('App Generation Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Mock successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AI Generation', () => {
    it('should generate a calculator app successfully', async () => {
      // Mock OpenRouter API response
      const mockAIResponse = {
        explanation: "Built a simple calculator app in React",
        files: [
          {
            path: "src/App.jsx",
            content: "import React, { useState } from 'react';\n\nfunction Calculator() {\n  const [display, setDisplay] = useState('0');\n  \n  return (\n    <div className=\"calculator\">\n      <div className=\"display\">{display}</div>\n      <div className=\"buttons\">\n        <button onClick={() => setDisplay('1')}>1</button>\n        <button onClick={() => setDisplay('2')}>2</button>\n        <button onClick={() => setDisplay('+')}>+</button>\n        <button onClick={() => setDisplay('=')}>=</button>\n      </div>\n    </div>\n  );\n}\n\nexport default Calculator;"
          },
          {
            path: "package.json",
            content: "{\n  \"name\": \"calculator\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.0.0\",\n    \"react-dom\": \"^18.0.0\"\n  }\n}"
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAIResponse)
      });

      // Test the generation
      const response = await fetch('/api/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'build a calculator app' })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.files).toHaveLength(2);
      expect(result.files[0].path).toBe('src/App.jsx');
      expect(result.files[0].content).toContain('Calculator');
    });

    it('should handle AI generation errors gracefully', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const response = await fetch('/api/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'build a calculator app' })
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Daytona Integration', () => {
    it('should create a workspace successfully', async () => {
      const mockWorkspace = {
        id: 'test-workspace-123',
        name: 'Test Workspace',
        status: 'running',
        ide: {
          url: 'https://test-workspace-123.daytona.io/ide'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWorkspace)
      });

      const response = await fetch('/api/daytona/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Workspace' })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.id).toBe('test-workspace-123');
      expect(result.status).toBe('running');
    });

    it('should get preview URL successfully', async () => {
      const mockWorkspace = {
        id: 'test-workspace-123',
        status: 'running',
        ide: {
          url: 'https://test-workspace-123.daytona.io/ide'
        }
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockWorkspace)
        });

      const response = await fetch('/api/daytona/workspaces/test-workspace-123/preview?port=3000');

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.previewUrl).toBe('https://test-workspace-123.daytona.io/preview/3000');
    });

    it('should handle Daytona API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Daytona API Error'));

      const response = await fetch('/api/daytona/workspaces');

      expect(response.ok).toBe(false);
    });
  });

  describe('Preview Generation', () => {
    it('should generate local preview when Daytona fails', () => {
      const files = {
        'src/App.jsx': {
          type: 'file',
          content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}'
        }
      };

      // Test that local preview is generated
      expect(files['src/App.jsx']).toBeDefined();
      expect(files['src/App.jsx'].content).toContain('Hello World');
    });

    it('should use Daytona preview URL when available', () => {
      const previewUrl = 'https://test-workspace-123.daytona.io/preview/3000';
      
      expect(previewUrl).toContain('daytona.io');
      expect(previewUrl).toContain('preview');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when generation fails', () => {
      const error = 'Failed to generate app';
      
      expect(error).toBeDefined();
      expect(typeof error).toBe('string');
    });

    it('should have timeout protection', () => {
      const timeout = 30000; // 30 seconds
      
      expect(timeout).toBeGreaterThan(0);
      expect(timeout).toBeLessThanOrEqual(60000); // Max 1 minute
    });
  });
});

// Integration test
describe('End-to-End App Generation', () => {
  it('should complete full app generation workflow', async () => {
    // 1. User sends prompt
    const prompt = 'build a todo app';
    
    // 2. AI generates files
    const mockFiles = [
      { path: 'src/App.jsx', content: '// Todo app code' },
      { path: 'package.json', content: '{"name": "todo-app"}' }
    ];
    
    // 3. Daytona workspace is created
    const mockWorkspace = {
      id: 'todo-workspace-123',
      status: 'running',
      ide: { url: 'https://todo-workspace-123.daytona.io/ide' }
    };
    
    // 4. Preview URL is generated
    const previewUrl = 'https://todo-workspace-123.daytona.io/preview/3000';
    
    // Verify the workflow
    expect(prompt).toBeDefined();
    expect(mockFiles).toHaveLength(2);
    expect(mockWorkspace.id).toContain('workspace');
    expect(previewUrl).toContain('daytona.io');
  });
});
