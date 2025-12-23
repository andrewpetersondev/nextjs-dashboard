---
description: "Generate a traditional tree-style directory structure in Markdown."
---

## Task

Given a root folder, output its **complete directory structure** using a **traditional tree-style format** (similar to the Unix `tree` command).

## Requirements

The output **must**:

- Include **all subfolders and files** recursively.
- Use **relative paths** from the root folder.
- Follow **standard tree characters** for hierarchy:
  - `├──` for intermediate items
  - `└──` for the last item in a directory
  - `│` to indicate continuation of parent levels
- Preserve **original names and casing**.
- List **folders before files**, sorted alphabetically within each level.
- Append `/` to **directory names only**.

## Output Format

- Output **only** the tree diagram (no explanations or prose).
- Wrap the tree in a Markdown code block.
- Example:

```txt
project-root/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── utils/
│   │   └── formatDate.ts
│   └── index.ts
├── tests/
│   └── index.test.ts
└── README.md
```

## Constraints

- Do not invent, infer, or omit files or folders.
- Do not use alternative symbols or indentation styles.
- Do not include absolute paths.
- Do not include file metadata (sizes, permissions, timestamps).

## Success Criteria

- The structure visually matches the output of the Unix `tree` command.
- The hierarchy is unambiguous and readable.
- The output can be pasted directly into Markdown and render correctly.
