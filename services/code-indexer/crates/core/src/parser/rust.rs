use crate::models::{CallEdge, ExportRecord, ImportRecord, Symbol, SymbolKind};

pub fn parse_rust(
    file_path: &str,
    content: &str,
    symbols: &mut Vec<Symbol>,
    imports: &mut Vec<ImportRecord>,
    exports: &mut Vec<ExportRecord>,
    calls: &mut Vec<CallEdge>,
) {
    let mut current_impl: Option<String> = None;

    for (idx, line) in content.lines().enumerate() {
        let line_num = idx + 1;
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with('*') {
            continue;
        }

        // 1. Imports (use ...)
        if trimmed.starts_with("use ") || trimmed.starts_with("pub use ") {
            let use_part = trimmed.trim_start_matches("pub ").trim_start_matches("use ").trim_end_matches(';');
            imports.push(ImportRecord {
                source_file: file_path.to_string(),
                imported_symbol: use_part.split("::").last().unwrap_or(use_part).to_string(),
                module_path: use_part.to_string(),
                line: line_num,
            });
            continue;
        }

        // 2. Structs
        if trimmed.contains("struct ") {
            let is_pub = trimmed.starts_with("pub ");
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "struct" && p_idx + 1 < parts.len() {
                    let struct_name = parts[p_idx + 1].trim_matches(|c| c == '{' || c == '(' || c == ';' || c == '<');
                    symbols.push(Symbol {
                        id: Symbol::generate_id(file_path, &SymbolKind::Struct, struct_name, line_num),
                        name: struct_name.to_string(),
                        kind: SymbolKind::Struct,
                        file_path: file_path.to_string(),
                        line_start: line_num,
                        line_end: line_num,
                        signature: trimmed.to_string(),
                        parent_id: None,
                    });
                    if is_pub {
                        exports.push(ExportRecord {
                            source_file: file_path.to_string(),
                            symbol_name: struct_name.to_string(),
                            line: line_num,
                        });
                    }
                    break;
                }
            }
            continue;
        }

        // 3. Enums
        if trimmed.contains("enum ") {
            let is_pub = trimmed.starts_with("pub ");
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "enum" && p_idx + 1 < parts.len() {
                    let enum_name = parts[p_idx + 1].trim_matches(|c| c == '{' || c == '<');
                    symbols.push(Symbol {
                        id: Symbol::generate_id(file_path, &SymbolKind::Enum, enum_name, line_num),
                        name: enum_name.to_string(),
                        kind: SymbolKind::Enum,
                        file_path: file_path.to_string(),
                        line_start: line_num,
                        line_end: line_num,
                        signature: trimmed.to_string(),
                        parent_id: None,
                    });
                    if is_pub {
                        exports.push(ExportRecord {
                            source_file: file_path.to_string(),
                            symbol_name: enum_name.to_string(),
                            line: line_num,
                        });
                    }
                    break;
                }
            }
            continue;
        }

        // 4. Traits
        if trimmed.contains("trait ") {
            let is_pub = trimmed.starts_with("pub ");
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "trait" && p_idx + 1 < parts.len() {
                    let trait_name = parts[p_idx + 1].trim_matches(|c| c == '{' || c == '<');
                    symbols.push(Symbol {
                        id: Symbol::generate_id(file_path, &SymbolKind::Trait, trait_name, line_num),
                        name: trait_name.to_string(),
                        kind: SymbolKind::Trait,
                        file_path: file_path.to_string(),
                        line_start: line_num,
                        line_end: line_num,
                        signature: trimmed.to_string(),
                        parent_id: None,
                    });
                    if is_pub {
                        exports.push(ExportRecord {
                            source_file: file_path.to_string(),
                            symbol_name: trait_name.to_string(),
                            line: line_num,
                        });
                    }
                    break;
                }
            }
            continue;
        }

        // 5. Impl blocks
        if trimmed.starts_with("impl ") || trimmed.starts_with("impl<") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if let Some(target) = parts.last() {
                let clean_target = target.trim_matches(|c| c == '{' || c == '<');
                current_impl = Some(clean_target.to_string());
            }
            continue;
        }

        // 6. Functions and Methods
        if trimmed.contains("fn ") {
            let is_pub = trimmed.starts_with("pub ");
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "fn" && p_idx + 1 < parts.len() {
                    let fn_name = parts[p_idx + 1].split('(').next().unwrap_or("").split('<').next().unwrap_or("");
                    if !fn_name.is_empty() {
                        let kind = if current_impl.is_some() {
                            SymbolKind::Method
                        } else {
                            SymbolKind::Function
                        };

                        symbols.push(Symbol {
                            id: Symbol::generate_id(file_path, &kind, fn_name, line_num),
                            name: fn_name.to_string(),
                            kind,
                            file_path: file_path.to_string(),
                            line_start: line_num,
                            line_end: line_num,
                            signature: trimmed.to_string(),
                            parent_id: current_impl.clone(),
                        });

                        if is_pub {
                            exports.push(ExportRecord {
                                source_file: file_path.to_string(),
                                symbol_name: fn_name.to_string(),
                                line: line_num,
                            });
                        }
                    }
                    break;
                }
            }
        }

        // 7. Calls
        if let Some(paren_idx) = trimmed.find('(') {
            let before = trimmed[..paren_idx].trim();
            if let Some(word) = before.split(|c: char| !c.is_alphanumeric() && c != '_' && c != ':').last() {
                let clean_word = word.trim_start_matches(':');
                if !clean_word.is_empty() && clean_word != "if" && clean_word != "for" && clean_word != "match" && clean_word != "fn" && clean_word != "println" && clean_word != "assert" {
                    calls.push(CallEdge {
                        caller_name: current_impl.clone().unwrap_or_else(|| "crate".to_string()),
                        callee_name: clean_word.to_string(),
                        line: line_num,
                    });
                }
            }
        }

        if trimmed == "}" {
            current_impl = None;
        }
    }
}
