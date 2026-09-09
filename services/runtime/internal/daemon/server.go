package daemon

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"

	"knovra/runtime/internal/config"
)

type HealthResponse struct {
	Status        string            `json:"status"`
	Service       string            `json:"service"`
	Version       string            `json:"version"`
	Timestamp     string            `json:"timestamp"`
	UptimeSeconds float64           `json:"uptimeSeconds"`
	Details       map[string]string `json:"details,omitempty"`
}

type Server struct {
	httpServer *http.Server
	cfg        *config.Config
	startTime  time.Time
	logger     *slog.Logger
}

func NewServer(cfg *config.Config) *Server {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	return &Server{
		cfg:       cfg,
		startTime: time.Now(),
		logger:    logger,
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.handleHealthz)
	mux.HandleFunc("GET /readyz", s.handleReadyz)
	mux.HandleFunc("GET /", s.handleRoot)
	return mux
}

func (s *Server) handleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	resp := HealthResponse{
		Status:        "ok",
		Service:       "knovra-runtime-daemon",
		Version:       "0.1.0",
		Timestamp:     time.Now().UTC().Format(time.RFC3339),
		UptimeSeconds: time.Since(s.startTime).Seconds(),
		Details: map[string]string{
			"mcp_gateway": "ready",
			"file_watcher": "idle",
		},
	}
	_ = json.NewEncoder(w).Encode(resp)
}

func (s *Server) handleReadyz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"name":    "Knovra Runtime Daemon",
		"version": "0.1.0",
	})
}

func (s *Server) Start() error {
	s.httpServer = &http.Server{
		Addr:         ":" + s.cfg.Port,
		Handler:      s.Routes(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	s.logger.Info("Knovra Runtime Daemon starting", "port", s.cfg.Port, "env", s.cfg.Environment)
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	s.logger.Info("Knovra Runtime Daemon shutting down")
	if s.httpServer != nil {
		return s.httpServer.Shutdown(ctx)
	}
	return nil
}
