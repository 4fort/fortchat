package main

import (
	"fmt"
	"net/http"

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
		messageType, data, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("[error/ReadMessage]: ", err)
			return
		}
		fmt.Println("Received message: ", string(data))

		if err := conn.WriteMessage(messageType, data); err != nil {
			fmt.Println("[error/WriteMessage]: ", err)
			return
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
