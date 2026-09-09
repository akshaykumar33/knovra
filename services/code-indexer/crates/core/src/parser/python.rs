use crate::models::{CallEdge, ExportRecord, ImportRecord, Symbol, SymbolKind};

pub fn parse_python(
    file_path: &str,
    content: &str,
    symbols: &mut Vec<Symbol>,
    imports: &mut Vec<ImportRecord>,
    exports: &mut Vec<ExportRecord>,
    calls: &mut Vec<CallEdge>,
) {
    let mut current_class: Option<String> = None;
    let mut class_indent = 0;

    for (idx, line) in content.lines().enumerate() {
        let line_num = idx + 1;
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let indent = line.len() - line.trim_start().len();

        // If indent drops below or equal to class_indent, reset class context
        if current_class.is_some() && indent <= class_indent && !trimmed.starts_with("def ") && !trimmed.starts_with("async def ") {
            current_class = None;
        }

        // 1. Imports
        if trimmed.starts_with("import ") {
            let mod_name = trimmed.trim_start_matches("import ").trim();
            imports.push(ImportRecord {
                source_file: file_path.to_string(),
                imported_symbol: mod_name.to_string(),
                module_path: mod_name.to_string(),
                line: line_num,
            });
            continue;
        }
        if trimmed.starts_with("from ") {
            if let Some(import_idx) = trimmed.find(" import ") {
                let mod_name = trimmed[5..import_idx].trim();
                let sym_name = trimmed[import_idx + 8..].trim();
                imports.push(ImportRecord {
                    source_file: file_path.to_string(),
                    imported_symbol: sym_name.to_string(),
                    module_path: mod_name.to_string(),
                    line: line_num,
                });
            }
            continue;
        }

        // 2. Class definitions
        if trimmed.starts_with("class ") {
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() > 1 {
                let class_name = parts[1].split('(').next().unwrap_or("").trim_matches(':');
                if !class_name.is_empty() {
                    current_class = Some(class_name.to_string());
                    class_indent = indent;
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
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: class_name.to_string(),
                        line: line_num,
                    });
                }
            }
            continue;
        }

        // 3. Functions and methods
        if trimmed.starts_with("def ") || trimmed.starts_with("async def ") {
            let def_part = if trimmed.starts_with("async def ") {
                &trimmed[10..]
            } else {
                &trimmed[4..]
            };
            let fn_name = def_part.split('(').next().unwrap_or("").trim();
            if !fn_name.is_empty() {
                // If indent is strictly greater than class_indent, it is a method inside current_class
                let (kind, parent) = if current_class.is_some() && indent > class_indent {
                    (SymbolKind::Method, current_class.clone())
                } else {
                    current_class = None;
                    (SymbolKind::Function, None)
                };

                symbols.push(Symbol {
                    id: Symbol::generate_id(file_path, &kind, fn_name, line_num),
                    name: fn_name.to_string(),
                    kind,
                    file_path: file_path.to_string(),
                    line_start: line_num,
                    line_end: line_num,
                    signature: trimmed.to_string(),
                    parent_id: parent,
                });

                if !fn_name.starts_with('_') {
                    exports.push(ExportRecord {
                        source_file: file_path.to_string(),
                        symbol_name: fn_name.to_string(),
                        line: line_num,
                    });
                }
            }
        }

        // 4. Calls
        if let Some(paren_idx) = trimmed.find('(') {
            let before = trimmed[..paren_idx].trim();
            if let Some(word) = before.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '.').last() {
                if !word.is_empty() && word != "if" && word != "while" && word != "for" && word != "def" && word != "class" {
                    calls.push(CallEdge {
                        caller_name: current_class.clone().unwrap_or_else(|| "module".to_string()),
                        callee_name: word.to_string(),
                        line: line_num,
                    });
                }
            }
        }
    }
}
