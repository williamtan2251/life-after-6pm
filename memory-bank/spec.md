# Life After 6PM

A personal journal web app hosted on **williamtan2251.github.io**.

## Overview

Users can create and manage journal entries using a rich text editor. Entries are displayed publicly in reverse chronological order.

## User Roles & Features

### Authenticated Users

- **Create** journal entries via a rich text editor
- **View** their own journal entries
- **Update** existing journal entries
- **Delete** journal entries

### Unauthenticated Users

- **Browse** journal entries in reverse chronological order (most recent first)
- **Preview** entries in a list view showing date/time and a content snippet
- **Read** full journal entries by clicking through from the list

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | Next.js (App Router)                |
| Runtime          | Bun                                 |
| Language         | TypeScript                          |
| Styling          | CSS Modules                         |
| Authentication   | Supabase Auth                       |
| Database         | Supabase PostgreSQL                 |
| Rich Text Editor | Tiptap                              |
| Deployment       | GitHub Pages (static export)        |

## Rich Text Editor Requirements

The editor must support the following formatting options:

- **Bold** and *italic* text
- 3 heading levels (H1, H2, H3) plus normal body text
- Inline `code` and fenced code blocks
- Unordered (bullet) lists and ordered (numbered) lists
- Horizontal separator lines

## Data Model

Journal content is stored as Tiptap JSON in Supabase PostgreSQL.

### `journals` Table

| Column       | Type           | Description                          |
| ------------ | -------------- | ------------------------------------ |
| `id`         | UUID (PK)      | Unique identifier (auto-generated)   |
| `title`      | TEXT           | Journal entry title                  |
| `content`    | JSONB          | Tiptap JSON content                  |
| `preview`    | TEXT           | Plain text preview (~200 chars)      |
| `created_at` | TIMESTAMPTZ    | Auto-set on creation                 |
| `updated_at` | TIMESTAMPTZ    | Auto-set on creation                 |
| `author_id`  | UUID (FK)      | References auth.users(id)            |

### Row-Level Security

- Public read access (unauthenticated users can browse)
- Only authors can insert/update/delete their own entries

## Deployment

Static export hosted on GitHub Pages at `williamtan2251.github.io`.

### SQL Setup

```sql
CREATE TABLE journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE POLICY "public_read" ON journals
  FOR SELECT USING (true);

CREATE POLICY "author_insert" ON journals
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "author_update" ON journals
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "author_delete" ON journals
  FOR DELETE USING (auth.uid() = author_id);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
```
