"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Message from "@/types/Message";
import { cn, formatDate } from "@/lib/utils";

type ChatBubbleProps = {
  message: Message;
  userID: string;
  isLastMessage: boolean;
  prevMsgSeconds: number;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
};

function ChatBubble({
  message,
  userID,
  isLastMessage,
  prevMsgSeconds,
  scrollAreaRef,
}: ChatBubbleProps) {
  const [isHovered, setIsHovered] = useState(isLastMessage);
  const [senderIsShown, setSenderIsShown] = useState(
    new Date(message.createdAt).getSeconds() - prevMsgSeconds >= 5
  );

  useEffect(() => {
    setIsHovered(isLastMessage);
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
        transition={{ duration: 0.2 }}
        className={`flex ${
          message.sender === userID ? "justify-end" : "justify-start"
        } ${senderIsShown ? "mt-4" : "mt-1"}`}
      >
        <motion.div
          className="flex flex-col max-w-[70%] relative"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => {
            if (isLastMessage) {
              setIsHovered(true);
            } else {
              setIsHovered(false);
            }
          }}
        >
          {message.sender !== userID && senderIsShown && (
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
            className={`max-w-full min-w-fit rounded-xl p-3 ${
              message.sender === userID
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {message.text}
          </div>
          <motion.div
            className={cn(
              "absolute opacity-0 bottom-0 text-xs w-max",
              message.sender === userID ? "right-0" : "left-0"
            )}
            animate={
              isHovered
                ? {
                    display: "block",
                    opacity: 0.5,
                    bottom: "-1.2rem",
                    filter: "blur(0)",
                  }
                : {
                    display: "none",
                    opacity: 0,
                    bottom: 0,
                    filter: "blur(10px)",
                  }
            }
          >
            {formatDate(message.createdAt)}
          </motion.div>
        </motion.div>
      </motion.div>
    </React.Fragment>
  );
}

export default ChatBubble;
