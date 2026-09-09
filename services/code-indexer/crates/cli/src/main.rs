use knovra_core::{index_repository, storage, IndexerHealth};
use std::env;
use std::path::Path;
use std::time::Instant;

const VERSION: &str = "0.1.0";

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        print_usage();
        return;
    }

    let command = &args[1];
    match command.as_str() {
        "scan" => {
            let target_dir = if args.len() > 2 { &args[2] } else { "." };
            run_scan(target_dir);
        }
        "symbols" => {
            if args.len() < 3 {
                eprintln!("Error: 'symbols' requires a file path argument. Example: knovra-indexer symbols src/main.rs");
                std::process::exit(1);
            }
            run_symbols(&args[2]);
        }
        "query" => {
            if args.len() < 3 {
                eprintln!("Error: 'query' requires a symbol name argument. Example: knovra-indexer query AuthController");
                std::process::exit(1);
            }
            run_query(&args[2]);
        }
        "graph" => {
            let target_dir = if args.len() > 2 { &args[2] } else { "." };
            run_graph(target_dir);
        }
        "incremental" => {
            let target_dir = if args.len() > 2 { &args[2] } else { "." };
            let files: Vec<&str> = if args.len() > 3 {
                args[3].split(',').collect()
            } else {
                Vec::new()
            };
            run_incremental(target_dir, &files);
        }
        "impact" => {
            if args.len() < 3 {
                eprintln!("Error: 'impact' requires a target (file path or symbol name). Example: knovra-indexer impact fs_watcher.go");
                std::process::exit(1);
            }
            let target = &args[2];
            let root_dir = if args.len() > 3 { &args[3] } else { "." };
            run_impact(target, root_dir);
        }
        "health" => {
            let health = IndexerHealth::new();
            println!("{}", health.to_json());
        }
        "version" | "--version" | "-v" => {
            println!("knovra-indexer version {VERSION}");
        }
        "help" | "--help" | "-h" => {
            print_usage();
        }
        _ => {
            eprintln!("Unknown command: {command}\n");
            print_usage();
            std::process::exit(1);
        }
    }
}

fn print_usage() {
    println!("Knovra Code Intelligence & Indexing Engine (Phase 03)");
    println!("\nUsage:");
    println!("  knovra-indexer <command> [arguments]");
    println!("\nCommands:");
    println!("  scan [path]         Index repository code AST, symbols and save .knovra/code_index.json");
    println!("  incremental [path] [f1,f2] Update only specified files in .knovra/code_index.json");
    println!("  impact <target>     Perform reverse dependency & caller impact lookup for file or symbol");
    println!("  symbols <file>      List all extracted symbols in a specific source file");
    println!("  query <name>        Search for symbols matching name across the indexed project");
    println!("  graph [path]        Display discovered import and call dependency edges");
    println!("  health              Emit JSON service health probe");
    println!("  version             Show version");
    println!("  help                Show this help message");
}

fn run_scan(target: &str) {
    let root = Path::new(target);
    println!("Scanning repository for code symbols: {}...", root.display());

    let start = Instant::now();
    let index = index_repository(root);
    let duration = start.elapsed();

    // Save to .knovra/code_index.json
    if let Err(e) = storage::save_project_index(root, &index) {
        eprintln!("Warning: Failed to save code_index.json: {e}");
    } else {
        println!("✓ Saved index to .knovra/code_index.json");
    }

    println!("\n======================================================================");
    println!("  KNOVRA CODE INTELLIGENCE SUMMARY");
    println!("======================================================================");
    println!("• Root Directory:       {}", index.root_path);
    println!("• Total Files Parsed:   {}", index.files.len());
    println!("• Total Symbols Found:  {}", index.total_symbols);
    println!("• Dependency Edges:     {}", index.dependency_edges.len());
    println!("• Indexing Latency:     {:.2?}", duration);

    println!("\n--- Language Breakdown ---");
    let mut lang_counts = std::collections::HashMap::new();
    let mut lang_symbols = std::collections::HashMap::new();
    for f in &index.files {
        *lang_counts.entry(f.language.clone()).or_insert(0) += 1;
        *lang_symbols.entry(f.language.clone()).or_insert(0) += f.symbols.len();
    }

    for (lang, count) in lang_counts {
        let syms = lang_symbols.get(&lang).unwrap_or(&0);
        println!("  - {:<14} {:>3} files  ({:>3} symbols)", lang, count, syms);
    }
    println!("======================================================================\n");
}

fn run_symbols(file_path: &str) {
    let path = Path::new(file_path);
    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error reading {file_path}: {e}");
            std::process::exit(1);
        }
    };

    let lang = knovra_core::scanner::detect_file_language(path).unwrap_or("unknown");
    let hash = knovra_core::scanner::compute_sha256(content.as_bytes());
    let file_index = knovra_core::parser::parse_file(file_path, &content, lang, &hash);

    println!("\nSymbols in {file_path} (Language: {lang}):");
    println!("{:-<70}", "");
    println!("{:<24} {:<12} {:<10} {}", "NAME", "KIND", "LINES", "SIGNATURE");
    println!("{:-<70}", "");

    for s in &file_index.symbols {
        let line_range = format!("{}-{}", s.line_start, s.line_end);
        let sig = if s.signature.len() > 30 {
            format!("{}...", &s.signature[..27])
        } else {
            s.signature.clone()
        };
        println!("{:<24} {:<12} {:<10} {}", s.name, s.kind.as_str(), line_range, sig);
    }
    println!("{:-<70}\n", "");
}

fn run_query(symbol_name: &str) {
    let index = index_repository(Path::new("."));
    println!("\nSearching for symbol '{symbol_name}' across project...");
    let mut found = 0;

    for f in &index.files {
        for s in &f.symbols {
            if s.name.to_lowercase().contains(&symbol_name.to_lowercase()) {
                found += 1;
                println!(
                    "  [{}] {} (lines {}-{}) in {}",
                    s.kind.as_str(),
                    s.name,
                    s.line_start,
                    s.line_end,
                    f.file_path
                );
            }
        }
    }

    if found == 0 {
        println!("  No symbols matching '{symbol_name}' were found.");
    } else {
        println!("\nFound {found} matching symbols.\n");
    }
}

fn run_graph(target: &str) {
    let index = index_repository(Path::new(target));
    println!("\nDiscovered Dependency Graph (Total Edges: {}):", index.dependency_edges.len());
    println!("{:-<70}", "");

    for edge in &index.dependency_edges {
        println!("  {:<35} --[{}]--> {}", edge.from_file, edge.edge_type, edge.to_file_or_module);
    }
    println!("{:-<70}\n", "");
}

fn run_incremental(target: &str, changed_files: &[&str]) {
    let root = Path::new(target);
    println!("Incrementally updating index for {}...", root.display());
    let start = Instant::now();

    let existing = index_repository(root);
    let (updated, delta) = knovra_core::index_incremental(root, changed_files, &existing);
    let duration = start.elapsed();

    if let Err(e) = storage::save_project_index(root, &updated) {
        eprintln!("Warning: Failed to save code_index.json: {e}");
    } else {
        println!("✓ Updated index saved to .knovra/code_index.json");
    }

    println!("\n======================================================================");
    println!("  KNOVRA INCREMENTAL INDEXING SUMMARY");
    println!("======================================================================");
    println!("• Modified Files:         {}", delta.modified_files.len());
    println!("• Added Files:            {}", delta.added_files.len());
    println!("• Deleted Files:          {}", delta.deleted_files.len());
    println!("• Changed Symbols:        {}", delta.changed_symbols.len());
    println!("• Total Symbols:          {} -> {}", delta.total_symbols_before, delta.total_symbols_after);
    println!("• Invalidated Dependents: {}", delta.invalidated_dependencies.len());
    println!("• Latency:                {:.2?}", duration);
}

fn run_impact(target: &str, root_dir: &str) {
    let root = Path::new(root_dir);
    println!("Analyzing impact for target: '{target}' in {}...", root.display());
    let start = Instant::now();
    let index = index_repository(root);

    let norm_target = target.replace('\\', "/");
    let mut direct_callers = Vec::new();
    let mut direct_importers = Vec::new();
    let mut related_tests = Vec::new();

    // 1. Direct callers & reverse dependencies
    for f in &index.files {
        let fpath = f.file_path.replace('\\', "/");
        let is_test = fpath.ends_with("_test.go") || fpath.contains("test_") || fpath.ends_with("_test.rs") || fpath.contains("/tests/");

        // Check if file calls the target symbol
        for c in &f.calls {
            if c.callee_name.eq_ignore_ascii_case(target) || c.callee_name.contains(target) {
                direct_callers.push(format!("{} -> {} (line {})", f.file_path, c.caller_name, c.line));
            }
        }

        // Check if file imports target
        for imp in &f.imports {
            if imp.module_path.contains(&norm_target) || imp.imported_symbol.eq_ignore_ascii_case(target) {
                if is_test {
                    related_tests.push(f.file_path.clone());
                } else {
                    direct_importers.push(f.file_path.clone());
                }
            }
        }
    }

    // 2. Check dependency edges for reverse links
    for edge in &index.dependency_edges {
        let to_norm = edge.to_file_or_module.replace('\\', "/");
        if to_norm.contains(&norm_target) && edge.from_file != norm_target {
            let from_norm = edge.from_file.replace('\\', "/");
            let is_test = from_norm.ends_with("_test.go") || from_norm.contains("test_") || from_norm.ends_with("_test.rs") || from_norm.contains("/tests/");
            if is_test {
                if !related_tests.contains(&edge.from_file) {
                    related_tests.push(edge.from_file.clone());
                }
            } else if !direct_importers.contains(&edge.from_file) {
                direct_importers.push(edge.from_file.clone());
            }
        }
    }

    // 3. Find direct unit test for target file
    let base_name = Path::new(target).file_stem().and_then(|s| s.to_str()).unwrap_or(target);
    for f in &index.files {
        let fpath = f.file_path.replace('\\', "/");
        if (fpath.contains(base_name) && (fpath.ends_with("_test.go") || fpath.contains("test_") || fpath.ends_with("_test.rs"))) && !related_tests.contains(&f.file_path) {
            related_tests.push(f.file_path.clone());
        }
    }

    let duration = start.elapsed();

    println!("\n======================================================================");
    println!("  KNOVRA CODE INTELLIGENCE: IMPACT ANALYSIS");
    println!("======================================================================");
    println!("Target:               {target}");
    println!("Analysis Duration:    {:.2?}", duration);
    println!("\n[DIRECT IMPORTERS / DEPENDENTS] (Count: {})", direct_importers.len());
    if direct_importers.is_empty() {
        println!("  None found.");
    } else {
        for imp in &direct_importers {
            println!("  • {imp}");
        }
    }

    println!("\n[DIRECT CALLERS] (Count: {})", direct_callers.len());
    if direct_callers.is_empty() {
        println!("  None found.");
    } else {
        for call in &direct_callers {
            println!("  • {call}");
        }
    }

    println!("\n[RECOMMENDED TESTS TO RUN] (Count: {})", related_tests.len());
    if related_tests.is_empty() {
        println!("  None detected.");
    } else {
        for t in &related_tests {
            println!("  ✓ {t}");
        }
    }
    println!("======================================================================\n");
}


