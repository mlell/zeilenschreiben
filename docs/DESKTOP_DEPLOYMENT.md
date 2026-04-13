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
