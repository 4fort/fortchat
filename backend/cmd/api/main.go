package main

import (
	"fmt"
	"net/http"

	"github.com/4fort/fort-chat-backend/internal/lib"
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

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("[error/Upgrade]: ", err)
		return
	}
	defer conn.Close()

	for {
		var message types.Message

		if err := conn.ReadJSON(&message); err != nil && lib.IsStructEmpty(message) {
			fmt.Println("[error/ReadMessage]: ", message)
			break
		}

		fmt.Println("[message]: ", message)

		var echoMessage types.Message
		echoMessage.ID = message.ID
		echoMessage.Text = message.Text
		echoMessage.Sender = "anonymous"

		if err := conn.WriteJSON(echoMessage); err != nil {
			fmt.Println("[error/WriteMessage]: ", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/", handleWebSocket)
	fmt.Println("[server]: Running on port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("[error/ListenAndServe]: ", err)
	}
}
