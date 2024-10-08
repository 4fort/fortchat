"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Message from "@/types/Message";
import { cn, formatDate } from "@/lib/utils";
import useChatBubble from "@/hooks/useChatBubble";

type ChatBubbleProps = {
  message: Message;
  userID: string;
  isLastMessage: boolean;
  prevMessage: Message | null;
  nextMessage: Message | null;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  className?: string;
};

const CHAT_BUBBLE_GROUP_DELAY = 5000;

function ChatBubble({
  message,
  userID,
  isLastMessage,
  prevMessage,
  nextMessage,
  scrollAreaRef,
  className,
}: ChatBubbleProps) {
  const { isDateShown, setIsDateShown, isMessageRecent, isNextMessageRecent } =
    useChatBubble();

  useEffect(() => {
    setIsDateShown(isLastMessage);
    return;
  }, [isLastMessage]);

  return (
    <React.Fragment>
      <motion.div
        initial={{
          opacity: 0,
          filter: "blur(10px)",
          y: scrollAreaRef.current?.offsetHeight,
        }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`flex ${
          message.sender === userID ? "justify-end" : "justify-start"
        } ${
          !isMessageRecent(CHAT_BUBBLE_GROUP_DELAY, message, prevMessage!) &&
          "mt-4"
        } ${className}`}
      >
        <div
          className={`flex flex-col max-w-[70%] ${
            message.sender === userID ? "items-end" : "items-start"
          }`}
          onClick={() => {
            isLastMessage ? setIsDateShown(true) : setIsDateShown(!isDateShown);
          }}
        >
          {message.sender !== userID &&
            !isMessageRecent(
              CHAT_BUBBLE_GROUP_DELAY,
              message,
              prevMessage!
            ) && (
              <span
                className={cn(
                  "text-sm opacity-50",
                  message.sender === userID ? "text-right" : "text-left"
                )}
              >
                {message.sender}
              </span>
            )}
          <div
            className={`max-w-full min-w-fit w-fit break-all rounded-3xl py-2 px-3 z-10 ${
              message.sender === userID
                ? "bg-primary text-primary-foreground"
                : "bg-zinc-300 text-secondary-foreground"
            } ${
              message.sender === userID
                ? // SENDERS
                  isMessageRecent(
                    CHAT_BUBBLE_GROUP_DELAY,
                    message,
                    prevMessage!
                  )
                  ? nextMessage
                    ? isNextMessageRecent(
                        CHAT_BUBBLE_GROUP_DELAY,
                        message,
                        nextMessage
                      )
                      ? "rounded-tr-lg rounded-br-lg"
                      : "rounded-tr-lg"
                    : "rounded-tr-lg"
                  : isNextMessageRecent(
                      CHAT_BUBBLE_GROUP_DELAY,
                      message,
                      nextMessage!
                    )
                  ? "rounded-br-lg"
                  : null
                : // OTHERS
                isMessageRecent(CHAT_BUBBLE_GROUP_DELAY, message, prevMessage!)
                ? nextMessage
                  ? isNextMessageRecent(
                      CHAT_BUBBLE_GROUP_DELAY,
                      message,
                      nextMessage
                    )
                    ? "rounded-tl-lg rounded-bl-lg"
                    : "rounded-tl-lg"
                  : "rounded-tl-lg"
                : isNextMessageRecent(
                    CHAT_BUBBLE_GROUP_DELAY,
                    message,
                    nextMessage!
                  )
                ? "rounded-bl-lg"
                : null
            }`}
          >
            {message.text}
          </div>
          {/* TODO: put this in the center and make the size normal */}
          <motion.div
            className={cn(
              "bottom-0 text-xs w-max -z-10",
              message.sender === userID ? "text-right" : "text-left"
            )}
            animate={
              isDateShown
                ? {
                    opacity: 0.5,
                    marginTop: 0,
                    filter: "blur(0)",
                    pointerEvents: "auto",
                  }
                : {
                    opacity: 0,
                    marginTop: -15,
                    filter: "blur(10px)",
                    pointerEvents: "none",
                  }
            }
          >
            {formatDate(message.createdAt)}
          </motion.div>
        </div>
      </motion.div>
    </React.Fragment>
  );
}

export default ChatBubble;
