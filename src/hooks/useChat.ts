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

  const hasAddedInitial = useRef(false);
  const hasPendingUserMessage = useRef(false);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentConversation = useMemo(() => 
    conversations.find(c => c.id === currentConversationId) || { messages: [] as Message[] },
    [conversations, currentConversationId]
  );
  const messages = currentConversation.messages;

  // Helper to check if last message matches
  const isDuplicateMessage = (newMessage: Message) => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === newMessage.role && 
           (typeof lastMsg.content === 'string' && typeof newMessage.content === 'string' 
            ? lastMsg.content === newMessage.content 
            : JSON.stringify(lastMsg.content) === JSON.stringify(newMessage.content));
  };

  useEffect(() => {
    if (!initialPrompt?.trim()) {
      setIsInitialLoading(false);
      return;
    }

    if (hasAddedInitial.current || hasPendingUserMessage.current) return;

    hasAddedInitial.current = true;

    // Immediately add user message for initial prompt
    const userMessage: Message = {
      role: "user",
      id: Date.now().toString(),
      content: initialPrompt
    };
    if (isDuplicateMessage(userMessage)) return; // Prevent duplicate

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage] }
          : conv
      )
    );

    // Then simulate AI response after delay
    setIsLoading(true);
    initialTimeoutRef.current = setTimeout(() => {
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
      if (isDuplicateMessage(aiResponse)) return; // Prevent duplicate

      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, aiResponse] }
            : conv
        )
      );
      setIsLoading(false);
      setIsInitialLoading(false);
      hasPendingUserMessage.current = false;
      initialTimeoutRef.current = null;
    }, 7000);
  }, [initialPrompt, currentConversationId]);

  const addMessage = (message: Omit<Message, "id">) => {
    if (message.role === "user" && (isLoading || hasPendingUserMessage.current)) {
      return; // Ignore duplicate user messages
    }

    const fullMessage: Message = { ...message, id: Date.now().toString() };
    if (isDuplicateMessage(fullMessage)) return; // Prevent any duplicates

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, fullMessage] }
          : conv
      )
    );

    if (message.role === "user") {
      hasPendingUserMessage.current = true;
      setIsLoading(true);
      responseTimeoutRef.current = setTimeout(() => {
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
        if (isDuplicateMessage(aiResponse)) return; // Prevent duplicate

        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, aiResponse] }
              : conv
          )
        );
        setIsLoading(false);
        hasPendingUserMessage.current = false;
        if (responseTimeoutRef.current) {
          clearTimeout(responseTimeoutRef.current);
          responseTimeoutRef.current = null;
        }
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
    // Reset flags for new chat
    hasAddedInitial.current = false;
    hasPendingUserMessage.current = false;
    setIsInitialLoading(false);
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
      initialTimeoutRef.current = null;
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

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