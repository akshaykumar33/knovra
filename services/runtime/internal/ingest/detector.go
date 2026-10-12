package ingest

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const KnovraVersion = "0.1.0"

var extensionToLanguage = map[string]string{
	".ts":    "TypeScript",
	".tsx":   "TypeScript",
	".js":    "JavaScript",
	".jsx":   "JavaScript",
	".mjs":   "JavaScript",
	".cjs":   "JavaScript",
	".py":    "Python",
	".go":    "Go",
	".rs":    "Rust",
	".html":  "HTML",
	".css":   "CSS",
	".scss":  "SCSS",
	".sql":   "SQL",
	".tf":    "HCL/Terraform",
	".yaml":  "YAML",
	".yml":   "YAML",
	".json":  "JSON",
	".md":    "Markdown",
	".proto": "Protobuf",
	".sh":    "Shell",
	".ps1":   "PowerShell",
	".c":     "C",
	".h":     "C Header",
	".cpp":   "C++",
	".hpp":   "C++ Header",
	".java":  "Java",
}

// ScanProject executes a full non-destructive inspection of a target repository
func ScanProject(rootDir string) (*ProjectMetadata, error) {
	absRoot, err := filepath.Abs(rootDir)
	if err != nil {
		return nil, err
	}

	projectName := filepath.Base(absRoot)
	filter := NewIgnoreFilter(absRoot)

	// 1. Detect Git signals
	gitInfo := DetectGit(absRoot)

	// 2. Scan languages and file sizes
	languages, totalFiles, totalBytes := DetectLanguages(absRoot, filter)

	// 3. Detect frameworks, package managers, and workspaces
	frameworks, packageManagers, workspaces, isMonorepo := DetectFrameworksAndPackages(absRoot, filter)

	// 4. Detect infrastructure, CI, and IaC signals
	signals := DetectSignals(absRoot, filter)

	// Stable project ID derived from root path
	hash := sha256.Sum256([]byte(absRoot))
	projectID := "proj_" + hex.EncodeToString(hash[:])[:12]

	now := time.Now().UTC()
	return &ProjectMetadata{
		ID:              projectID,
		Name:            projectName,
		RootPath:        absRoot,
		Git:             gitInfo,
		Languages:       languages,
		Frameworks:      frameworks,
		PackageManagers: packageManagers,
		IsMonorepo:      isMonorepo,
		Workspaces:      workspaces,
		Signals:         signals,
		TotalFiles:      totalFiles,
		TotalBytes:      totalBytes,
		CreatedAt:       now,
		ScannedAt:       now,
		KnovraVersion:   KnovraVersion,
	}, nil
}

// DetectGit inspects .git without requiring the external git binary
func DetectGit(rootDir string) *GitInfo {
	gitDir := filepath.Join(rootDir, ".git")
	fi, err := os.Stat(gitDir)
	if err != nil || !fi.IsDir() {
		return &GitInfo{IsGitRepo: false}
	}

	info := &GitInfo{IsGitRepo: true}

	// Read branch from .git/HEAD
	headFile := filepath.Join(gitDir, "HEAD")
	if content, err := os.ReadFile(headFile); err == nil {
		headStr := strings.TrimSpace(string(content))
		if strings.HasPrefix(headStr, "ref: refs/heads/") {
			info.Branch = strings.TrimPrefix(headStr, "ref: refs/heads/")
			// Try reading commit hash
			refPath := filepath.Join(gitDir, "refs", "heads", info.Branch)
			if hashBytes, err := os.ReadFile(refPath); err == nil {
				info.CommitHash = strings.TrimSpace(string(hashBytes))
			}
		} else if len(headStr) == 40 {
			info.CommitHash = headStr
		}
	}

	// Read remote from .git/config
	configFile := filepath.Join(gitDir, "config")
	if file, err := os.Open(configFile); err == nil {
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if strings.HasPrefix(line, "url = ") {
				info.RemoteURL = strings.TrimPrefix(line, "url = ")
				break
			}
		}
	}

	return info
}

// DetectLanguages counts files and sizes per programming language
func DetectLanguages(rootDir string, filter *IgnoreFilter) ([]LanguageStat, int, int64) {
	langCounts := make(map[string]int)
	langBytes := make(map[string]int64)
	totalFiles := 0
	var totalBytes int64

	_ = filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if path != rootDir && filter.ShouldIgnoreDir(info.Name()) {
				return filepath.SkipDir
			}
			return nil
		}

		if filter.ShouldIgnoreFile(info.Name()) {
			return nil
		}

		ext := strings.ToLower(filepath.Ext(info.Name()))
		lang, exists := extensionToLanguage[ext]
		if exists {
			langCounts[lang]++
			langBytes[lang] += info.Size()
		}

		totalFiles++
		totalBytes += info.Size()
		return nil
	})

	stats := make([]LanguageStat, 0, len(langCounts))
	for lang, count := range langCounts {
		b := langBytes[lang]
		pct := 0.0
		if totalBytes > 0 {
			pct = (float64(b) / float64(totalBytes)) * 100
		}
		stats = append(stats, LanguageStat{
			Name:       lang,
			FileCount:  count,
			Bytes:      b,
			Percentage: float64(int(pct*100)) / 100, // round to 2 decimals
		})
	}

	// Sort by file count descending
	sort.Slice(stats, func(i, j int) bool {
		return stats[i].Bytes > stats[j].Bytes
	})

	return stats, totalFiles, totalBytes
}

// DetectFrameworksAndPackages parses package manifests and project structure
func DetectFrameworksAndPackages(rootDir string, filter *IgnoreFilter) ([]Framework, []PackageManager, []Workspace, bool) {
	frameworkMap := make(map[string]Framework)
	pkgMgrMap := make(map[string]PackageManager)
	var workspaces []Workspace
	isMonorepo := false

	_ = filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if path != rootDir && filter.ShouldIgnoreDir(info.Name()) {
				return filepath.SkipDir
			}
			return nil
		}

		relPath, _ := filepath.Rel(rootDir, path)
		base := info.Name()

		// 1. package.json analysis
		if base == "package.json" {
			data, err := os.ReadFile(path)
			if err == nil {
				var pj struct {
					Name            string                 `json:"name"`
					Workspaces      json.RawMessage        `json:"workspaces"`
					Dependencies    map[string]interface{} `json:"dependencies"`
					DevDependencies map[string]interface{} `json:"devDependencies"`
				}
				if json.Unmarshal(data, &pj) == nil {
					if len(pj.Workspaces) > 0 {
						isMonorepo = true
					}
					if relPath != "package.json" && pj.Name != "" {
						workspaces = append(workspaces, Workspace{
							Name: pj.Name,
							Path: filepath.Dir(relPath),
							Type: "node",
						})
					}

					allDeps := make(map[string]bool)
					for k := range pj.Dependencies {
						allDeps[k] = true
					}
					for k := range pj.DevDependencies {
						allDeps[k] = true
					}

					if allDeps["next"] {
						frameworkMap["Next.js"] = Framework{Name: "Next.js", Category: "frontend", Manifest: relPath}
					}
					if allDeps["@nestjs/core"] {
						frameworkMap["NestJS"] = Framework{Name: "NestJS", Category: "backend", Manifest: relPath}
					}
					if allDeps["react"] && !allDeps["next"] {
						frameworkMap["React"] = Framework{Name: "React", Category: "frontend", Manifest: relPath}
					}
					if allDeps["express"] && !allDeps["@nestjs/core"] {
						frameworkMap["Express"] = Framework{Name: "Express", Category: "backend", Manifest: relPath}
					}
					if allDeps["@tauri-apps/api"] {
						frameworkMap["Tauri"] = Framework{Name: "Tauri", Category: "desktop", Manifest: relPath}
					}
				}
			}
		}

		// 2. Cargo.toml analysis
		if base == "Cargo.toml" {
			pkgMgrMap["cargo"] = PackageManager{Name: "cargo", Lockfile: "Cargo.lock"}
			data, err := os.ReadFile(path)
			if err == nil {
				content := string(data)
				if strings.Contains(content, "[workspace]") {
					isMonorepo = true
				}
				if relPath != "Cargo.toml" {
					workspaces = append(workspaces, Workspace{
						Name: filepath.Base(filepath.Dir(relPath)),
						Path: filepath.Dir(relPath),
						Type: "cargo",
					})
				}
			}
		}

		// 3. go.mod analysis
		if base == "go.mod" {
			pkgMgrMap["go mod"] = PackageManager{Name: "go mod", Lockfile: "go.sum"}
			if relPath != "go.mod" {
				workspaces = append(workspaces, Workspace{
					Name: filepath.Base(filepath.Dir(relPath)),
					Path: filepath.Dir(relPath),
					Type: "go",
				})
			}
		}

		// 4. Python manifests
		if base == "pyproject.toml" || base == "requirements.txt" {
			pkgMgrMap["pip"] = PackageManager{Name: "pip", Lockfile: base}
			data, err := os.ReadFile(path)
			if err == nil {
				content := strings.ToLower(string(data))
				if strings.Contains(content, "fastapi") {
					frameworkMap["FastAPI"] = Framework{Name: "FastAPI", Category: "backend", Manifest: relPath}
				}
				if strings.Contains(content, "django") {
					frameworkMap["Django"] = Framework{Name: "Django", Category: "backend", Manifest: relPath}
				}
				if strings.Contains(content, "flask") {
					frameworkMap["Flask"] = Framework{Name: "Flask", Category: "backend", Manifest: relPath}
				}
			}
		}

		// Lockfiles check
		switch base {
		case "package-lock.json":
			pkgMgrMap["npm"] = PackageManager{Name: "npm", Lockfile: relPath}
		case "pnpm-lock.yaml":
			pkgMgrMap["pnpm"] = PackageManager{Name: "pnpm", Lockfile: relPath}
		case "yarn.lock":
			pkgMgrMap["yarn"] = PackageManager{Name: "yarn", Lockfile: relPath}
		}

		return nil
	})

	frameworks := make([]Framework, 0, len(frameworkMap))
	for _, f := range frameworkMap {
		frameworks = append(frameworks, f)
	}
	sort.Slice(frameworks, func(i, j int) bool { return frameworks[i].Name < frameworks[j].Name })

	packageManagers := make([]PackageManager, 0, len(pkgMgrMap))
	for _, pm := range pkgMgrMap {
		packageManagers = append(packageManagers, pm)
	}
	sort.Slice(packageManagers, func(i, j int) bool { return packageManagers[i].Name < packageManagers[j].Name })

	return frameworks, packageManagers, workspaces, isMonorepo
}

// DetectSignals finds Docker, CI/CD, and IaC signals
func DetectSignals(rootDir string, filter *IgnoreFilter) ProjectSignals {
	var signals ProjectSignals

	configNames := map[string]bool{
		"tsconfig.json":   true,
		"Cargo.toml":      true,
		"go.mod":          true,
		"pyproject.toml":  true,
		"package.json":    true,
		"knovra.yaml":     true,
		"KNOVRA.yaml":     true,
		".eslintrc":       true,
		".prettierrc":     true,
	}

	_ = filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if path != rootDir && filter.ShouldIgnoreDir(info.Name()) {
				return filepath.SkipDir
			}
			return nil
		}

		relPath, _ := filepath.Rel(rootDir, path)
		base := info.Name()

		// Docker signals
		if strings.HasPrefix(base, "Dockerfile") || strings.Contains(base, "docker-compose") || base == "compose.yaml" {
			signals.HasDocker = true
			signals.DockerFiles = append(signals.DockerFiles, relPath)
		}

		// CI signals
		if strings.Contains(relPath, ".github/workflows") || strings.Contains(relPath, ".gitlab-ci") || strings.Contains(relPath, ".circleci") {
			signals.HasCI = true
			signals.CIFiles = append(signals.CIFiles, relPath)
		}

		// IaC signals
		if strings.HasSuffix(base, ".tf") || strings.Contains(relPath, "kubernetes") || strings.Contains(relPath, "terraform") {
			signals.HasIaC = true
			signals.IaCFiles = append(signals.IaCFiles, relPath)
		}

		// Config files
		if configNames[base] {
			signals.ConfigFiles = append(signals.ConfigFiles, relPath)
		}

		return nil
	})

	return signals
}
