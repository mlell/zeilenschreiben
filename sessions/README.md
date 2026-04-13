# Session Files

This directory contains typing practice session files for the Zeilenschreiben desktop app.

## File Format

Each session is a markdown file with YAML frontmatter:

```markdown
---
code: ABC123
timeLimit: 300
---

First line to type
Second line to type
Third line to type
```

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
