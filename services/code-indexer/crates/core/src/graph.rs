use crate::models::{DependencyEdge, FileIndex, ProjectIndex};
use std::collections::HashMap;

pub fn build_project_index(root_path: &str, files: Vec<FileIndex>, indexed_at_secs: u64) -> ProjectIndex {
    let mut dependency_edges = Vec::new();
    let mut total_symbols = 0;

    // Map symbol names to files that define/export them
    let mut symbol_to_files: HashMap<String, Vec<String>> = HashMap::new();

    for file in &files {
        total_symbols += file.symbols.len();

        for sym in &file.symbols {
            symbol_to_files
                .entry(sym.name.clone())
                .or_default()
                .push(file.file_path.clone());
        }

        // 1. Import edges
        for imp in &file.imports {
            dependency_edges.push(DependencyEdge {
                from_file: file.file_path.clone(),
                to_file_or_module: imp.module_path.clone(),
                edge_type: "IMPORTS".to_string(),
            });
        }

        // 2. Call edges (connect caller file to callee target file if known)
        for call in &file.calls {
            if let Some(target_files) = symbol_to_files.get(&call.callee_name) {
                for target in target_files {
                    if target != &file.file_path {
                        dependency_edges.push(DependencyEdge {
                            from_file: file.file_path.clone(),
                            to_file_or_module: target.clone(),
                            edge_type: "CALLS".to_string(),
                        });
                    }
                }
            }
        }
    }

    // Deduplicate edges
    dependency_edges.sort_by(|a, b| {
        a.from_file
            .cmp(&b.from_file)
            .then(a.to_file_or_module.cmp(&b.to_file_or_module))
            .then(a.edge_type.cmp(&b.edge_type))
    });
    dependency_edges.dedup();

    ProjectIndex {
        root_path: root_path.to_string(),
        files,
        total_symbols,
        dependency_edges,
        indexed_at_secs,
    }
}
