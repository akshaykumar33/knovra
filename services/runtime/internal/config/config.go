package config

import (
	"os"
)

type Config struct {
	Port        string
	Environment string
	LogLevel    string
}

func Load() *Config {
	port := os.Getenv("PORT_RUNTIME_DAEMON")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("KNOVRA_ENV")
	if env == "" {
		env = "development"
	}

	logLevel := os.Getenv("KNOVRA_LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}

	return &Config{
		Port:        port,
		Environment: env,
		LogLevel:    logLevel,
	}
}
