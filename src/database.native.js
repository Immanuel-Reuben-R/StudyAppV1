import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('studynotes.db');

export const initDB = () => {
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
      is_ai_enhanced INTEGER DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS note_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      content TEXT,
      is_ai_enhanced INTEGER DEFAULT 0,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration for adding is_ai_enhanced if database was created previously
  try { db.execSync('ALTER TABLE notes ADD COLUMN is_ai_enhanced INTEGER DEFAULT 0;'); } catch(e) {}
  try { db.execSync('ALTER TABLE note_versions ADD COLUMN is_ai_enhanced INTEGER DEFAULT 0;'); } catch(e) {}
};

// --- SETTINGS ---
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
  return db.getAllSync(`
    SELECT s.*, COUNT(c.id) as chapterCount 
    FROM subjects s 
    LEFT JOIN chapters c ON s.id = c.subject_id 
    GROUP BY s.id 
    ORDER BY s.created_at ASC
  `);
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
  return db.getAllSync(`
    SELECT c.*, 
           n.id as note_id, 
           n.is_ai_enhanced,
           CASE 
             WHEN n.id IS NULL THEN 'empty'
             WHEN n.is_ai_enhanced = 1 THEN 'enhanced'
             ELSE 'draft'
           END as status
    FROM chapters c 
    LEFT JOIN notes n ON c.id = n.chapter_id
    WHERE c.subject_id = ? 
    ORDER BY c.created_at ASC
  `, [subjectId]);
};

// --- NOTES & VERSIONING ---
export const getNoteForChapter = (chapterId) => {
  return db.getFirstSync('SELECT * FROM notes WHERE chapter_id = ?', [chapterId]);
};

export const saveNote = (chapterId, content, isEnhanced = 0) => {
  const existing = getNoteForChapter(chapterId);
  let noteId;

  if (existing) {
    noteId = existing.id;
    // Save history
    db.runSync('INSERT INTO note_versions (note_id, content, is_ai_enhanced) VALUES (?, ?, ?)', [noteId, existing.content, existing.is_ai_enhanced]);
    
    // Prune history to max 3
    db.runSync(`
      DELETE FROM note_versions 
      WHERE note_id = ? 
      AND id NOT IN (
        SELECT id FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC LIMIT 3
      )
    `, [noteId, noteId]);

    // Update active
    db.runSync('UPDATE notes SET content = ?, is_ai_enhanced = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [content, isEnhanced, noteId]);
  } else {
    // New note
    const result = db.runSync('INSERT INTO notes (chapter_id, content, is_ai_enhanced) VALUES (?, ?, ?)', [chapterId, content, isEnhanced]);
    noteId = result.lastInsertRowId;
  }
  return noteId;
};

export const getNoteVersions = (noteId) => {
  return db.getAllSync('SELECT * FROM note_versions WHERE note_id = ? ORDER BY saved_at DESC', [noteId]);
};
