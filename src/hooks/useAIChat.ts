
import { useState } from 'react';
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useAIChat(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: any }) => {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message,
          sessionId,
          context
        }
      });

      if (error) throw error;

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      setIsLoading(false);
      return data;
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage: sendMessage.mutate,
    isLoading,
    clearChat,
    error: sendMessage.error
  };
}
