// In-memory mock database strictly for testing the UI on the web browser.
// The actual Android APK will use database.native.js!

let mockSubjects = [
  { id: 1, name: 'Physics', created_at: new Date().toISOString() },
  { id: 2, name: 'English Literature', created_at: new Date().toISOString() }
];
let idCounter = 3;

export const initDB = () => {
  console.log("Web Mock DB initialized!");
};

// --- SETTINGS ---
let mockSettings = {};
export const getSetting = (key) => mockSettings[key] || null;
export const setSetting = (key, value) => { mockSettings[key] = value; };

// --- SUBJECTS ---
export const addSubject = (name) => {
  const id = idCounter++;
  mockSubjects.push({ id, name, created_at: new Date().toISOString() });
  return id;
};

export const getSubjects = () => [...mockSubjects];
export const deleteSubject = (id) => { 
  mockSubjects = mockSubjects.filter(s => s.id !== id); 
};

// --- CHAPTERS ---
export const addChapter = (subjectId, title) => 1;
export const getChaptersBySubject = (subjectId) => [];

// --- NOTES & VERSIONING ---
export const getNoteForChapter = (chapterId) => null;
export const saveNote = (chapterId, content) => 1;
export const getNoteVersions = (noteId) => [];
