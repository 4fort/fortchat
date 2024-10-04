package ws

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/4fort/fort-chat-backend/internal/types"
	"github.com/gorilla/websocket"
)

func broadcastMessage(msg types.Message) {
	mutex.Lock()
	defer mutex.Unlock()

	clients := conversations[msg.ConversationID]
	fmt.Println("[server]: Broadcasting message to conversation ", msg)
	for _, conn := range clients {
		if err := conn.WriteJSON(msg); err != nil {
			fmt.Println("[error/BroadcastMessage]:Error sending message:", err)
			removeConnection(msg.ConversationID, conn)
		} else {
			fmt.Println("[server]: Message sent to client in conversation:", msg)
		}
	}
}

func broadcastToConversation(conversationID, message string) {
	mutex.Lock()
	mutex.Unlock()

	announcement := types.Message{
		ID:             getRandomID(),
		Text:           message,
		Sender:         "system",
		ConversationID: conversationID,
	}

	clients, ok := conversations[conversationID]
	if !ok {
		fmt.Println("[error/BroadcastToConversation]: No clients in conversation", conversationID)
		return
	}

	for _, conn := range clients {
		if err := conn.WriteJSON(announcement); err != nil {
			fmt.Printf("[error/BroadcastToConversation]: Error sending announcement: %s\n", err)
			removeConnection(conversationID, conn)
		}
	}

	fmt.Printf("[server]: Announcement sent to conversation %s: %s\n", conversationID, message)
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

func getRandomJoinPhrase(sender string) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	phrases := []string{
		"%s has entered the chat! Prepare for greatness.",
		"A wild %s appeared! What will they do next?",
		"Look who's here! It's %s joining the conversation.",
		"%s just logged in. Let the chaos begin!",
		"%s has entered the game. Level up the chat!",
		"Brace yourselves, %s has arrived!",
		"%s just stepped into the chat room. Things are about to get interesting.",
		"Drumroll please... %s is in the building!",
		"Watch out! %s just joined the fray!",
		"Breaking news: %s is now online!",
		"%s just spawned into the chat. Adventure awaits!",
		"Alert! %s has landed. Let's see what they have to say.",
		"%s just walked in. Everyone be cool!",
		"%s has appeared! What kind of magic will happen?",
		"%s is here to spice things up!",
	}

	fmt.Println(sender)

	phrase := phrases[r.Intn(len(phrases))]

	return fmt.Sprintf(phrase, sender)
}

func getRandomID() int {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return r.Intn(1000000)
}

func getRandomLeavePhrase(sender string) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	phrases := []string{
		"%s has left the chat. Farewell, brave soul!",
		"%s has logged off. The room feels a bit emptier now.",
		"%s has vanished from the chat like a ghost in the night.",
		"%s just left the game. They'll be missed... maybe.",
		"Oops! %s has disconnected. Will they return?",
		"%s has exited the chat. The adventure continues without them.",
		"The wind whispers as %s fades into the distance.",
		"%s has logged out. We hope to see them again soon!",
		"Poof! %s disappeared from the conversation.",
		"%s has left the building. Things won't be the same!",
		"Farewell, %s! Until we meet again in the chat.",
		"%s has left the battlefield. The quest continues.",
		"With a wave, %s steps out of the conversation.",
		"%s has disconnected. The chat grows quieter.",
		"Goodbye, %s! The chat room will miss you.",
	}

	fmt.Println(sender)

	phrase := phrases[r.Intn(len(phrases))]

	return fmt.Sprintf(phrase, sender)
}

func ListenForCommands() {
	reader := bufio.NewReader(os.Stdin)

	for {
		fmt.Print("> ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)

		if strings.HasPrefix(input, "/msg") {
			parts := strings.SplitN(input, " ", 3)
			if len(parts) < 3 {
				fmt.Println("Usage: /msg <conversation_id> <message>")
				continue
			}

			conversationID := parts[1]
			message := parts[2]

			broadcastToConversation(conversationID, message)
		} else {
			fmt.Println("Invalid command. Usage: /msg <conversation_id> <message>")
		}
	}
}
