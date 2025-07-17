
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/useAIChat";
import { MessageCircle, Send, Bot, User, X } from "lucide-react";

interface AIChatWidgetProps {
  context?: {
    page?: string;
    filters?: any;
    data?: any;
  };
}

export function AIChatWidget({ context }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const sessionId = React.useMemo(() => crypto.randomUUID(), []);
  
  const { messages, sendMessage, isLoading, clearChat } = useAIChat(sessionId);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessage({ message, context });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Pourquoi mon ROI a-t-il chuté récemment ?",
    "Quel produit apporte le plus de profit ?",
    "Comment optimiser mes campagnes ?",
    "Quelles sont mes meilleures villes ?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-purple-600 hover:bg-purple-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg h-[600px] p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <DialogTitle className="text-white">Assistant IA TrackProfit</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-purple-100 text-sm">
              Page: {context?.page || 'Dashboard'} • Posez vos questions marketing
            </p>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm">
                          Salut ! Je suis votre assistant IA spécialisé dans l'analyse marketing TrackProfit. 
                          Que voulez-vous savoir sur vos performances ?
                        </p>
                      </div>
                      {/* Quick Questions */}
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-500">Questions rapides :</p>
                        {quickQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 w-full justify-start"
                            onClick={() => {
                              setMessage(question);
                              sendMessage({ message: question, context });
                            }}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user' 
                        ? 'bg-blue-100' 
                        : 'bg-purple-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-500 text-white ml-8' 
                          : 'bg-gray-100 mr-8'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                          <div className="animate-bounce w-2 h-2 bg-purple-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                          <span className="text-xs text-gray-500 ml-2">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question sur vos données marketing..."
                  className="resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs"
                >
                  Effacer la conversation
                </Button>
                <p className="text-xs text-gray-500">
                  Entrée pour envoyer, Shift+Entrée pour nouvelle ligne
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
