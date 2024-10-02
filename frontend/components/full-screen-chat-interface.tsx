"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon } from "lucide-react";
import Message from "@/types/Message";
import { cn } from "@/lib/utils";

export function FullScreenChatInterfaceComponent() {
  const [userID, setUserID] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/");
    ws.onopen = () => {
      setSocket(ws);
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);

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
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView(false);
    }
    if (messageInputRef.current) {
      messageInputRef.current.focus();
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
      socket.send(JSON.stringify(newMessage));
    }

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground">
      <div className="bg-primary p-4 shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary-foreground">
            Full Screen Chat Interface
          </h2>
          <div
            className={cn(
              "w-4 h-4 rounded-full",
              socket ? "bg-green-500" : "bg-gray-500"
            )}
          ></div>
        </div>
        <Input
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
          disabled={messages.length > 0 || socket === null}
        />
      </div>
      <ScrollArea className="flex-grow p-4 scroll-smooth">
        <div className="space-y-4 max-w-3xl mx-auto" ref={scrollAreaRef}>
          {messages.map((message, i) => (
            <div
              key={String(message.id + i) + message.sender + message.text}
              className={`flex ${
                message.sender === userID ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === userID
                    ? socket !== null
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary text-primary-foreground opacity-50"
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
            ref={messageInputRef}
          />
          <Button
            type="submit"
            size="icon"
            disabled={inputMessage.trim() === ""}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
