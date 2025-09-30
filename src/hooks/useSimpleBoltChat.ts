'use client';

import { useState, useEffect, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useSimpleBoltChat(initialPrompt?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [currentApp, setCurrentApp] = useState<any>(null);

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

  const processMessage = async (content: string) => {
    setIsLoading(true);

    try {
      // Simulate AI response for now - in real implementation, this would call the AI API
      const aiResponse = await simulateAIResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Set current app for preview
      if (aiResponse.app) {
        setCurrentApp(aiResponse.app);
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
  };

  const addMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    processMessage(content);
  };

  return {
    messages,
    addMessage,
    isLoading,
    isInitialLoading,
    currentApp
  };
}

// Simulate AI response - replace with real AI integration
async function simulateAIResponse(prompt: string): Promise<{
  content: string;
  app: any;
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate mock response based on prompt
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('timer')) {
    return {
      content: "I'll create a timer app for you! This will include a countdown timer with start, pause, and reset functionality.",
      app: {
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
          }
        ]
      }
    };
  }

  if (lowerPrompt.includes('todo')) {
    return {
      content: "I'll create a todo app for you! This will include adding, completing, and deleting tasks.",
      app: {
        id: 'todo-app',
        title: 'Todo App',
        type: 'react-app',
        files: [
          {
            path: 'src/App.jsx',
            content: `import React, { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="app">
      <h1>Todo App</h1>
      <div className="add-todo">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <div className="todos">
        {todos.map(todo => (
          <div key={todo.id} className={\`todo \${todo.completed ? 'completed' : ''}\`}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;`
          },
          {
            path: 'src/App.css',
            content: `.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.add-todo {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.add-todo input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
}

.add-todo button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.todos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo.completed span {
  text-decoration: line-through;
  color: #666;
}

.todo button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}`
          }
        ]
      }
    };
  }

  // Default response for other prompts
  return {
    content: `I understand you want to build: "${prompt}". I'll create a basic app structure for you.`,
    app: {
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
        },
        {
          path: 'src/App.css',
          content: `.app {
  text-align: center;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  font-size: 1.1rem;
}`
        }
      ]
    }
  };
}
