pub mod go;
pub mod python;
pub mod rust;
pub mod typescript;

use crate::models::{CallEdge, ExportRecord, FileIndex, ImportRecord, Symbol};

pub fn parse_file(file_path: &str, content: &str, language: &str, content_hash: &str) -> FileIndex {
    let mut symbols: Vec<Symbol> = Vec::new();
    let mut imports: Vec<ImportRecord> = Vec::new();
    let mut exports: Vec<ExportRecord> = Vec::new();
    let mut calls: Vec<CallEdge> = Vec::new();
    let parse_errors: Vec<String> = Vec::new();

    match language {
        "typescript" | "javascript" => {
            typescript::parse_typescript(file_path, content, &mut symbols, &mut imports, &mut exports, &mut calls);
        }
        "python" => {
            python::parse_python(file_path, content, &mut symbols, &mut imports, &mut exports, &mut calls);
        }
        "go" => {
            go::parse_go(file_path, content, &mut symbols, &mut imports, &mut exports, &mut calls);
        }
        "rust" => {
            rust::parse_rust(file_path, content, &mut symbols, &mut imports, &mut exports, &mut calls);
        }
        _ => {}
    }

    FileIndex {
        file_path: file_path.to_string(),
        content_hash: content_hash.to_string(),
        language: language.to_string(),
        symbols,
        imports,
        exports,
        calls,
        parse_errors,
    }
}
