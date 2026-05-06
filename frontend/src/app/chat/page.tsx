"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: {
    postId: string;
    title: string;
    url: string;
    relevance: number;
  }[];
}

export default function ChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: t("common.error"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("chat.title")}</h1>
          <nav className="flex items-center gap-4">
            <Link href="/">{t("nav.home")}</Link>
            <Link href="/posts">{t("nav.posts")}</Link>
            <Link href="/search">{t("nav.search")}</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <Card className="h-[600px] flex flex-col">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">{t("chat.title")}</h2>
          </div>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {t("chat.placeholder")}
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-end" : ""}`}>
                  <div className={`p-3 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">{t("chat.sources")}:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, idx) => (
                          <Link
                            key={idx}
                            href={source.url}
                            className="text-sm text-primary hover:underline block"
                          >
                            {source.title} ({Math.round(source.relevance * 100)}%)
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("chat.placeholder")}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}