# Tauri Desktop Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tauri desktop application support with file-based sessions while maintaining existing web deployment.

**Architecture:** Dual-mode design with environment-aware connection layer. Web mode uses PostgrestConnection → PostgREST backend. Desktop mode uses FileSystemConnection → markdown files via Tauri Rust commands. Svelte context API for dependency injection.

**Tech Stack:** Tauri 2.x, Rust (serde, serde_yaml, walkdir), TypeScript, Svelte 5

---

## File Structure

### New Files
- `src/connections/FileSystemConnection.ts` - Desktop mode connection implementation
- `src/connections/connectionContext.ts` - Svelte context for DI
- `src/connections/connectionFactory.ts` - Environment-based connection selection
- `src-tauri/src/main.rs` - Tauri Rust backend entry point
- `src-tauri/src/commands.rs` - Filesystem command implementations
- `src-tauri/Cargo.toml` - Rust dependencies
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/build.rs` - Tauri build script
- `sessions/README.md` - Instructions for teachers
- `sessions/EXAMPLE.md` - Example session file
- `src/connections/FileSystemConnection.test.ts` - Unit tests

### Modified Files
- `src/connections/index.ts` - Export new factory and context utilities
- `src/main.ts` - Use factory and set context
- `package.json` - Add Tauri scripts and dependencies
- `.gitignore` - Ignore Tauri build artifacts

---

## Task 1: Install Tauri CLI and Initialize Project

**Files:**
- Modify: `package.json`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/build.rs`

- [ ] **Step 1: Install Tauri CLI as dev dependency**

```bash
npm install --save-dev @tauri-apps/cli@^2.0.0
```

Expected: Package added to devDependencies

- [ ] **Step 2: Add Tauri scripts to package.json**

Add to scripts section:
```json
"tauri:dev": "tauri dev",
"tauri:build": "tauri build"
```

- [ ] **Step 3: Initialize Tauri project**

```bash
npm run tauri init
```

When prompted:
- App name: `Zeilenschreiben`
- Window title: `Zeilenschreiben`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:5173`
- Frontend dev command: `npm run dev`
- Frontend build command: `npm run build`

Expected: Creates `src-tauri/` directory with initial files

- [ ] **Step 4: Verify Tauri configuration**

Check that `src-tauri/tauri.conf.json` was created with correct paths.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src-tauri/
git commit -m "chore: initialize Tauri project"
```

---

## Task 2: Configure Tauri for Desktop Deployment

**Files:**
- Modify: `src-tauri/tauri.conf.json`
- Modify: `src-tauri/Cargo.toml`
- Modify: `.gitignore`

- [ ] **Step 1: Update Tauri configuration**

Replace `src-tauri/tauri.conf.json` content:
```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "de.zeilenschreiben.app",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "resources": ["sessions/"]
  },
  "productName": "Zeilenschreiben",
  "version": "1.0.0",
  "identifier": "de.zeilenschreiben.app",
  "plugins": {},
  "app": {
    "windows": [
      {
        "title": "Zeilenschreiben",
        "width": 1024,
        "height": 768,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  }
}
```

- [ ] **Step 2: Add Rust dependencies to Cargo.toml**

Add to `[dependencies]` section in `src-tauri/Cargo.toml`:
```toml
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"
walkdir = "2.5"
```

- [ ] **Step 3: Update .gitignore**

Add to `.gitignore`:
```
# Tauri
src-tauri/target/
src-tauri/WixTools/
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/tauri.conf.json src-tauri/Cargo.toml .gitignore
git commit -m "chore: configure Tauri for desktop deployment"
```

---

## Task 3: Create Rust Backend Commands

**Files:**
- Create: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create commands module**

Create `src-tauri/src/commands.rs`:
```rust
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
        return Err(format!("Code must be exactly 6 characters, got {}", code.len()));
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
    
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    parse_session_file(&content, &code)
}

#[tauri::command]
pub fn get_sessions_directory() -> Result<String, String> {
    let sessions_dir = get_sessions_dir()?;
    Ok(sessions_dir.to_string_lossy().to_string())
}
```

- [ ] **Step 2: Update main.rs to register commands**

Replace `src-tauri/src/main.rs` content:
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::{read_session_file, get_sessions_directory};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_session_file,
            get_sessions_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Verify Rust code compiles**

```bash
cd src-tauri && cargo check
```

Expected: No compilation errors

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/
git commit -m "feat(tauri): add Rust commands for session file reading"
```

---

## Task 4: Create FileSystemConnection Implementation

**Files:**
- Create: `src/connections/FileSystemConnection.ts`

- [ ] **Step 1: Write failing test**

Create `src/connections/FileSystemConnection.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemConnection } from './FileSystemConnection';
import type { TypingSession } from './Connection';

// Mock Tauri invoke
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

describe('FileSystemConnection', () => {
  let connection: FileSystemConnection;

  beforeEach(() => {
    connection = new FileSystemConnection();
    vi.clearAllMocks();
  });

  describe('getSessionByCode', () => {
    it('should load session from file and transform to TypingSession', async () => {
      const mockFileData = {
        code: 'ABC123',
        time_limit: 300,
        lines: ['Line 1', 'Line 2', 'Line 3'],
      };

      mockInvoke.mockResolvedValue(mockFileData);

      const result = await connection.getSessionByCode('ABC123');

      expect(mockInvoke).toHaveBeenCalledWith('read_session_file', { code: 'ABC123' });
      expect(result).toEqual({
        id: 'ABC123',
        code: 'ABC123',
        text: 'Line 1\nLine 2\nLine 3',
        created_at: expect.any(String),
        time_limit_seconds: 300,
      });
    });

    it('should handle session without time limit', async () => {
      const mockFileData = {
        code: 'XYZ789',
        time_limit: null,
        lines: ['Single line'],
      };

      mockInvoke.mockResolvedValue(mockFileData);

      const result = await connection.getSessionByCode('XYZ789');

      expect(result?.time_limit_seconds).toBeNull();
    });

    it('should return null when session file not found', async () => {
      mockInvoke.mockRejectedValue(new Error('Session file not found for code: NOTFOUND'));

      const result = await connection.getSessionByCode('NOTFOUND');

      expect(result).toBeNull();
    });

    it('should throw error for invalid frontmatter', async () => {
      mockInvoke.mockRejectedValue(new Error('Failed to parse frontmatter: invalid YAML'));

      await expect(connection.getSessionByCode('BAD123')).rejects.toThrow('Failed to parse frontmatter');
    });
  });

  describe('saveStudentResult', () => {
    it('should be a no-op and return result object', async () => {
      const result = await connection.saveStudentResult(
        'session-id',
        'Student Name',
        'typed text',
        5,
        2,
        71.4
      );

      expect(result).toEqual({
        id: expect.any(String),
        session_id: 'session-id',
        student_name: 'Student Name',
        typed_text: 'typed text',
        success_count: 5,
        failure_count: 2,
        accuracy: 71.4,
        completed_at: expect.any(String),
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should throw error as not supported in desktop mode', async () => {
      await expect(connection.createSession('text', 300)).rejects.toThrow(
        'Session creation not supported in desktop mode'
      );
    });
  });

  describe('getSessionResults', () => {
    it('should return empty array as not supported in desktop mode', async () => {
      const results = await connection.getSessionResults('session-id');
      expect(results).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/connections/FileSystemConnection.test.ts
```

Expected: FAIL with "Cannot find module './FileSystemConnection'"

- [ ] **Step 3: Create FileSystemConnection implementation**

Create `src/connections/FileSystemConnection.ts`:
```typescript
/**
 * FileSystemConnection.ts - Desktop mode connection implementation.
 * Loads typing sessions from markdown files via Tauri filesystem commands.
 * Does not support session creation or result persistence (desktop is student-only).
 */

import { invoke } from '@tauri-apps/api/core';
import type { Connection, TypingSession, StudentResult } from './Connection';

interface SessionFileData {
  code: string;
  time_limit: number | null;
  lines: string[];
}

export class FileSystemConnection implements Connection {
  /**
   * Load session from markdown file by code.
   * @param code - 6-character session code
   * @returns Session object or null if not found
   */
  async getSessionByCode(code: string): Promise<TypingSession | null> {
    try {
      const fileData = await invoke<SessionFileData>('read_session_file', { code });

      return {
        id: fileData.code,
        code: fileData.code,
        text: fileData.lines.join('\n'),
        created_at: new Date().toISOString(),
        time_limit_seconds: fileData.time_limit,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * No-op implementation for desktop mode.
   * Results are displayed but not persisted.
   */
  async saveStudentResult(
    sessionId: string,
    studentName: string,
    typedText: string,
    successCount: number,
    failureCount: number,
    accuracy: number
  ): Promise<StudentResult> {
    return {
      id: crypto.randomUUID(),
      session_id: sessionId,
      student_name: studentName,
      typed_text: typedText,
      success_count: successCount,
      failure_count: failureCount,
      accuracy,
      completed_at: new Date().toISOString(),
    };
  }

  /**
   * Not supported in desktop mode - sessions are file-based.
   */
  async createSession(_text: string, _timeLimitSeconds: number | null): Promise<TypingSession> {
    throw new Error('Session creation not supported in desktop mode. Use markdown files instead.');
  }

  /**
   * Not supported in desktop mode - no result persistence.
   */
  async getSessionResults(_sessionId: string): Promise<StudentResult[]> {
    return [];
  }
}
```

- [ ] **Step 4: Install Tauri API package**

```bash
npm install @tauri-apps/api@^2.0.0
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- src/connections/FileSystemConnection.test.ts
```

Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/connections/FileSystemConnection.ts src/connections/FileSystemConnection.test.ts package.json package-lock.json
git commit -m "feat(connections): add FileSystemConnection for desktop mode"
```

---

## Task 5: Create Connection Context and Factory

**Files:**
- Create: `src/connections/connectionContext.ts`
- Create: `src/connections/connectionFactory.ts`

- [ ] **Step 1: Create connection context utilities**

Create `src/connections/connectionContext.ts`:
```typescript
/**
 * connectionContext.ts - Svelte context for dependency injection.
 * Provides connection instance to component tree without prop drilling.
 */

import { setContext, getContext } from 'svelte';
import type { Connection } from './Connection';

const CONNECTION_KEY = Symbol('connection');

/**
 * Set connection instance in Svelte context.
 * Call once in root component.
 */
export function setConnectionContext(connection: Connection): void {
  setContext(CONNECTION_KEY, connection);
}

/**
 * Get connection instance from Svelte context.
 * @throws Error if context not set
 */
export function getConnectionContext(): Connection {
  const connection = getContext<Connection>(CONNECTION_KEY);
  if (!connection) {
    throw new Error('Connection context not set. Call setConnectionContext() in root component.');
  }
  return connection;
}
```

- [ ] **Step 2: Create connection factory**

Create `src/connections/connectionFactory.ts`:
```typescript
/**
 * connectionFactory.ts - Environment-aware connection factory.
 * Detects runtime environment and creates appropriate connection implementation.
 */

import type { Connection } from './Connection';
import { PostgrestConnection } from './SupabaseConnection';
import { FileSystemConnection } from './FileSystemConnection';

/**
 * Detect if running in Tauri desktop environment.
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Create connection instance based on environment.
 * - Desktop (Tauri): FileSystemConnection
 * - Web: PostgrestConnection
 */
export function createConnection(postgrestUrl?: string): Connection {
  if (isTauriEnvironment()) {
    return new FileSystemConnection();
  }

  if (!postgrestUrl) {
    throw new Error('postgrestUrl required for web mode');
  }

  return new PostgrestConnection(postgrestUrl);
}
```

- [ ] **Step 3: Update connections index to export new utilities**

Modify `src/connections/index.ts`:
```typescript
/**
 * connections/index.ts - Connection factory and singleton management.
 * Provides a centralized way to access the backend connection throughout the app.
 */

export type { Connection, TypingSession, StudentResult } from './Connection';
export { PostgrestConnection } from './SupabaseConnection';
export { FileSystemConnection } from './FileSystemConnection';
export { createConnection } from './connectionFactory';
export { setConnectionContext, getConnectionContext } from './connectionContext';

import type { Connection } from './Connection';
import { PostgrestConnection } from './SupabaseConnection';

let connectionInstance: Connection | null = null;

/**
 * Initialize the connection with PostgREST API URL.
 * Must be called once at app startup before using getConnection().
 * @deprecated Use createConnection() and setConnectionContext() instead
 */
export function initConnection(postgrestUrl: string): void {
  connectionInstance = new PostgrestConnection(postgrestUrl);
}

/**
 * Get the singleton connection instance.
 * @throws Error if initConnection() hasn't been called
 * @deprecated Use getConnectionContext() instead
 */
export function getConnection(): Connection {
  if (!connectionInstance) {
    throw new Error('Connection not initialized. Call initConnection() first.');
  }
  return connectionInstance;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/connections/connectionContext.ts src/connections/connectionFactory.ts src/connections/index.ts
git commit -m "feat(connections): add context and factory for environment-aware DI"
```

---

## Task 6: Update Main Entry Point to Use Factory

**Files:**
- Modify: `src/main.ts`
- Modify: `src/App.svelte`

- [ ] **Step 1: Update main.ts to create and provide connection**

Replace `src/main.ts` content:
```typescript
import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { createConnection } from './connections';
import { config } from './config';

const connection = createConnection(config.postgrest?.url);

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {
    connection,
  },
});

export default app;
```

- [ ] **Step 2: Update App.svelte to set connection context**

Modify `src/App.svelte` script section to accept and set connection:
```typescript
<script lang="ts">
  import { onMount } from 'svelte';
  import { setConnectionContext, type Connection } from './connections';
  import { config, validateConfig } from './config';
  import Layout from './ui/components/Layout.svelte';
  import TeacherPage from './ui/pages/TeacherPage.svelte';
  import StudentForm from './ui/pages/StudentForm.svelte';

  interface Props {
    connection: Connection;
  }

  let { connection }: Props = $props();

  setConnectionContext(connection);

  type Mode = 'teacher' | 'student';
  let mode = $state<Mode>('student');

  onMount(() => {
    try {
      validateConfig();
    } catch (error) {
      console.error('Configuration error:', error);
    }
  });
</script>
```

- [ ] **Step 3: Update components to use getConnectionContext**

Modify `src/ui/pages/StudentPage.svelte` imports:
```typescript
import { getConnectionContext, type TypingSession as SessionData } from '../../connections';
import TypingSessionView from './TypingSession.svelte';

const connection = getConnectionContext();
```

Then replace all `getConnection()` calls with `connection` variable.

- [ ] **Step 4: Update TeacherPage.svelte similarly**

Modify `src/ui/pages/TeacherPage.svelte`:
```typescript
import { getConnectionContext, type TypingSession as SessionData, type StudentResult } from '../../connections';

const connection = getConnectionContext();
```

Replace all `getConnection()` calls with `connection` variable.

- [ ] **Step 5: Update TypingSession.svelte**

Modify `src/ui/pages/TypingSession.svelte`:
```typescript
import { onDestroy, onMount } from 'svelte';
import TypingArea from '../components/TypingArea.svelte';
import { getConnectionContext, type TypingSession as TypingSessionType } from '../../connections';

const connection = getConnectionContext();
```

Replace all `getConnection()` calls with `connection` variable.

- [ ] **Step 6: Update StudentForm.svelte**

Modify `src/ui/pages/StudentForm.svelte`:
```typescript
import { getConnectionContext, type TypingSession as SessionData } from '../../connections';
import Layout from '../components/Layout.svelte';
import TypingSessionView from './TypingSession.svelte';

const connection = getConnectionContext();
```

Replace all `getConnection()` calls with `connection` variable.

- [ ] **Step 7: Remove deprecated initConnection call from App.svelte**

Remove this line if it exists:
```typescript
import { initConnection } from './connections';
```

And remove any `initConnection()` calls in onMount.

- [ ] **Step 8: Run tests to verify changes**

```bash
npm test
```

Expected: All existing tests still pass

- [ ] **Step 9: Commit**

```bash
git add src/main.ts src/App.svelte src/ui/
git commit -m "refactor: use connection factory and context for DI"
```

---

## Task 7: Create Example Session Files

**Files:**
- Create: `sessions/README.md`
- Create: `sessions/EXAMPLE.md`
- Create: `sessions/HELLO1.md`

- [ ] **Step 1: Create sessions directory**

```bash
mkdir -p sessions
```

- [ ] **Step 2: Create README for teachers**

Create `sessions/README.md`:
```markdown
# Session Files

This directory contains typing practice session files for the Zeilenschreiben desktop app.

## File Format

Each session is a markdown file with YAML frontmatter:

\`\`\`markdown
---
code: ABC123
timeLimit: 300
---

First line to type
Second line to type
Third line to type
\`\`\`

## Fields

- **code** (required): 6-character alphanumeric session code (must match filename)
- **timeLimit** (optional): Time limit in seconds (omit for no time limit)

## Filename

- Pattern: `{CODE}.md` (e.g., `ABC123.md`)
- Code lookup is case-insensitive
- Code in file must match filename

## Content Rules

- Everything after the second `---` is session text
- Each line becomes one typing line
- Whitespace and formatting preserved exactly
- Empty lines are valid
- At least one line required

## Adding Sessions

1. Create a new `.md` file in this directory
2. Choose a unique 6-character code
3. Add frontmatter with code and optional timeLimit
4. Add typing lines after frontmatter
5. Students enter the code to load the session

## Examples

See `EXAMPLE.md` and `HELLO1.md` for reference.
```

- [ ] **Step 3: Create example session file**

Create `sessions/EXAMPLE.md`:
```markdown
---
code: EXAMPLE
timeLimit: 180
---

The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
Sphinx of black quartz, judge my vow.
```

- [ ] **Step 4: Create hello session file**

Create `sessions/HELLO1.md`:
```markdown
---
code: HELLO1
---

asdf jkl;
asdf jkl;
asdf jkl;
fdsa ;lkj
fdsa ;lkj
fdsa ;lkj
```

- [ ] **Step 5: Commit**

```bash
git add sessions/
git commit -m "docs: add example session files for desktop mode"
```

---

## Task 8: Test Desktop Mode Locally

**Files:**
- None (testing only)

- [ ] **Step 1: Start Tauri dev mode**

```bash
npm run tauri:dev
```

Expected: Desktop window opens with app running

- [ ] **Step 2: Verify sessions directory created**

Check that `src-tauri/target/debug/sessions/` directory exists.

- [ ] **Step 3: Copy example sessions to dev directory**

```bash
cp sessions/*.md src-tauri/target/debug/sessions/
```

- [ ] **Step 4: Test session loading**

In the desktop app:
1. Enter code "EXAMPLE"
2. Verify session loads with 4 lines
3. Verify time limit shows 180 seconds

- [ ] **Step 5: Test typing flow**

1. Type first line correctly
2. Verify it advances to next line
3. Make an error on second line
4. Verify error feedback shows

- [ ] **Step 6: Test case-insensitive lookup**

1. Enter code "example" (lowercase)
2. Verify it loads the EXAMPLE.md session

- [ ] **Step 7: Test non-existent session**

1. Enter code "NOTFOUND"
2. Verify error message shows

- [ ] **Step 8: Stop dev server**

Press Ctrl+C to stop.

---

## Task 9: Update Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/DESKTOP_DEPLOYMENT.md`

- [ ] **Step 1: Add desktop deployment section to README**

Add to `README.md` after "Production Deployment" section:
```markdown
### Desktop Deployment

Build desktop installers for offline use:

1. Build the desktop app:
   ```bash
   npm run tauri:build
   ```

2. Installers are created in `src-tauri/target/release/bundle/`:
   - Linux: `.AppImage`, `.deb`
   - Windows: `.msi`, `.exe`
   - macOS: `.dmg`, `.app`

3. Distribute installer with `sessions/` folder containing session files

4. Students place the app and sessions folder together, then run the app

See `docs/DESKTOP_DEPLOYMENT.md` for detailed instructions.
```

- [ ] **Step 2: Create detailed desktop deployment guide**

Create `docs/DESKTOP_DEPLOYMENT.md`:
```markdown
# Desktop Deployment Guide

This guide explains how to build and distribute the Zeilenschreiben desktop application.

## Overview

The desktop app runs standalone without requiring a backend server. Sessions are loaded from markdown files in a `sessions/` directory next to the application executable.

## Building the Desktop App

### Prerequisites

- Node.js 18+
- Rust toolchain (install from https://rustup.rs/)
- Platform-specific build tools:
  - **Linux**: `build-essential`, `libgtk-3-dev`, `libwebkit2gtk-4.0-dev`
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools

### Build Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the desktop app:
   ```bash
   npm run tauri:build
   ```

3. Find installers in `src-tauri/target/release/bundle/`:
   - **Linux**: `deb/` and `appimage/` folders
   - **Windows**: `msi/` and `nsis/` folders
   - **macOS**: `dmg/` and `macos/` folders

## Distribution

### Package Contents

Distribute the following to end users:

1. **Application installer** (platform-specific)
2. **sessions/** folder with example session files
3. **README** with instructions for adding sessions

### Installation Instructions for Users

**Linux:**
```bash
# AppImage
chmod +x Zeilenschreiben.AppImage
./Zeilenschreiben.AppImage

# Or install .deb
sudo dpkg -i zeilenschreiben_1.0.0_amd64.deb
```

**Windows:**
```
Run the .msi installer
```

**macOS:**
```
Open the .dmg and drag to Applications
```

### Setting Up Sessions

1. Place the `sessions/` folder next to the application executable:
   - **Linux AppImage**: Same directory as `.AppImage` file
   - **Linux installed**: `/usr/bin/sessions/` or next to executable
   - **Windows**: Same directory as `.exe`
   - **macOS**: Next to `.app` bundle

2. Add session files to the `sessions/` directory

3. Students launch the app and enter session codes

## Creating Session Files

### File Format

```markdown
---
code: ABC123
timeLimit: 300
---

Line 1 to type
Line 2 to type
Line 3 to type
```

### Guidelines

- **Filename**: `{CODE}.md` (e.g., `ABC123.md`)
- **Code**: 6 alphanumeric characters, must match filename
- **timeLimit**: Optional, in seconds
- **Content**: Each line after frontmatter is a typing line

### Example Session

Create `sessions/TYPING1.md`:
```markdown
---
code: TYPING1
timeLimit: 120
---

The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
```

Students enter "TYPING1" to load this session.

## Troubleshooting

### Sessions Directory Not Found

**Error**: "Cannot access sessions directory"

**Solution**: Create `sessions/` folder next to the application executable.

### Session File Not Found

**Error**: "Session file not found for code: ABC123"

**Solution**: 
- Verify `ABC123.md` exists in `sessions/` directory
- Check filename matches code (case-insensitive)
- Ensure file has `.md` extension

### Invalid Frontmatter

**Error**: "Failed to parse frontmatter"

**Solution**:
- Verify YAML syntax in frontmatter
- Ensure `---` delimiters are on their own lines
- Check `code` field is present and matches filename

## Development

### Running in Dev Mode

```bash
npm run tauri:dev
```

This opens the app with hot-reload enabled. Sessions are loaded from `src-tauri/target/debug/sessions/`.

### Testing Different Platforms

Use GitHub Actions or platform-specific VMs to build for other platforms.
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/DESKTOP_DEPLOYMENT.md
git commit -m "docs: add desktop deployment documentation"
```

---

## Task 10: Final Testing and Verification

**Files:**
- None (testing only)

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 2: Build web version**

```bash
npm run build
```

Expected: Build succeeds, `dist/` folder created

- [ ] **Step 3: Test web version still works**

```bash
docker compose up -d
npm run preview
```

Visit http://localhost:4173 and verify web app works.

- [ ] **Step 4: Stop Docker services**

```bash
docker compose down
```

- [ ] **Step 5: Build desktop version**

```bash
npm run tauri:build
```

Expected: Build succeeds, installers created in `src-tauri/target/release/bundle/`

- [ ] **Step 6: Test desktop installer**

Install the built application and verify:
- App launches
- Sessions directory created
- Example sessions load
- Typing flow works

- [ ] **Step 7: Create final commit**

```bash
git add -A
git commit -m "feat: complete Tauri desktop deployment integration"
```

- [ ] **Step 8: Update basic-memory wiki**

Create note about Tauri deployment in basic-memory project.

---

## Success Criteria Verification

- [ ] Desktop app launches on target platform
- [ ] Students can enter session codes
- [ ] Markdown files load correctly
- [ ] Typing practice works identically to web version
- [ ] Results display (no persistence)
- [ ] Web deployment unchanged and functional
- [ ] No code duplication between modes
- [ ] Teachers can easily add/modify session files

## Notes

- Web and desktop modes share all UI components
- Only connection layer differs between modes
- Desktop mode does not support session creation or result persistence
- Sessions directory auto-created on first launch
- Case-insensitive session code lookup
