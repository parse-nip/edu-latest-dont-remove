"use client";
import { useState, useEffect, useMemo, useRef } from "react";

export interface StructuredAIResponse {
  type: "aiResponse";
  files: string[];
  explanation: string;
  education: string;
}

export interface Message {
  role: "user" | "assistant";
  id: string;
  content: string | StructuredAIResponse;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export function useChat(initialPrompt?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([
    { 
      id: "1", 
      title: "New Chat", 
      messages: [],
      createdAt: Date.now() 
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const currentConversation = useMemo(() => 
    conversations.find(c => c.id === currentConversationId) || { messages: [] as Message[] },
    [conversations, currentConversationId]
  );
  const messages = currentConversation.messages;

  useEffect(() => {
    if (!initialPrompt?.trim()) {
      setIsInitialLoading(false);
      return;
    }

    // Immediately add user message for initial prompt
    const userMessage: Message = {
      role: "user",
      id: Date.now().toString(),
      content: initialPrompt
    };
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // Then simulate AI response after delay
    setIsLoading(true);
    const initialTimeout = setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        id: (Date.now() + 1).toString(),
        content: {
          type: "aiResponse",
          files: [
            "src/app/layout.tsx",
            "src/components/chat/ChatLayout.tsx",
            "src/hooks/useChat.ts",
            "src/components/chat/FileChangeChecklist.tsx"
          ],
          explanation: "Building your app based on your initial message. All files processed successfully!",
          education: "This shows sequential simulation. Connect to real AI for dynamic processing."
        }
      };
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, aiResponse] }
            : conv
        )
      );
      setIsLoading(false);
      setIsInitialLoading(false);
      clearTimeout(initialTimeout);
    }, 7000);
  }, [initialPrompt, currentConversationId]);

  const addMessage = (message: Omit<Message, "id">) => {
    const fullMessage: Message = { ...message, id: Date.now().toString() };
    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, fullMessage] }
          : conv
      )
    );

    if (message.role === "user" && !isLoading) {
      setIsLoading(true);
      const responseTimeout = setTimeout(() => {
        const aiResponse: Message = {
          role: "assistant",
          id: (Date.now() + 1).toString(),
          content: {
            type: "aiResponse",
            files: [
              "src/app/layout.tsx",
              "src/app/page.tsx",
              "src/components/chat/ChatMessages.tsx", 
              "src/hooks/useChat.ts"
            ],
            explanation: "Building your app... All files have been modified successfully to implement your request.",
            education: "This simulation shows sequential file processing. Integrate with AI for real changes."
          }
        };
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, aiResponse] }
              : conv
          )
        );
        setIsLoading(false);
        clearTimeout(responseTimeout);
      }, 7000);
    }
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = { 
      id: newId, 
      title: "New Chat", 
      messages: [], 
      createdAt: Date.now()
    };
    setConversations(prev => [...prev, newConv]);
    setCurrentConversationId(newId);
  };

  return {
    messages,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    addMessage,
    createNewChat,
    isLoading,
    isInitialLoading
  };
}