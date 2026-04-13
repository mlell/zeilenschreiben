use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionFileData {
    pub code: String,
    pub time_limit: Option<u32>,
    pub lines: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct Frontmatter {
    code: String,
    #[serde(rename = "timeLimit")]
    time_limit: Option<u32>,
}

/// Get the sessions directory path (executable dir + /sessions)
fn get_sessions_dir() -> Result<PathBuf, String> {
    let exe_dir = std::env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?
        .parent()
        .ok_or("Failed to get executable directory")?
        .to_path_buf();

    let sessions_dir = exe_dir.join("sessions");

    if !sessions_dir.exists() {
        fs::create_dir_all(&sessions_dir)
            .map_err(|e| format!("Failed to create sessions directory: {}", e))?;
    }

    Ok(sessions_dir)
}

/// Validate session code format (6 alphanumeric characters)
fn validate_code(code: &str) -> Result<(), String> {
    if code.len() != 6 {
        return Err(format!(
            "Code must be exactly 6 characters, got {}",
            code.len()
        ));
    }

    if !code.chars().all(|c| c.is_ascii_alphanumeric()) {
        return Err("Code must contain only alphanumeric characters".to_string());
    }

    Ok(())
}

/// Find session file by code (case-insensitive)
fn find_session_file(sessions_dir: &PathBuf, code: &str) -> Result<PathBuf, String> {
    let code_upper = code.to_uppercase();

    for entry in WalkDir::new(sessions_dir)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file() {
            if let Some(stem) = path.file_stem() {
                if stem.to_string_lossy().to_uppercase() == code_upper {
                    return Ok(path.to_path_buf());
                }
            }
        }
    }

    Err(format!("Session file not found for code: {}", code))
}

/// Parse markdown file with YAML frontmatter
fn parse_session_file(content: &str, expected_code: &str) -> Result<SessionFileData, String> {
    let parts: Vec<&str> = content.split("---").collect();

    if parts.len() < 3 {
        return Err("Invalid file format: missing frontmatter delimiters".to_string());
    }

    let frontmatter_str = parts[1].trim();
    let frontmatter: Frontmatter = serde_yaml::from_str(frontmatter_str)
        .map_err(|e| format!("Failed to parse frontmatter: {}", e))?;

    if frontmatter.code.to_uppercase() != expected_code.to_uppercase() {
        return Err(format!(
            "Code mismatch: file contains '{}' but expected '{}'",
            frontmatter.code, expected_code
        ));
    }

    let content_text = parts[2..].join("---").trim().to_string();
    let lines: Vec<String> = content_text.lines().map(|s| s.to_string()).collect();

    if lines.is_empty() {
        return Err("Session file must contain at least one line of text".to_string());
    }

    Ok(SessionFileData {
        code: frontmatter.code,
        time_limit: frontmatter.time_limit,
        lines,
    })
}

#[tauri::command]
pub fn read_session_file(code: String) -> Result<SessionFileData, String> {
    validate_code(&code)?;

    let sessions_dir = get_sessions_dir()?;
    let file_path = find_session_file(&sessions_dir, &code)?;

    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;

    parse_session_file(&content, &code)
}

#[tauri::command]
pub fn get_sessions_directory() -> Result<String, String> {
    let sessions_dir = get_sessions_dir()?;
    Ok(sessions_dir.to_string_lossy().to_string())
}
