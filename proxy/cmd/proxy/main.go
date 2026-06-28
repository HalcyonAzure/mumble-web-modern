package main

import (
	"crypto/tls"
	"flag"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

var (
	listenAddr = flag.String("listen", "0.0.0.0:64737", "WebSocket listen address")
	serverAddr = flag.String("server", "your-mumble-server.com:64738", "Mumble server address")
	certVerify = flag.Bool("cert-verify", false, "Verify Mumble server TLS certificate")
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  64 * 1024,
	WriteBufferSize: 64 * 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	flag.Parse()
	log.Printf("Proxy: ws://%s -> %s", *listenAddr, *serverAddr)

	ln, err := net.Listen("tcp", *listenAddr)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() { <-sigCh; ln.Close(); os.Exit(0) }()

	for {
		conn, err := ln.Accept()
		if err != nil {
			continue
		}
		go handleConn(conn)
	}
}

func handleConn(conn net.Conn) {
	defer conn.Close()
	wsConn, err := upgrader.Upgrade(conn, nil, nil)
	if err != nil {
		return
	}
	defer wsConn.Close()

	dialer := &tls.Config{InsecureSkipVerify: !*certVerify}
	tcpConn, err := tls.Dial("tcp", *serverAddr, dialer)
	if err != nil {
		return
	}
	defer tcpConn.Close()

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		for {
			mt, message, err := wsConn.ReadMessage()
			if err != nil {
				return
			}
			if mt == websocket.BinaryMessage {
				tcpConn.Write(message)
			}
		}
	}()

	go func() {
		defer wg.Done()
		buf := make([]byte, 64*1024)
		for {
			n, err := tcpConn.Read(buf)
			if err != nil {
				return
			}
			if err := wsConn.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				return
			}
		}
	}()

	wg.Wait()
}
