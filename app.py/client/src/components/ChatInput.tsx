import { Send, StopCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState, KeyboardEvent, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || (isLoading && !onStop)) return;
    
    if (isLoading) {
      onStop();
    } else {
      onSend(input);
      setInput("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "56px";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4 md:px-8">
      <div className="mx-auto max-w-3xl relative">
        <div className="relative flex items-end gap-2 bg-card border border-input shadow-lg rounded-2xl p-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary transition-all duration-200">
          <div className="relative flex-1 min-h-[56px] flex items-center">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="min-h-[24px] max-h-[200px] w-full resize-none border-0 bg-transparent py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 custom-scrollbar"
              rows={1}
            />
          </div>
          
          <Button
            onClick={handleSubmit}
            size="icon"
            disabled={!input.trim() && !isLoading}
            className={cn(
              "h-10 w-10 mb-1 rounded-xl transition-all duration-200 shrink-0",
              isLoading 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : input.trim() 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5" 
                  : "bg-muted text-muted-foreground"
            )}
          >
            {isLoading ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 opacity-70">
            <Sparkles className="h-3 w-3 text-primary" />
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
