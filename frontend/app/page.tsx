import { ChatInterfaceComponent } from "@/components/chat-interface";
import { FullScreenChatInterfaceComponent } from "@/components/full-screen-chat-interface";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <FullScreenChatInterfaceComponent />
    </div>
  );
}
