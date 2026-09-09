use crate::models::{CallEdge, ExportRecord, ImportRecord, Symbol, SymbolKind};

pub fn parse_go(
    file_path: &str,
    content: &str,
    symbols: &mut Vec<Symbol>,
    imports: &mut Vec<ImportRecord>,
    exports: &mut Vec<ExportRecord>,
    calls: &mut Vec<CallEdge>,
) {
    let mut in_import_block = false;

    for (idx, line) in content.lines().enumerate() {
        let line_num = idx + 1;
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with("//") {
            continue;
        }

        // 1. Imports
        if trimmed.starts_with("import (") {
            in_import_block = true;
            continue;
        }
        if in_import_block {
            if trimmed == ")" {
                in_import_block = false;
            } else {
                let pkg = trimmed.trim_matches('"');
                if !pkg.is_empty() {
                    imports.push(ImportRecord {
                        source_file: file_path.to_string(),
                        imported_symbol: pkg.split('/').last().unwrap_or(pkg).to_string(),
                        module_path: pkg.to_string(),
                        line: line_num,
                    });
                }
            }
            continue;
        }
        if trimmed.starts_with("import ") {
            let pkg = trimmed[7..].trim().trim_matches('"');
            imports.push(ImportRecord {
                source_file: file_path.to_string(),
                imported_symbol: pkg.split('/').last().unwrap_or(pkg).to_string(),
                module_path: pkg.to_string(),
                line: line_num,
            });
            continue;
        }

        // 2. Struct and Interface types
        if trimmed.starts_with("type ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() >= 3 {
                let type_name = parts[1];
                let type_kind_str = parts[2];
                let kind = match type_kind_str {
                    "struct" => SymbolKind::Struct,
                    "interface" => SymbolKind::Interface,
                    _ => SymbolKind::TypeAlias,
                };

                symbols.push(Symbol {
                    id: Symbol::generate_id(file_path, &kind, type_name, line_num),
                    name: type_name.to_string(),
                    kind,
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    signature: trimmed.to_string(),
                    parent_id: None,
                });

                if type_name.chars().next().map_or(false, |c| c.is_uppercase()) {
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: type_name.to_string(),
                        line: line_num,
                    });
                }
            }
            continue;
        }

        // 3. Functions and methods
        if trimmed.starts_with("func ") {
            let rest = &trimmed[5..];
            if rest.starts_with('(') {
                // Method with receiver: func (r *Server) Handle(...)
                if let Some(close_paren) = rest.find(')') {
                    let receiver = rest[1..close_paren].trim();
                    let fn_part = rest[close_paren + 1..].trim();
                    let fn_name = fn_part.split('(').next().unwrap_or("").trim();
                    if !fn_name.is_empty() {
                        let parent = receiver.split_whitespace().last().unwrap_or("").trim_matches('*');
                        symbols.push(Symbol {
                            id: Symbol::generate_id(file_path, &SymbolKind::Method, fn_name, line_num),
                            name: fn_name.to_string(),
                            kind: SymbolKind::Method,
                            file_path: file_path.to_string(),
                            line_start: line_num,
                            line_end: line_num,
                            signature: trimmed.to_string(),
                            parent_id: Some(parent.to_string()),
                        });

                        if fn_name.chars().next().map_or(false, |c| c.is_uppercase()) {
                            exports.push(ExportRecord {
                                source_file: file_path.to_string(),
                                symbol_name: fn_name.to_string(),
                                line: line_num,
                            });
                        }
                    }
                }
            } else {
                // Standalone function: func Run(...)
                let fn_name = rest.split('(').next().unwrap_or("").trim();
                if !fn_name.is_empty() {
                    symbols.push(Symbol {
                        id: Symbol::generate_id(file_path, &SymbolKind::Function, fn_name, line_num),
                        name: fn_name.to_string(),
                        kind: SymbolKind::Function,
                        file_path: file_path.to_string(),
                        line_start: line_num,
                        line_end: line_num,
                        signature: trimmed.to_string(),
                        parent_id: None,
                    });

                    if fn_name.chars().next().map_or(false, |c| c.is_uppercase()) {
                        exports.push(ExportRecord {
                            source_file: file_path.to_string(),
                            symbol_name: fn_name.to_string(),
                            line: line_num,
                        });
                    }
                }
            }
        }

        // 4. Calls
        if let Some(paren_idx) = trimmed.find('(') {
            let before = trimmed[..paren_idx].trim();
            if let Some(word) = before.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '.').last() {
                if !word.is_empty() && word != "if" && word != "for" && word != "switch" && word != "func" {
                    calls.push(CallEdge {
                        caller_name: "package".to_string(),
                        callee_name: word.to_string(),
                        line: line_num,
                    });
                }
            }
        }
    }
}
