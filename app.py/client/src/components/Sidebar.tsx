import { MessageSquarePlus, Trash2, Github, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useClearHistory } from "@/hooks/use-chat";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const clearHistory = useClearHistory();

  const handleNewChat = () => {
    if (confirm("Start a new chat? This will clear your current history.")) {
      clearHistory.mutate();
      onClose?.();
    }
  };

  return (
    <div className="flex h-full flex-col bg-card border-r border-border/50">
      <div className="p-4 md:p-6">
        <Button 
          onClick={handleNewChat}
          className="w-full justify-start gap-3 h-12 text-base font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200" 
          disabled={clearHistory.isPending}
        >
          <MessageSquarePlus className="h-5 w-5" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">
          Recent
        </div>
        
        {/* Mock history list since we only have one conversation stream for now */}
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2 h-10 font-normal truncate bg-secondary/50 border border-transparent hover:border-border">
            <span className="truncate">Current Conversation</span>
          </Button>
        </div>
      </div>

      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-lg bg-secondary/50">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            US
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">User Account</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            <Github className="h-4 w-4" />
            GitHub
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10"
            onClick={handleNewChat}
            disabled={clearHistory.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-r border-border">
          <SidebarContent onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex md:w-72 lg:w-80 flex-col fixed inset-y-0 z-40", className)}>
        <SidebarContent />
      </div>
    </>
  );
}
