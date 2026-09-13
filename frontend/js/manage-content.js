import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

let courseId = null;
let course = null;
let lessons = [];
let editingLessonId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('INSTRUCTOR');
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const urlParams = new URLSearchParams(window.location.search);
  courseId = urlParams.get('courseId');

  if (!courseId) {
    window.location.href = 'instructor-dashboard.html';
    return;
  }

  fetchCourseAndLessons();

  const form = document.getElementById('lesson-form');
  if (form) form.addEventListener('submit', handleSaveLesson);

  const cancelBtn = document.getElementById('lesson-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancelEdit);
});

async function fetchCourseAndLessons() {
  try {
    course = await apiFetch(`/courses/${courseId}`);
    const headerTitle = document.getElementById('course-title-header');
    if (headerTitle) headerTitle.innerText = course.title;

    lessons = await apiFetch(`/courses/${courseId}/lessons`);
    renderLessonsList();

    if (!editingLessonId) {
      document.getElementById('sequenceOrder').value = lessons.length + 1;
    }
  } catch (err) {
    console.error(err);
    alert('Failed to retrieve course syllabus details.');
    window.location.href = 'instructor-dashboard.html';
  }
}

function renderLessonsList() {
  const container = document.getElementById('lessons-list-container');
  if (!container) return;

  if (lessons.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); text-align: center; padding: 40px 0;">
        No lessons have been created yet. Use the left form to append modules.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${lessons.map(l => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">
              Seq ${l.sequenceOrder}
            </span>
            <span style="font-weight: 600; color: #fff; font-size: 0.95rem;">${l.title}</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button
              type="button"
              class="edit-lesson-btn"
              data-lesson-id="${l.id}"
              style="background: transparent; border: none; color: var(--secondary); cursor: pointer; display: flex; align-items: center; padding: 4px;"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              type="button"
              class="delete-lesson-btn"
              data-lesson-id="${l.id}"
              style="background: transparent; border: none; color: var(--danger); cursor: pointer; display: flex; align-items: center; padding: 4px;"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.edit-lesson-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.lessonId);
      const lesson = lessons.find(l => l.id === id);
      if (lesson) startEditLesson(lesson);
    });
  });

  document.querySelectorAll('.delete-lesson-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.lessonId);
      handleDeleteLesson(id);
    });
  });
}

function startEditLesson(lesson) {
  editingLessonId = lesson.id;
  document.getElementById('form-title').innerText = 'Edit Lesson Module';
  document.getElementById('lessonTitle').value = lesson.title;
  document.getElementById('videoUrl').value = lesson.videoUrl || '';
  document.getElementById('notes').value = lesson.notes || '';
  document.getElementById('sequenceOrder').value = lesson.sequenceOrder;

  document.getElementById('lesson-submit-btn').innerText = 'Update Lesson';
  document.getElementById('lesson-cancel-btn').style.display = 'block';
}

function handleCancelEdit() {
  editingLessonId = null;
  document.getElementById('form-title').innerText = 'Add New Module';
  document.getElementById('lessonTitle').value = '';
  document.getElementById('videoUrl').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('sequenceOrder').value = lessons.length + 1;

  document.getElementById('lesson-submit-btn').innerText = 'Add Lesson Module';
  document.getElementById('lesson-cancel-btn').style.display = 'none';
}

async function handleSaveLesson(e) {
  e.preventDefault();

  const title = document.getElementById('lessonTitle').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();
  const notes = document.getElementById('notes').value.trim();
  const sequenceOrder = parseInt(document.getElementById('sequenceOrder').value) || (lessons.length + 1);

  const submitBtn = document.getElementById('lesson-submit-btn');
  submitBtn.disabled = true;

  try {
    if (editingLessonId) {
      await apiFetch(`/courses/lessons/${editingLessonId}`, {
        method: 'PUT',
        body: { title, videoUrl, notes, sequenceOrder }
      });
      editingLessonId = null;
    } else {
      await apiFetch(`/courses/${courseId}/lessons`, {
        method: 'POST',
        body: { title, videoUrl, notes, sequenceOrder }
      });
    }

    handleCancelEdit();
    fetchCourseAndLessons();
  } catch (err) {
    console.error(err);
    alert(editingLessonId ? 'Failed to update lesson content.' : 'Failed to add lesson content.');
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleDeleteLesson(lessonId) {
  if (!window.confirm('Are you sure you want to remove this lesson?')) return;
  try {
    await apiFetch(`/courses/lessons/${lessonId}`, {
      method: 'DELETE'
    });
    fetchCourseAndLessons();
  } catch (err) {
    console.error(err);
    alert('Failed to remove lesson module.');
  }
}
