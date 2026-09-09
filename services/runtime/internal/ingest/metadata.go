package ingest

import "time"

// GitInfo captures repository version control signals
type GitInfo struct {
	IsGitRepo  bool   `json:"isGitRepo"`
	Branch     string `json:"branch,omitempty"`
	CommitHash string `json:"commitHash,omitempty"`
	RemoteURL  string `json:"remoteUrl,omitempty"`
}

// LanguageStat captures file counts, size and relative percentage for a language
type LanguageStat struct {
	Name       string  `json:"name"`
	FileCount  int     `json:"fileCount"`
	Bytes      int64   `json:"bytes"`
	Percentage float64 `json:"percentage"`
}

// Framework captures detected libraries/frameworks
type Framework struct {
	Name     string `json:"name"`
	Category string `json:"category"` // "frontend", "backend", "desktop", etc.
	Manifest string `json:"manifest"` // e.g. "apps/web/package.json"
}

// PackageManager represents detected package managers
type PackageManager struct {
	Name     string `json:"name"` // "npm", "pnpm", "yarn", "cargo", "go mod", "pip"
	Lockfile string `json:"lockfile"`
}

// Workspace represents monorepo packages/workspaces
type Workspace struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type"` // "node", "cargo", "go", "python"
}

// ProjectSignals captures infrastructure, CI, and config discoveries
type ProjectSignals struct {
	HasDocker   bool     `json:"hasDocker"`
	HasCI       bool     `json:"hasCi"`
	HasIaC      bool     `json:"hasIac"`
	ConfigFiles []string `json:"configFiles"`
	DockerFiles []string `json:"dockerFiles"`
	CIFiles     []string `json:"ciFiles"`
	IaCFiles    []string `json:"iacFiles"`
}

// ProjectMetadata is the complete registered project intelligence manifest
type ProjectMetadata struct {
	ID              string           `json:"id"`
	Name            string           `json:"name"`
	RootPath        string           `json:"rootPath"`
	Git             *GitInfo         `json:"git,omitempty"`
	Languages       []LanguageStat   `json:"languages"`
	Frameworks      []Framework      `json:"frameworks"`
	PackageManagers []PackageManager `json:"packageManagers"`
	IsMonorepo      bool             `json:"isMonorepo"`
	Workspaces      []Workspace      `json:"workspaces"`
	Signals         ProjectSignals   `json:"signals"`
	TotalFiles      int              `json:"totalFiles"`
	TotalBytes      int64            `json:"totalBytes"`
	CreatedAt       time.Time        `json:"createdAt"`
	ScannedAt       time.Time        `json:"scannedAt"`
	KnovraVersion   string           `json:"knovraVersion"`
}
