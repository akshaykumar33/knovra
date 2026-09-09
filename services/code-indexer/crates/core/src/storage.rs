use crate::models::ProjectIndex;
use std::fs;
use std::path::Path;

pub fn serialize_project_index_json(index: &ProjectIndex) -> String {
    let mut files_json = Vec::new();

    for f in &index.files {
        let mut symbols_json = Vec::new();
        for s in &f.symbols {
            symbols_json.push(format!(
                "{{\"id\":\"{}\",\"name\":\"{}\",\"kind\":\"{}\",\"line_start\":{},\"line_end\":{},\"signature\":\"{}\"}}",
                escape_json(&s.id),
                escape_json(&s.name),
                s.kind.as_str(),
                s.line_start,
                s.line_end,
                escape_json(&s.signature)
            ));
        }

        let mut imports_json = Vec::new();
        for i in &f.imports {
            imports_json.push(format!(
                "{{\"symbol\":\"{}\",\"module\":\"{}\",\"line\":{}}}",
                escape_json(&i.imported_symbol),
                escape_json(&i.module_path),
                i.line
            ));
        }

        let mut exports_json = Vec::new();
        for e in &f.exports {
            exports_json.push(format!(
                "{{\"symbol\":\"{}\",\"line\":{}}}",
                escape_json(&e.symbol_name),
                e.line
            ));
        }

        let mut calls_json = Vec::new();
        for c in &f.calls {
            calls_json.push(format!(
                "{{\"caller\":\"{}\",\"callee\":\"{}\",\"line\":{}}}",
                escape_json(&c.caller_name),
                escape_json(&c.callee_name),
                c.line
            ));
        }

        files_json.push(format!(
            "{{\"file_path\":\"{}\",\"language\":\"{}\",\"content_hash\":\"{}\",\"symbols\":[{}],\"imports\":[{}],\"exports\":[{}],\"calls\":[{}]}}",
            escape_json(&f.file_path),
            escape_json(&f.language),
            escape_json(&f.content_hash),
            symbols_json.join(","),
            imports_json.join(","),
            exports_json.join(","),
            calls_json.join(",")
        ));
    }

    let mut edges_json = Vec::new();
    for edge in &index.dependency_edges {
        edges_json.push(format!(
            "{{\"from\":\"{}\",\"to\":\"{}\",\"type\":\"{}\"}}",
            escape_json(&edge.from_file),
            escape_json(&edge.to_file_or_module),
            escape_json(&edge.edge_type)
        ));
    }

    format!(
        "{{\"root_path\":\"{}\",\"total_symbols\":{},\"indexed_at\":{},\"files\":[{}],\"dependency_edges\":[{}]}}",
        escape_json(&index.root_path),
        index.total_symbols,
        index.indexed_at_secs,
        files_json.join(","),
        edges_json.join(",")
    )
}

pub fn save_project_index(dir: &Path, index: &ProjectIndex) -> std::io::Result<()> {
    let knovra_dir = dir.join(".knovra");
    if !knovra_dir.exists() {
        fs::create_dir_all(&knovra_dir)?;
    }
    let target = knovra_dir.join("code_index.json");
    let json = serialize_project_index_json(index);
    fs::write(target, json)
}

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', " ")
        .replace('\r', "")
        .replace('\t', " ")
}
