use crate::models::{CallEdge, ExportRecord, ImportRecord, Symbol, SymbolKind};

pub fn parse_typescript(
    file_path: &str,
    content: &str,
    symbols: &mut Vec<Symbol>,
    imports: &mut Vec<ImportRecord>,
    exports: &mut Vec<ExportRecord>,
    calls: &mut Vec<CallEdge>,
) {
    let mut current_class: Option<String> = None;
    let mut class_brace_depth = 0;

    for (idx, line) in content.lines().enumerate() {
        let line_num = idx + 1;
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with('*') {
            continue;
        }

        // Track braces for class scope
        if current_class.is_some() {
            class_brace_depth += trimmed.matches('{').count() as i32;
            class_brace_depth -= trimmed.matches('}').count() as i32;
            if class_brace_depth <= 0 {
                current_class = None;
                class_brace_depth = 0;
            }
        }

        // 1. Imports
        if trimmed.starts_with("import ") {
            if let Some(from_idx) = trimmed.find("from ") {
                let module_part = trimmed[from_idx + 5..].trim().trim_matches(|c| c == ';' || c == '\'' || c == '"');
                let import_part = trimmed[7..from_idx].trim();
                imports.push(ImportRecord {
                    source_file: file_path.to_string(),
                    imported_symbol: import_part.to_string(),
                    module_path: module_part.to_string(),
                    line: line_num,
                });
            }
            continue;
        }

        // 2. Class detection
        if trimmed.starts_with("class ") || trimmed.starts_with("export class ") || trimmed.starts_with("export default class ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            let mut class_name = "";
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "class" && p_idx + 1 < parts.len() {
                    class_name = parts[p_idx + 1].trim_matches(|c| c == '{' || c == '(' || c == ':');
                    break;
                }
            }
            if !class_name.is_empty() {
                current_class = Some(class_name.to_string());
                class_brace_depth = if trimmed.contains('{') { 1 } else { 0 };
                symbols.push(Symbol {
                    id: Symbol::generate_id(file_path, &SymbolKind::Class, class_name, line_num),
                    name: class_name.to_string(),
                    kind: SymbolKind::Class,
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    signature: trimmed.to_string(),
                    parent_id: None,
                });
                if trimmed.contains("export") {
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: class_name.to_string(),
                        line: line_num,
                    });
                }
            }
            continue;
        }

        // 3. Interface detection
        if trimmed.starts_with("interface ") || trimmed.starts_with("export interface ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            let mut iface_name = "";
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "interface" && p_idx + 1 < parts.len() {
                    iface_name = parts[p_idx + 1].trim_matches(|c| c == '{' || c == '<');
                    break;
                }
            }
            if !iface_name.is_empty() {
                symbols.push(Symbol {
                    id: Symbol::generate_id(file_path, &SymbolKind::Interface, iface_name, line_num),
                    name: iface_name.to_string(),
                    kind: SymbolKind::Interface,
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    signature: trimmed.to_string(),
                    parent_id: None,
                });
                if trimmed.contains("export") {
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: iface_name.to_string(),
                        line: line_num,
                    });
                }
            }
            continue;
        }

        // 4. Type Alias detection
        if trimmed.starts_with("type ") || trimmed.starts_with("export type ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            let mut type_name = "";
            for (p_idx, p) in parts.iter().enumerate() {
                if *p == "type" && p_idx + 1 < parts.len() {
                    type_name = parts[p_idx + 1].trim_matches(|c| c == '=' || c == '<');
                    break;
                }
            }
            if !type_name.is_empty() {
                symbols.push(Symbol {
                    id: Symbol::generate_id(file_path, &SymbolKind::TypeAlias, type_name, line_num),
                    name: type_name.to_string(),
                    kind: SymbolKind::TypeAlias,
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    signature: trimmed.to_string(),
                    parent_id: None,
                });
            }
            continue;
        }

        // 5. Methods inside Class
        if current_class.is_some() && trimmed.contains('(') && !trimmed.starts_with("if") && !trimmed.starts_with("for") && !trimmed.starts_with("while") && !trimmed.starts_with("return") && !trimmed.starts_with("switch") {
            let clean = trimmed.trim_start_matches("async ").trim_start_matches("public ").trim_start_matches("private ").trim_start_matches("protected ").trim_start_matches("static ");
            if let Some(paren_pos) = clean.find('(') {
                let method_name = clean[..paren_pos].trim();
                // Valid identifier check
                if !method_name.is_empty() && method_name.chars().all(|c| c.is_alphanumeric() || c == '_') && method_name != "constructor" {
                    symbols.push(Symbol {
                        id: Symbol::generate_id(file_path, &SymbolKind::Method, method_name, line_num),
                        name: method_name.to_string(),
                        kind: SymbolKind::Method,
                        file_path: file_path.to_string(),
                        line_start: line_num,
                        line_end: line_num,
                        signature: trimmed.to_string(),
                        parent_id: current_class.clone(),
                    });
                }
            }
        }

        // 6. Standalone Functions & Arrow Functions
        if trimmed.contains("function ") || (trimmed.contains(" = ") && (trimmed.contains("=>") || trimmed.contains("function"))) {
            let mut fn_name = "";
            let is_fn = trimmed.contains("function ");
            let parts: Vec<&str> = trimmed.split_whitespace().collect();

            if is_fn {
                for (p_idx, p) in parts.iter().enumerate() {
                    if *p == "function" && p_idx + 1 < parts.len() {
                        fn_name = parts[p_idx + 1].split('(').next().unwrap_or("");
                        break;
                    }
                }
            } else {
                for (p_idx, p) in parts.iter().enumerate() {
                    if *p == "const" || *p == "let" || *p == "var" {
                        if p_idx + 1 < parts.len() {
                            fn_name = parts[p_idx + 1].split(':').next().unwrap_or("");
                        }
                        break;
                    }
                }
            }

            let fn_name = fn_name.trim_matches(|c| c == '(' || c == ':' || c == '=' || c == ';');
            if !fn_name.is_empty() && fn_name != "function" && current_class.is_none() {
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

                if trimmed.contains("export") {
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: fn_name.to_string(),
                        line: line_num,
                    });
                }
            }
        }

        // 7. Basic Call detection
        if let Some(paren_idx) = trimmed.find('(') {
            let before = trimmed[..paren_idx].trim();
            if let Some(word) = before.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '.').last() {
                if !word.is_empty() && word != "if" && word != "for" && word != "while" && word != "switch" && word != "function" {
                    calls.push(CallEdge {
                        caller_name: current_class.clone().unwrap_or_else(|| "global".to_string()),
                        callee_name: word.to_string(),
                        line: line_num,
                    });
                }
            }
        }
    }
}
