#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SymbolKind {
    Function,
    Method,
    Class,
    Interface,
    TypeAlias,
    Struct,
    Enum,
    Trait,
    Module,
}

impl SymbolKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            SymbolKind::Function => "function",
            SymbolKind::Method => "method",
            SymbolKind::Class => "class",
            SymbolKind::Interface => "interface",
            SymbolKind::TypeAlias => "type_alias",
            SymbolKind::Struct => "struct",
            SymbolKind::Enum => "enum",
            SymbolKind::Trait => "trait",
            SymbolKind::Module => "module",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Symbol {
    pub id: String,
    pub name: String,
    pub kind: SymbolKind,
    pub file_path: String,
    pub line_start: usize,
    pub line_end: usize,
    pub signature: String,
    pub parent_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ImportRecord {
    pub source_file: String,
    pub imported_symbol: String,
    pub module_path: String,
    pub line: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExportRecord {
    pub source_file: String,
    pub symbol_name: String,
    pub line: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CallEdge {
    pub caller_name: String,
    pub callee_name: String,
    pub line: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileIndex {
    pub file_path: String,
    pub content_hash: String,
    pub language: String,
    pub symbols: Vec<Symbol>,
    pub imports: Vec<ImportRecord>,
    pub exports: Vec<ExportRecord>,
    pub calls: Vec<CallEdge>,
    pub parse_errors: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DependencyEdge {
    pub from_file: String,
    pub to_file_or_module: String,
    pub edge_type: String, // "IMPORTS", "CALLS"
}

#[derive(Debug, Clone)]
pub struct ProjectIndex {
    pub root_path: String,
    pub files: Vec<FileIndex>,
    pub total_symbols: usize,
    pub dependency_edges: Vec<DependencyEdge>,
    pub indexed_at_secs: u64,
}

impl Symbol {
    pub fn generate_id(file_path: &str, kind: &SymbolKind, name: &str, line_start: usize) -> String {
        format!("sym::{file_path}::{line_start}::{}::{name}", kind.as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ChangeKind {
    Added,
    Modified,
    Deleted,
}

impl ChangeKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            ChangeKind::Added => "added",
            ChangeKind::Modified => "modified",
            ChangeKind::Deleted => "deleted",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChangedSymbol {
    pub symbol_id: String,
    pub symbol_name: String,
    pub kind: SymbolKind,
    pub file_path: String,
    pub change_kind: ChangeKind,
    pub old_signature: Option<String>,
    pub new_signature: Option<String>,
    pub line_start: usize,
    pub line_end: usize,
}

#[derive(Debug, Clone, Default)]
pub struct IncrementalDelta {
    pub modified_files: Vec<String>,
    pub added_files: Vec<String>,
    pub deleted_files: Vec<String>,
    pub changed_symbols: Vec<ChangedSymbol>,
    pub invalidated_dependencies: Vec<String>,
    pub total_symbols_before: usize,
    pub total_symbols_after: usize,
}

