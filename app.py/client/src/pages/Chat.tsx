import { useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useMessages, useChatStream } from "@/hooks/use-chat";
import { Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const { data: messages, isLoading: isHistoryLoading } = useMessages();
  const { sendMessage, stopStream, isStreaming, streamedContent } = useChatStream();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent, isStreaming]);

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative w-full md:pl-72 lg:pl-80 h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground animate-pulse">Loading conversation...</p>
            </div>
          ) : !hasMessages && !isStreaming ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-xl shadow-primary/5">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">How can I help you today?</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                I'm an advanced AI assistant capable of writing code, answering questions, and helping with creative tasks.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                {["Explain quantum computing", "Write a Python script", "Draft an email", "Design a logo"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-secondary/50 hover:shadow-md transition-all text-left text-sm font-medium text-foreground/80 hover:text-primary"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col py-4 md:py-10 min-h-full">
              <AnimatePresence initial={false}>
                {messages?.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    role={msg.role as "user" | "assistant"} 
                    content={msg.content} 
                  />
                ))}
              </AnimatePresence>
              
              {isStreaming && (
                <ChatMessage 
                  role="assistant" 
                  content={streamedContent} 
                  isStreaming={true} 
                />
              )}
              
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <ChatInput 
          onSend={sendMessage} 
          onStop={stopStream}
          isLoading={isStreaming} 
        />
      </main>
    </div>
  );
}
