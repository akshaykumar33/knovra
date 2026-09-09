pub mod graph;
pub mod models;
pub mod parser;
pub mod scanner;
pub mod storage;

use models::{FileIndex, IncrementalDelta, ProjectIndex};
use std::collections::HashMap;
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

// Incremental indexing: re-parses only specified changed files against existing index
pub fn index_incremental(
    root: &Path,
    changed_files: &[&str],
    previous_index: &ProjectIndex,
) -> (ProjectIndex, IncrementalDelta) {
    let mut delta = IncrementalDelta {
        total_symbols_before: previous_index.total_symbols,
        ..Default::default()
    };

    let mut old_files_map: HashMap<String, FileIndex> = HashMap::new();
    for f in &previous_index.files {
        old_files_map.insert(f.file_path.clone(), f.clone());
    }

    let mut new_files_map = old_files_map.clone();
    let mut invalidated_deps: std::collections::HashSet<String> = std::collections::HashSet::new();

    for &rel_path in changed_files {
        let norm_path = rel_path.replace('\\', "/");
        let full_path = root.join(&norm_path);

        if full_path.exists() && full_path.is_file() {
            if let Some(lang) = scanner::detect_file_language(&full_path) {
                if let Ok(content) = std::fs::read_to_string(&full_path) {
                    let hash = scanner::compute_sha256(content.as_bytes());
                    let new_file_index = parser::parse_file(&norm_path, &content, &lang, &hash);

                    if let Some(old_file_index) = old_files_map.get(&norm_path) {
                        delta.modified_files.push(norm_path.clone());

                        let old_syms: HashMap<String, &models::Symbol> = old_file_index
                            .symbols
                            .iter()
                            .map(|s| (s.name.clone(), s))
                            .collect();
                        let new_syms: HashMap<String, &models::Symbol> = new_file_index
                            .symbols
                            .iter()
                            .map(|s| (s.name.clone(), s))
                            .collect();

                        for (name, new_sym) in &new_syms {
                            if let Some(old_sym) = old_syms.get(name) {
                                if old_sym.signature != new_sym.signature || old_sym.line_start != new_sym.line_start {
                                    delta.changed_symbols.push(models::ChangedSymbol {
                                        symbol_id: new_sym.id.clone(),
                                        symbol_name: new_sym.name.clone(),
                                        kind: new_sym.kind.clone(),
                                        file_path: norm_path.clone(),
                                        change_kind: models::ChangeKind::Modified,
                                        old_signature: Some(old_sym.signature.clone()),
                                        new_signature: Some(new_sym.signature.clone()),
                                        line_start: new_sym.line_start,
                                        line_end: new_sym.line_end,
                                    });
                                }
                            } else {
                                delta.changed_symbols.push(models::ChangedSymbol {
                                    symbol_id: new_sym.id.clone(),
                                    symbol_name: new_sym.name.clone(),
                                    kind: new_sym.kind.clone(),
                                    file_path: norm_path.clone(),
                                    change_kind: models::ChangeKind::Added,
                                    old_signature: None,
                                    new_signature: Some(new_sym.signature.clone()),
                                    line_start: new_sym.line_start,
                                    line_end: new_sym.line_end,
                                });
                            }
                        }

                        for (name, old_sym) in &old_syms {
                            if !new_syms.contains_key(name) {
                                delta.changed_symbols.push(models::ChangedSymbol {
                                    symbol_id: old_sym.id.clone(),
                                    symbol_name: old_sym.name.clone(),
                                    kind: old_sym.kind.clone(),
                                    file_path: norm_path.clone(),
                                    change_kind: models::ChangeKind::Deleted,
                                    old_signature: Some(old_sym.signature.clone()),
                                    new_signature: None,
                                    line_start: old_sym.line_start,
                                    line_end: old_sym.line_end,
                                });
                            }
                        }
                    } else {
                        delta.added_files.push(norm_path.clone());
                        for s in &new_file_index.symbols {
                            delta.changed_symbols.push(models::ChangedSymbol {
                                symbol_id: s.id.clone(),
                                symbol_name: s.name.clone(),
                                kind: s.kind.clone(),
                                file_path: norm_path.clone(),
                                change_kind: models::ChangeKind::Added,
                                old_signature: None,
                                new_signature: Some(s.signature.clone()),
                                line_start: s.line_start,
                                line_end: s.line_end,
                            });
                        }
                    }

                    new_files_map.insert(norm_path.clone(), new_file_index);
                }
            }
        } else if let Some(old_file_index) = old_files_map.get(&norm_path) {
            delta.deleted_files.push(norm_path.clone());
            for s in &old_file_index.symbols {
                delta.changed_symbols.push(models::ChangedSymbol {
                    symbol_id: s.id.clone(),
                    symbol_name: s.name.clone(),
                    kind: s.kind.clone(),
                    file_path: norm_path.clone(),
                    change_kind: models::ChangeKind::Deleted,
                    old_signature: Some(s.signature.clone()),
                    new_signature: None,
                    line_start: s.line_start,
                    line_end: s.line_end,
                });
            }
            new_files_map.remove(&norm_path);
        }

        for edge in &previous_index.dependency_edges {
            if edge.to_file_or_module == norm_path || edge.to_file_or_module.contains(&norm_path) {
                if edge.from_file != norm_path {
                    invalidated_deps.insert(edge.from_file.clone());
                }
            }
        }
    }

    delta.invalidated_dependencies = invalidated_deps.into_iter().collect();

    let updated_files: Vec<FileIndex> = new_files_map.into_values().collect();
    let now_secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let new_project_index = graph::build_project_index(&root.to_string_lossy(), updated_files, now_secs);
    delta.total_symbols_after = new_project_index.total_symbols;

    (new_project_index, delta)
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

    #[test]
    fn test_incremental_indexing() {
        let root = std::env::temp_dir().join(format!("knovra_test_inc_{}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos()));
        std::fs::create_dir_all(&root).unwrap();

        let file_a = root.join("service.py");
        std::fs::write(&file_a, "def calculate_total():\n    return 10\n").unwrap();

        let initial_index = index_repository(&root);
        assert_eq!(initial_index.total_symbols, 1);
        assert_eq!(initial_index.files.len(), 1);

        // Modify file_a to add another function
        std::fs::write(&file_a, "def calculate_total():\n    return 10\n\ndef format_currency():\n    pass\n").unwrap();

        let (new_index, delta) = index_incremental(&root, &["service.py"], &initial_index);
        assert_eq!(new_index.total_symbols, 2);
        assert_eq!(delta.modified_files, vec!["service.py"]);
        assert_eq!(delta.changed_symbols.len(), 1);
        assert_eq!(delta.changed_symbols[0].symbol_name, "format_currency");
        assert_eq!(delta.changed_symbols[0].change_kind, models::ChangeKind::Added);

        let _ = std::fs::remove_dir_all(&root);
    }
}

