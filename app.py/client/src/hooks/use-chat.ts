import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export function useMessages() {
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      return api.messages.list.responses[200].parse(data);
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.messages.clear.path, {
        method: api.messages.clear.method,
      });
      if (!res.ok) throw new Error("Failed to clear history");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.messages.list.path], []);
      toast({
        title: "History Cleared",
        description: "Your chat history has been reset.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    },
  });
}

// Hook for handling the streaming chat response
export function useChatStream() {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    setIsStreaming(true);
    setStreamedContent("");
    
    // Optimistically add user message to cache
    const tempUserId = Date.now();
    queryClient.setQueryData<Message[]>([api.messages.list.path], (old = []) => [
      ...old,
      {
        id: tempUserId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(api.chat.path, {
        method: api.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to send message");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Assuming the chunk is plain text from the backend stream
        // If your backend sends SSE format ("data: ..."), you'd parse it here.
        // Based on typical simple implementations, it might just be raw text chunks.
        // We'll assume raw text for now based on implementation notes, 
        // but if it's SSE, we would strip "data: " prefixes.
        
        accumulatedResponse += chunk;
        setStreamedContent(accumulatedResponse);
      }
      
      // Stream complete - invalidate to get the final persisted messages from DB
      await queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Stream error:", error);
        toast({
          title: "Error",
          description: "Failed to receive response from AI.",
          variant: "destructive",
        });
        // Rollback optimistic update on error
        queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
      }
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
      abortControllerRef.current = null;
    }
  }, [queryClient, toast]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      // Invalidate to ensure consistent state
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    }
  }, [queryClient]);

  return {
    sendMessage,
    stopStream,
    isStreaming,
    streamedContent,
  };
}
