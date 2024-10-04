package types

type Message struct {
	ID             int    `json:"id"`
	Text           string `json:"text"`
	Sender         string `json:"sender"`
	ConversationID string `json:"conversationID"`
	CreatedAt      string `json:"createdAt"`
}
