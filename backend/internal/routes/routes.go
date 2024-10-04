package routes

import (
	"net/http"

	"github.com/4fort/fort-chat-backend/internal/ws"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", ws.HandleWebSocket)

	return mux
}
