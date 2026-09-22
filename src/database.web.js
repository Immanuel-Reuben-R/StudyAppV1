// In-memory mock database strictly for testing the UI on the web browser.
// The actual Android APK will use database.native.js!

let mockSubjects = [
  { id: 1, name: 'Physics', chapterCount: 3, created_at: new Date().toISOString() },
  { id: 2, name: 'English Literature', chapterCount: 0, created_at: new Date().toISOString() }
];
let idCounter = 3;

export const initDB = () => { console.log("Web Mock DB initialized!"); };
let mockSettings = {};
export const getSetting = (key) => mockSettings[key] || null;
export const setSetting = (key, value) => { mockSettings[key] = value; };

export const addSubject = (name) => {
  const id = idCounter++;
  mockSubjects.push({ id, name, chapterCount: 0, created_at: new Date().toISOString() });
  return id;
};

export const getSubjects = () => [...mockSubjects];
export const deleteSubject = (id) => { mockSubjects = mockSubjects.filter(s => s.id !== id); };

export const addChapter = (subjectId, title) => 1;
export const getChaptersBySubject = (subjectId) => [
  { id: 101, subject_id: subjectId, title: 'Introduction', status: 'enhanced' },
  { id: 102, subject_id: subjectId, title: 'Chapter 2', status: 'draft' },
  { id: 103, subject_id: subjectId, title: 'Exam Prep', status: 'empty' },
];

export const getNoteForChapter = (chapterId) => null;
export const saveNote = (chapterId, content, isAiEnhanced = 0) => 1;
export const getNoteVersions = (noteId) => [];
