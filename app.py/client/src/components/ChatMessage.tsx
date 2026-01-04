import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex w-full gap-4 px-4 py-8 transition-colors md:px-8",
        isUser ? "bg-transparent" : "bg-secondary/20 dark:bg-secondary/10"
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-4 md:gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset transition-all",
            isUser 
              ? "bg-white text-zinc-900 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700" 
              : "bg-primary text-primary-foreground ring-primary/20 bg-gradient-to-br from-primary to-primary/80"
          )}>
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-foreground/80">
              {isUser ? "You" : "AI Assistant"}
            </span>
            {!isUser && !isStreaming && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
                title="Copy response"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          <div className={cn(
            "prose prose-sm md:prose-base dark:prose-invert max-w-none leading-7 break-words",
            isUser ? "text-foreground" : "text-foreground/90"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 align-middle bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
