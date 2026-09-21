import * as SQLite from 'expo-sqlite';

// Open the database synchronously (new API in expo-sqlite)
export const db = SQLite.openDatabaseSync('studynotes.db');

export const initDB = () => {
  // Create tables for our app structure
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER UNIQUE NOT NULL,
      content TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS note_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      content TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
};

// --- SETTINGS (Persona & API Keys) ---
export const getSetting = (key) => {
  const result = db.getFirstSync('SELECT value FROM settings WHERE key = ?', [key]);
  return result ? result.value : null;
};

export const setSetting = (key, value) => {
  db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};

// --- SUBJECTS ---
export const addSubject = (name) => {
  const result = db.runSync('INSERT INTO subjects (name) VALUES (?)', [name]);
  return result.lastInsertRowId;
};

export const getSubjects = () => {
  return db.getAllSync('SELECT * FROM subjects ORDER BY created_at ASC');
};

export const deleteSubject = (id) => {
  db.runSync('DELETE FROM subjects WHERE id = ?', [id]);
}

// --- CHAPTERS ---
export const addChapter = (subjectId, title) => {
  const result = db.runSync('INSERT INTO chapters (subject_id, title) VALUES (?, ?)', [subjectId, title]);
  return result.lastInsertRowId;
};

export const getChaptersBySubject = (subjectId) => {
  return db.getAllSync('SELECT * FROM chapters WHERE subject_id = ? ORDER BY created_at ASC', [subjectId]);
};

// --- NOTES & VERSIONING ---
export const getNoteForChapter = (chapterId) => {
  return db.getFirstSync('SELECT * FROM notes WHERE chapter_id = ?', [chapterId]);
};

export const saveNote = (chapterId, content) => {
  const existing = getNoteForChapter(chapterId);
  let noteId;

  if (existing) {
    noteId = existing.id;
    // Save current content to history before overwriting
    db.runSync('INSERT INTO note_versions (note_id, content) VALUES (?, ?)', [noteId, existing.content]);
    
    // Enforce exactly 3 max historical versions (delete older ones)
    db.runSync(`
      DELETE FROM note_versions 
      WHERE note_id = ? 
      AND id NOT IN (
        SELECT id FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC LIMIT 3
      )
    `, [noteId, noteId]);

    // Update current note
    db.runSync('UPDATE notes SET content = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [content, noteId]);
  } else {
    // First time saving a note for this chapter
    const result = db.runSync('INSERT INTO notes (chapter_id, content) VALUES (?, ?)', [chapterId, content]);
    noteId = result.lastInsertRowId;
  }
  return noteId;
};

export const getNoteVersions = (noteId) => {
  return db.getAllSync('SELECT * FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC', [noteId]);
};
