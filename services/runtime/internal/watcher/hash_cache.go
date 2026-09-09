package watcher

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
)

// HashCache maintains a thread-safe map of relative file paths to SHA-256 content hashes.
type HashCache struct {
	mu     sync.RWMutex
	hashes map[string]string
}

// NewHashCache creates an empty hash cache.
func NewHashCache() *HashCache {
	return &HashCache{
		hashes: make(map[string]string),
	}
}

// ComputeFileHash computes a deterministic hex-encoded SHA-256 hash of a file on disk.
func ComputeFileHash(absPath string) (string, error) {
	f, err := os.Open(absPath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// Get retrieves the recorded hash for a relative path.
func (c *HashCache) Get(relPath string) (string, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	h, ok := c.hashes[relPath]
	return h, ok
}

// Set records the hash for a relative path.
func (c *HashCache) Set(relPath, hash string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.hashes[relPath] = hash
}

// Delete removes a relative path from the cache.
func (c *HashCache) Delete(relPath string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.hashes, relPath)
}

// All returns a clone of all cached hashes.
func (c *HashCache) All() map[string]string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	clone := make(map[string]string, len(c.hashes))
	for k, v := range c.hashes {
		clone[k] = v
	}
	return clone
}

// CheckAndUpdate computes the current hash of absPath and checks if it differs from the cached hash.
func (c *HashCache) CheckAndUpdate(relPath, absPath string) (changed bool, newHash string, err error) {
	newHash, err = ComputeFileHash(absPath)
	if err != nil {
		return false, "", err
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	oldHash, exists := c.hashes[relPath]
	if !exists || oldHash != newHash {
		c.hashes[relPath] = newHash
		return true, newHash, nil
	}

	return false, oldHash, nil
}

// SaveToFile serializes the cache to a JSON file.
func (c *HashCache) SaveToFile(destPath string) error {
	c.mu.RLock()
	data, err := json.MarshalIndent(c.hashes, "", "  ")
	c.mu.RUnlock()
	if err != nil {
		return fmt.Errorf("failed to encode hash cache: %w", err)
	}

	dir := filepath.Dir(destPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	return os.WriteFile(destPath, data, 0644)
}

// LoadFromFile restores hashes from a JSON file.
func (c *HashCache) LoadFromFile(sourcePath string) error {
	data, err := os.ReadFile(sourcePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	var m map[string]string
	if err := json.Unmarshal(data, &m); err != nil {
		return fmt.Errorf("failed to decode hash cache: %w", err)
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.hashes = m
	return nil
}
