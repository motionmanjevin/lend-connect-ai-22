import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement AI message handling
      console.log("AI Message:", message);
      setMessage("");
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-card border border-border rounded-2xl shadow-[var(--shadow-strong)] z-40 animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">How can I help you today?</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAssistant}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 h-64 overflow-y-auto">
            <div className="flex items-start gap-2 mb-4">
              <div className="w-6 h-6 bg-[var(--gradient-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                Hi! I'm your AI lending assistant. I can help you find the best loan offers, analyze your lending opportunities, or answer any questions about the platform.
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                className="btn-hero w-10 h-10 p-0"
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Assistant Button */}
      <button
        onClick={toggleAssistant}
        className="fixed bottom-24 right-4 btn-floating w-14 h-14 flex items-center justify-center z-50 animate-bounce-subtle"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  );
};