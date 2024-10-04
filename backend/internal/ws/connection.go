package ws

import (
	"fmt"

	"github.com/4fort/fort-chat-backend/internal/types"
	"github.com/gorilla/websocket"
)

func boadcastMessage(msg types.Message) {
	mutex.Lock()
	defer mutex.Unlock()

	clients := conversations[msg.ConversationID]
	fmt.Println("[server]: Broadcasting message to conversation ", msg.ConversationID)
	for _, conn := range clients {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("[error/BroadcastMessage]:Error sending message:", err)
			removeConnection(msg.ConversationID, conn)
		} else {
			fmt.Println("[server]: Message sent to client in conversation:", msg.Sender)
		}
	}
}

func removeConnection(converstaionID string, conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	clients := conversations[converstaionID]
	for i, client := range clients {
		if client == conn {
			conversations[converstaionID] = append(clients[:i], clients[i+1:]...)
			break
		}
	}
}
