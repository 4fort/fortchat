"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon } from "lucide-react";
import Message from "@/types/Message";

export function FullScreenChatInterfaceComponent() {
  const [userID, setUserID] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/");
    setSocket(ws);

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);

      console.log(event.data);
    };

    return () => {
      if (ws) {
        ws.close();
      } else {
        setSocket(null);
      }
    };
  }, []);

  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: userID,
    };

    if (socket) {
      socket.send(inputMessage);
    }

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <div className="bg-primary p-4 shadow-md">
        <h2 className="text-2xl font-bold text-primary-foreground">
          Full Screen Chat Interface
        </h2>
        <Input
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          disabled={messages.length > 0}
        />
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, i) => (
            <div
              key={String(message.id + i)}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex space-x-2 max-w-3xl mx-auto"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow"
            disabled={!userID}
          />
          <Button type="submit" size="icon">
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
