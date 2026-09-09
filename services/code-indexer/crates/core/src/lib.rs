pub mod graph;
pub mod models;
pub mod parser;
pub mod scanner;
pub mod storage;

use models::{FileIndex, ProjectIndex};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ServiceStatus {
    Ok,
    Degraded,
    Down,
}

impl ServiceStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ServiceStatus::Ok => "ok",
            ServiceStatus::Degraded => "degraded",
            ServiceStatus::Down => "down",
        }
    }
}

#[derive(Debug, Clone)]
pub struct IndexerHealth {
    pub service: String,
    pub status: ServiceStatus,
    pub version: String,
    pub timestamp_secs: u64,
    pub supported_languages: Vec<String>,
}

impl IndexerHealth {
    pub fn new() -> Self {
        let timestamp_secs = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        Self {
            service: "knovra-code-indexer".to_string(),
            status: ServiceStatus::Ok,
            version: env!("CARGO_PKG_VERSION").to_string(),
            timestamp_secs,
            supported_languages: vec![
                "typescript".into(),
                "javascript".into(),
                "python".into(),
                "go".into(),
                "rust".into(),
            ],
        }
    }

    pub fn to_json(&self) -> String {
        let langs = self
            .supported_languages
            .iter()
            .map(|l| format!("\"{}\"", l))
            .collect::<Vec<_>>()
            .join(", ");

        format!(
            "{{\"service\":\"{}\",\"status\":\"{}\",\"version\":\"{}\",\"timestamp_secs\":{},\"supported_languages\":[{}]}}",
            self.service,
            self.status.as_str(),
            self.version,
            self.timestamp_secs,
            langs
        )
    }
}

impl Default for IndexerHealth {
    fn default() -> Self {
        Self::new()
    }
}

// High-level orchestrator: scans and parses all source files in a repository
pub fn index_repository(root: &Path) -> ProjectIndex {
    let scanned_files = scanner::scan_source_files(root);
    let mut file_indices: Vec<FileIndex> = Vec::new();

    for file in scanned_files {
        let file_index = parser::parse_file(
            &file.relative_path,
            &file.content,
            &file.language,
            &file.content_hash,
        );
        file_indices.push(file_index);
    }

    let now_secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    graph::build_project_index(&root.to_string_lossy(), file_indices, now_secs)
}

#[cfg(test)]
mod tests {
    use super::*;
    use models::SymbolKind;

    #[test]
    fn test_indexer_health() {
        let health = IndexerHealth::new();
        assert_eq!(health.status, ServiceStatus::Ok);
        assert_eq!(health.service, "knovra-code-indexer");
        assert!(health.supported_languages.contains(&"rust".to_string()));
        assert!(health.supported_languages.contains(&"typescript".to_string()));
    }

    #[test]
    fn test_typescript_parsing() {
        let ts_code = r#"
            import { HealthService } from './health.service';
            export interface UserConfig {
                id: string;
            }
            export class AuthController {
                validateToken(token: string) {
                    console.log(token);
                }
            }
        "#;
        let index = parser::parse_file("src/auth.ts", ts_code, "typescript", "hash123");
        assert_eq!(index.language, "typescript");
        assert!(index.symbols.iter().any(|s| s.name == "UserConfig" && s.kind == SymbolKind::Interface));
        assert!(index.symbols.iter().any(|s| s.name == "AuthController" && s.kind == SymbolKind::Class));
        assert!(index.symbols.iter().any(|s| s.name == "validateToken" && s.kind == SymbolKind::Method));
        assert_eq!(index.imports.len(), 1);
    }

    #[test]
    fn test_python_parsing() {
        let py_code = r#"
            from fastapi import FastAPI
            import os

            class ContextService:
                def get_context(self, task: str):
                    return {"task": task}

            def run_server():
                pass
        "#;
        let index = parser::parse_file("app/main.py", py_code, "python", "hash456");
        assert!(index.symbols.iter().any(|s| s.name == "ContextService" && s.kind == SymbolKind::Class));
        assert!(index.symbols.iter().any(|s| s.name == "get_context" && s.kind == SymbolKind::Method));
        assert!(index.symbols.iter().any(|s| s.name == "run_server" && s.kind == SymbolKind::Function));
        assert_eq!(index.imports.len(), 2);
    }

    #[test]
    fn test_go_parsing() {
        let go_code = r#"
            package main

            import "fmt"

            type Server struct {
                port int
            }

            func (s *Server) Start() error {
                fmt.Println("starting")
                return nil
            }

            func MainHelper() {}
        "#;
        let index = parser::parse_file("main.go", go_code, "go", "hash789");
        assert!(index.symbols.iter().any(|s| s.name == "Server" && s.kind == SymbolKind::Struct));
        assert!(index.symbols.iter().any(|s| s.name == "Start" && s.kind == SymbolKind::Method));
        assert!(index.symbols.iter().any(|s| s.name == "MainHelper" && s.kind == SymbolKind::Function));
    }

    #[test]
    fn test_rust_parsing() {
        let rs_code = r#"
            use std::path::Path;

            pub struct GraphEngine {
                pub id: String,
            }

            impl GraphEngine {
                pub fn new() -> Self {
                    Self { id: String::new() }
                }
            }

            pub trait Traversal {
                fn traverse(&self);
            }
        "#;
        let index = parser::parse_file("src/graph.rs", rs_code, "rust", "hash999");
        assert!(index.symbols.iter().any(|s| s.name == "GraphEngine" && s.kind == SymbolKind::Struct));
        assert!(index.symbols.iter().any(|s| s.name == "new" && s.kind == SymbolKind::Method));
        assert!(index.symbols.iter().any(|s| s.name == "Traversal" && s.kind == SymbolKind::Trait));
        assert_eq!(index.imports.len(), 1);
    }
}
