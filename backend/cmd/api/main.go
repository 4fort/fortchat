package main

import (
	"fmt"
	"net/http"

	"github.com/4fort/fort-chat-backend/internal/routes"
)

func main() {
	router := routes.NewRouter()

	port := 8080
	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("[server]: Running on port %d\n", port)
	if err := http.ListenAndServe(addr, router); err != nil {
		fmt.Println("[error/ListenAndServe]: ", err)
	}
}
