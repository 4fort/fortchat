"use client";

import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, SendIcon } from "lucide-react";
import Message from "@/types/Message";
import { cn } from "@/lib/utils";
import ChatBubble from "./chat-interface/chat-bubble";

export function FullScreenChatInterfaceComponent() {
  const [userID, setUserID] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationID, setConversationID] = useState<string>("");
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        // setMessages((prev) => [...prev, JSON.parse(event.data)]);
        setMessages((prev) => {
          const newMessage = JSON.parse(event.data);
          const filteredMessages = prev.filter(
            (message) => message.id !== newMessage.id
          );

          return [...filteredMessages, newMessage];
        });

        // console.log(event.data);
      };

      return () => {
        if (socket) {
          socket.close();
        } else {
          setSocket(null);
        }
      };
    }
  }, [socket]);

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

  const handleConnectWebSocket = () => {
    if (socket) {
      socket.close(1000, "Closed by user");
      setSocket(null);
      return;
    }

    setConnecting(true);

    try {
      const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_API_URL}:8080/`);

      ws.onopen = () => {
        console.log("connected");

        ws.send(JSON.stringify({ sender: userID, conversationID }));
        setSocket(ws);
        setConnecting(false);
      };

      ws.onclose = () => {
        console.log("disconnected");
        setSocket(null);
        setConnecting(false);
      };

      ws.onerror = (error) => {
        console.error(error);
        setSocket(null);
        setConnecting(false);
        throw error;
      };
    } catch (error) {
      console.error(error);
      setConnecting(false);
      throw error;
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    if (conversationID === null) return;

    const newMessage: Message = {
      id: crypto.getRandomValues(new Uint32Array(1))[0],
      text: inputMessage,
      sender: userID,
      conversationID,
      createdAt: new Date().toISOString(),
    };

    if (socket) {
      socket.send(JSON.stringify(newMessage));
    }

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-svh w-screen bg-background text-foreground">
      <div className="bg-primary p-4 shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-primary-foreground">
            FortChat
          </h2>
          <div
            className={cn(
              "w-4 h-4 rounded-full",
              socket ? "bg-green-500" : "bg-gray-500"
            )}
          ></div>
        </div>
        <div className="flex gap-4">
          <Input
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            disabled={socket !== null}
            placeholder="User ID"
          />
          <Input
            value={conversationID}
            onChange={(e) => setConversationID(e.target.value)}
            disabled={socket !== null}
            placeholder="Conversation ID"
          />
          <Button
            variant="outline"
            disabled={userID === "" || conversationID === "" || connecting}
            onClick={handleConnectWebSocket}
          >
            {connecting && <Loader2 className="mr-2w-4 h-4 animate-spin" />}
            {socket === null ? "Connect" : "Disconnect"}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4 scroll-smooth">
        <div className="max-w-3xl mx-auto" ref={scrollAreaRef}>
          {messages.map((message, i) =>
            message.conversationID === conversationID &&
            message.sender !== "system" ? (
              <ChatBubble
                key={String(message.id + i) + message.sender + message.text}
                message={message}
                userID={userID}
                isLastMessage={i === messages.length - 1}
                scrollAreaRef={scrollAreaRef}
                prevMessage={i > 0 ? messages[i - 1] : null}
                nextMessage={i < messages.length - 1 ? messages[i + 1] : null}
              />
            ) : (
              <div
                key={String(message.id + i) + message.sender + message.text}
                className="flex justify-center"
              >
                <div className={"max-w-full min-w-fit opacity-50 text-center"}>
                  {message.text}
                </div>
              </div>
            )
          )}
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
            disabled={!userID || !conversationID || socket === null}
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
