# Tauri Desktop Deployment Design

**Date:** 2026-04-13  
**Status:** Approved  
**Author:** AI Assistant

## Overview

Add Tauri desktop application support to Zeilenschreiben while maintaining the existing web deployment. The desktop app runs standalone with file-based sessions (no backend required), while the web app continues using PostgREST.

## Requirements

- Desktop app loads typing sessions from markdown files
- Students enter session code, app looks up `{code}.md` in sessions directory
- Sessions directory located next to app executable
- No result persistence (display only)
- Maintain existing web deployment unchanged
- Share all UI and domain logic between web and desktop

## Architecture

### Dual-Mode Design

Environment-aware connection layer that switches between PostgREST (web) and filesystem (desktop) while keeping all UI and domain logic unchanged.

**Mode Detection:**
- Runtime check for `window.__TAURI__` presence
- Web mode: uses `SupabaseConnection` → PostgREST backend
- Desktop mode: uses `FileSystemConnection` → reads markdown files via Tauri

**File Structure:**
```
src/
  connections/
    Connection.ts              (existing interface)
    SupabaseConnection.ts      (existing, for web mode)
    FileSystemConnection.ts    (new, for desktop mode)
    connectionContext.ts       (new, Svelte context for DI)
src-tauri/                     (new, Tauri Rust backend)
  src/
    main.rs
    commands.rs               (filesystem commands)
  tauri.conf.json
  Cargo.toml
sessions/                      (bundled with desktop app)
  README.md                   (instructions for teachers)
  example.md                  (example session file)
```

## Markdown Session File Format

### File Naming
- Pattern: `{SESSION_CODE}.md`
- Example: `ABC123.md`
- Case-insensitive lookup (ABC123.md matches code "abc123")

### File Structure
```markdown
---
code: ABC123
timeLimit: 300
---

First line to type
Second line to type
Third line to type
```

### Frontmatter Fields
- **code** (required): Session access code, must match filename without extension
- **timeLimit** (optional): Time limit in seconds, omit for no time limit

### Content Rules
- Everything after frontmatter delimiter (`---`) is session text
- Each line becomes one typing line
- Preserve whitespace and formatting exactly
- Empty lines are valid typing lines
- At least one line of text required

### Validation Rules
- Code format: 6 alphanumeric characters (case-insensitive)
- Code in frontmatter must match filename (case-insensitive)
- TimeLimit must be positive integer if present
- File must be valid UTF-8

### Example Files

**sessions/HELLO1.md:**
```markdown
---
code: HELLO1
timeLimit: 180
---

The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
```

**sessions/BASIC2.md:**
```markdown
---
code: BASIC2
---

asdf jkl;
asdf jkl;
asdf jkl;
```

## FileSystemConnection Implementation

### Interface Compliance
Implements existing `Connection` interface from `src/connections/Connection.ts`.

### Methods

**`getSessionByCode(code: string): Promise<Session | null>`**
1. Validate code format (6 alphanumeric chars)
2. Invoke Tauri command: `invoke('read_session_file', { code })`
3. Rust backend performs case-insensitive file lookup in sessions directory
4. Parse frontmatter (YAML) and content (text lines)
5. Validate code in frontmatter matches filename
6. Transform to `Session` domain object
7. Return `Session` or `null` if not found

**`createStudentResult(result: StudentResult): Promise<void>`**
- No-op implementation (no persistence requirement)
- Could log to console for debugging
- Future: save to file if persistence added

### Error Handling
- File not found → return `null` (UI shows "Session not found")
- Invalid frontmatter → throw validation error with details
- Code mismatch → throw error "Code in file doesn't match filename"
- File read permission error → throw error "Cannot access sessions directory"
- Invalid UTF-8 → throw error "Session file is not valid UTF-8"

### Sessions Directory
- Location: `{app_executable_dir}/sessions/`
  - Linux: `/path/to/zeilenschreiben-app/sessions/`
  - Windows: `C:\path\to\zeilenschreiben-app\sessions\`
  - macOS: Adjacent to `.app` bundle
- Resolved at runtime using Tauri's path resolution APIs
- Created automatically on first launch if missing
- Bundled with example files in installer

## Tauri Backend (Rust)

### Commands

**`read_session_file(code: String) -> Result<SessionFileData, String>`**

Implementation:
1. Validate code format (6 alphanumeric chars, alphanumeric only)
2. Get sessions directory path (executable dir + `/sessions`)
3. Case-insensitive file lookup: iterate directory, compare uppercase filenames
4. Read file contents as UTF-8
5. Parse frontmatter using YAML parser
6. Validate code in frontmatter matches filename (case-insensitive)
7. Split content into lines
8. Return structured data: `SessionFileData { code, time_limit, lines }`

**`get_sessions_directory() -> Result<String, String>`**
- Returns absolute path to sessions directory
- Used for error messages and debugging
- Future: could power a "browse sessions" UI

### Data Structures

```rust
#[derive(Serialize, Deserialize)]
struct SessionFileData {
    code: String,
    time_limit: Option<u32>,
    lines: Vec<String>,
}
```

### Dependencies (Cargo.toml)
- `tauri` - Core framework
- `serde` - JSON serialization
- `serde_json` - JSON support
- `serde_yaml` - Frontmatter parsing
- `walkdir` - Directory traversal for case-insensitive lookup

### Security
- Tauri allowlist restricts filesystem access to sessions directory only
- No arbitrary file reads allowed
- Path traversal prevented by validating code format before building path
- Code validation regex: `^[A-Za-z0-9]{6}$`

## Dependency Injection via Svelte Context

### Context Setup

**`src/connections/connectionContext.ts`:**
```typescript
import { setContext, getContext } from 'svelte';
import type { Connection } from './Connection';

const CONNECTION_KEY = Symbol('connection');

export function setConnectionContext(connection: Connection) {
  setContext(CONNECTION_KEY, connection);
}

export function getConnectionContext(): Connection {
  return getContext(CONNECTION_KEY);
}
```

### Factory Function

**`src/connections/connectionFactory.ts`:**
```typescript
import type { Connection } from './Connection';
import { SupabaseConnection } from './SupabaseConnection';
import { FileSystemConnection } from './FileSystemConnection';

export function createConnection(): Connection {
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    return new FileSystemConnection();
  }
  return new SupabaseConnection();
}
```

### Usage

**In `src/main.ts`:**
```typescript
import { createConnection } from './connections/connectionFactory';
import { setConnectionContext } from './connections/connectionContext';

const connection = createConnection();

new App({
  target: document.getElementById('app')!,
  context: new Map([['connection', connection]])
});
```

**In components:**
```typescript
import { getConnectionContext } from './connections/connectionContext';

const connection = getConnectionContext();
```

### Benefits
- No prop drilling required
- Testable by providing mock in context
- Idiomatic Svelte pattern
- Single point of configuration

## Build & Deployment Configuration

### Tauri Configuration

**`src-tauri/tauri.conf.json`:**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Zeilenschreiben",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "fs": {
        "scope": ["$APPDIR/sessions/*"]
      }
    },
    "bundle": {
      "identifier": "de.zeilenschreiben.app",
      "icon": ["icons/icon.png"],
      "resources": ["sessions/"]
    }
  }
}
```

### Package.json Scripts

Add to existing scripts:
```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Build Outputs

**Web Deployment (unchanged):**
- Command: `npm run build`
- Output: `dist/` folder
- Deploy via existing Docker Compose setup

**Desktop Deployment:**
- Command: `npm run tauri:build`
- Output: `src-tauri/target/release/bundle/`
  - Linux: `.AppImage`, `.deb`
  - Windows: `.msi`, `.exe`
  - macOS: `.dmg`, `.app`

### Distribution

**Web:**
- Deploy `dist/` to server using existing Docker Compose
- No changes to deployment process

**Desktop:**
- Distribute platform-specific installer
- Include example `sessions/` folder with README
- Teachers add their own `.md` files to sessions directory after installation

## Testing Strategy

### Unit Tests

**FileSystemConnection:**
- Mock Tauri invoke calls
- Test session loading with valid files
- Test error handling (not found, invalid format, code mismatch)
- Test case-insensitive code lookup

**Connection Factory:**
- Mock `window.__TAURI__` to test mode selection
- Verify correct connection type returned

### Integration Tests

**Desktop Mode:**
- Create test session files
- Load sessions via FileSystemConnection
- Verify domain objects created correctly
- Test full typing flow with file-based sessions

**Web Mode:**
- Existing tests continue to work unchanged
- Verify web mode still uses SupabaseConnection

### Manual Testing

**Desktop App:**
- Install on each platform (Linux, Windows, macOS)
- Verify sessions directory created
- Add test session files
- Enter codes and verify sessions load
- Test typing flow end-to-end
- Verify results display (no persistence)

## Migration Path

### Phase 1: Tauri Setup
1. Install Tauri CLI and dependencies
2. Initialize Tauri project (`tauri init`)
3. Configure `tauri.conf.json`
4. Create basic Rust backend structure

### Phase 2: FileSystemConnection
1. Create `FileSystemConnection.ts` implementing `Connection` interface
2. Implement Rust commands for file reading
3. Add frontmatter parsing
4. Write unit tests

### Phase 3: Context & Factory
1. Create connection context utilities
2. Implement connection factory
3. Update `main.ts` to use factory
4. Update components to use context

### Phase 4: Testing & Polish
1. Add integration tests
2. Create example session files
3. Test on all platforms
4. Write documentation for teachers

### Phase 5: Distribution
1. Build installers for all platforms
2. Create distribution package with examples
3. Update README with desktop deployment instructions

## Future Enhancements

### Optional Features (Not in Scope)
- Result persistence to local files
- Session file browser UI
- Configurable sessions directory path
- Auto-reload when session files change
- Session file validation tool for teachers
- Export results to CSV

## Success Criteria

- Desktop app launches on Linux, Windows, macOS
- Students can enter session codes and load markdown files
- Typing practice works identically to web version
- Results display correctly (no persistence)
- Web deployment continues working unchanged
- No code duplication between web and desktop UI
- Teachers can easily add/modify session files

## Open Questions

None - all requirements clarified.
