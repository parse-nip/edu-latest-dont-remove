'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '@/lib/stores/workbench';
import { webcontainer } from '@/lib/webcontainer';
import { ActionRunner } from '@/lib/runtime/action-runner';
import { MessageParser } from '@/lib/runtime/message-parser';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  artifacts?: any[];
  actions?: any[];
}

export function useBoltChat(initialPrompt?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<any>(null);
  
  const workbench = useStore(workbenchStore);
  const actionRunnerRef = useRef<ActionRunner | null>(null);
  const messageParserRef = useRef<MessageParser | null>(null);

  // Initialize WebContainer and stores
  useEffect(() => {
    const initializeBolt = async () => {
      try {
        // Initialize WebContainer
        const container = await webcontainer;
        console.log('WebContainer initialized:', container);

        // Initialize action runner
        actionRunnerRef.current = new ActionRunner(container);
        
        // Initialize message parser
        messageParserRef.current = new MessageParser();

        // Set up workbench store
        workbenchStore.set({
          ...workbench,
          loaded: true
        });

        console.log('Bolt system initialized successfully');
      } catch (error) {
        console.error('Failed to initialize bolt system:', error);
      }
    };

    initializeBolt();
  }, []);

  // Handle initial prompt
  useEffect(() => {
    if (!initialPrompt?.trim()) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: initialPrompt
    };
    
    setMessages([userMessage]);
    
    // Process with AI
    processMessage(initialPrompt);
  }, [initialPrompt]);

  const processMessage = useCallback(async (content: string) => {
    if (!actionRunnerRef.current || !messageParserRef.current) {
      console.error('Bolt system not initialized');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate AI response for now - in real implementation, this would call the AI API
      const aiResponse = await simulateAIResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        artifacts: aiResponse.artifacts,
        actions: aiResponse.actions
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute actions if any
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        for (const action of aiResponse.actions) {
          try {
            await actionRunnerRef.current!.executeAction(action);
          } catch (error) {
            console.error('Failed to execute action:', error);
          }
        }
      }

      // Set current artifact for preview
      if (aiResponse.artifacts && aiResponse.artifacts.length > 0) {
        setCurrentArtifact(aiResponse.artifacts[0]);
      }

    } catch (error) {
      console.error('Failed to process message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, []);

  const addMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    processMessage(content);
  }, [processMessage]);

  return {
    messages,
    addMessage,
    isLoading,
    isInitialLoading,
    currentArtifact,
    workbench
  };
}

// Simulate AI response - replace with real AI integration
async function simulateAIResponse(prompt: string): Promise<{
  content: string;
  artifacts: any[];
  actions: any[];
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate mock response based on prompt
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('timer')) {
    return {
      content: "I'll create a timer app for you! This will include a countdown timer with start, pause, and reset functionality.",
      artifacts: [{
        id: 'timer-app',
        title: 'Timer App',
        type: 'react-app',
        files: [
          {
            path: 'src/App.jsx',
            content: `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      alert('Timer finished!');
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const startTimer = () => {
    if (time === 0) {
      setTime(inputMinutes * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(inputMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="app">
      <h1>Timer App</h1>
      <div className="timer-display">
        <div className="time">{formatTime(time)}</div>
      </div>
      <div className="controls">
        <input
          type="number"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(parseInt(e.target.value) || 0)}
          min="1"
          max="60"
        />
        <span>minutes</span>
      </div>
      <div className="buttons">
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={pauseTimer} disabled={!isRunning}>
          Pause
        </button>
        <button onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;`
          },
          {
            path: 'src/App.css',
            content: `.app {
  text-align: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.timer-display {
  margin: 2rem 0;
}

.time {
  font-size: 4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.controls {
  margin: 1rem 0;
}

.controls input {
  font-size: 1.2rem;
  padding: 0.5rem;
  margin: 0 0.5rem;
  width: 80px;
}

.buttons {
  margin: 2rem 0;
}

.buttons button {
  font-size: 1.1rem;
  padding: 0.8rem 1.5rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

.buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.buttons button:hover:not(:disabled) {
  background-color: #0056b3;
}`
          },
          {
            path: 'package.json',
            content: `{
  "name": "timer-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
          }
        ]
      }],
      actions: [
        {
          type: 'file',
          action: 'write',
          path: 'src/App.jsx',
          content: `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);

  useEffect(() => {
    let interval = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setIsRunning(false);
      alert('Timer finished!');
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const startTimer = () => {
    if (time === 0) {
      setTime(inputMinutes * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(inputMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  return (
    <div className="app">
      <h1>Timer App</h1>
      <div className="timer-display">
        <div className="time">{formatTime(time)}</div>
      </div>
      <div className="controls">
        <input
          type="number"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(parseInt(e.target.value) || 0)}
          min="1"
          max="60"
        />
        <span>minutes</span>
      </div>
      <div className="buttons">
        <button onClick={startTimer} disabled={isRunning}>
          Start
        </button>
        <button onClick={pauseTimer} disabled={!isRunning}>
          Pause
        </button>
        <button onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App;`
        },
        {
          type: 'file',
          action: 'write',
          path: 'src/App.css',
          content: `.app {
  text-align: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.timer-display {
  margin: 2rem 0;
}

.time {
  font-size: 4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.controls {
  margin: 1rem 0;
}

.controls input {
  font-size: 1.2rem;
  padding: 0.5rem;
  margin: 0 0.5rem;
  width: 80px;
}

.buttons {
  margin: 2rem 0;
}

.buttons button {
  font-size: 1.1rem;
  padding: 0.8rem 1.5rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

.buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.buttons button:hover:not(:disabled) {
  background-color: #0056b3;
}`
        },
        {
          type: 'file',
          action: 'write',
          path: 'package.json',
          content: `{
  "name": "timer-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
        },
        {
          type: 'shell',
          action: 'run',
          command: 'npm install'
        },
        {
          type: 'shell',
          action: 'run',
          command: 'npm start'
        }
      ]
    };
  }

  // Default response for other prompts
  return {
    content: `I understand you want to build: "${prompt}". I'll create a basic app structure for you.`,
    artifacts: [{
      id: 'basic-app',
      title: 'Basic App',
      type: 'react-app',
      files: [
        {
          path: 'src/App.jsx',
          content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Your App</h1>
      <p>This is a basic app created based on your request: "${prompt}"</p>
    </div>
  );
}

export default App;`
        }
      ]
    }],
    actions: [
      {
        type: 'file',
        action: 'write',
        path: 'src/App.jsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Your App</h1>
      <p>This is a basic app created based on your request: "${prompt}"</p>
    </div>
  );
}

export default App;`
      }
    ]
  };
}
