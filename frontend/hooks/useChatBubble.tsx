"use client";

import Message from "@/types/Message";
import { useState } from "react";

type UseChatBubbleProps = {
  isLastMessage?: boolean;
};

export default function useChatBubble() {
  const [isDateShown, setIsDateShown] = useState(false);

  const isMessageFromSender = (message1: Message, message2: Message) => {
    if (message1) {
      return message1.sender === message2.sender;
    }
    return false;
  };

  const isMessageRecent = (
    delay: number,
    message: Message,
    prevMessage?: Message
  ) => {
    if (prevMessage && isMessageFromSender(message, prevMessage)) {
      const thisMessageTime = new Date(message.createdAt).getTime();
      const prevMessageTime = new Date(prevMessage.createdAt).getTime();
      return thisMessageTime - prevMessageTime <= delay;
    }
  };

  const isNextMessageRecent = (
    delay: number,
    message: Message,
    nextMessage?: Message
  ) => {
    if (nextMessage && isMessageFromSender(message, nextMessage)) {
      const thisMessageTime = new Date(message.createdAt).getTime();
      const nextMessageTime = new Date(nextMessage.createdAt).getTime();
      return nextMessageTime - thisMessageTime <= delay;
    }
    return false;
  };

  return {
    isDateShown,
    setIsDateShown,
    isMessageFromSender,
    isMessageRecent,
    isNextMessageRecent,
  };
}
