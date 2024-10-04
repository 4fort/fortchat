package ws

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/4fort/fort-chat-backend/internal/types"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var conversations = make(map[string][]*websocket.Conn)
var mutex = &sync.Mutex{}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("[error/Upgrade]: ", err)
		return
	}
	defer conn.Close()

	var initialMessage types.Message
	if err := conn.ReadJSON(&initialMessage); err != nil {
		fmt.Println("[error/ReadJSON/initialMessage]: ", err)
		return
	}

	fmt.Printf("[connection]: New client connected: { RemoteAddr: %s, converstaionID: %s }\n", r.RemoteAddr, initialMessage.ConversationID)
	initialMessage.ID = getRandomID()
	initialMessage.Text = getRandomJoinPhrase(initialMessage.Sender)
	initialMessage.Sender = "system"

	broadcastMessage(initialMessage)

	mutex.Lock()
	conversations[initialMessage.ConversationID] = append(conversations[initialMessage.ConversationID], conn)
	mutex.Unlock()

	for {
		var message types.Message

		if err := conn.ReadJSON(&message); err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure, 1000) {
				fmt.Println("[connection]: Client disconnected: ", r.RemoteAddr, message)

				// message.ID = getRandomID()
				// message.Text = getRandomLeavePhrase(message.Sender)
				// message.Sender = "system"
				// broadcastMessage(message)
			} else {
				fmt.Println("[error/ReadJSON]: ", err)
			}
			removeConnection(initialMessage.ConversationID, conn)
			break
		}

		fmt.Println("[", conversations[initialMessage.ConversationID], "]:")
		fmt.Println("[message]: ", message)

		broadcastMessage(message)
	}
}
