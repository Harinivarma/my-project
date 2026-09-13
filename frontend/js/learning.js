import { requireAuth } from './auth.js';
import { apiFetch } from './api.js';

let course = null;
let lessons = [];
let currentLesson = null;
let quizzes = [];
let progress = { percentage: 0, completionMap: {} };

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('STUDENT');
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  if (!courseId) {
    window.location.href = 'dashboard.html';
    return;
  }

  fetchCourseData(courseId);
});

async function fetchCourseData(courseId) {
  const container = document.getElementById('learning-container');
  if (!container) return;

  try {
    course = await apiFetch(`/courses/${courseId}`);
    lessons = await apiFetch(`/courses/${courseId}/lessons`);
    if (lessons.length > 0) {
      currentLesson = lessons[0];
    }
    progress = await apiFetch(`/progress/${courseId}`);
    quizzes = await apiFetch(`/quizzes/course/${courseId}`);

    renderLearningView();
  } catch (err) {
    console.error(err);
    alert('Access Denied: You must purchase this course to access lessons.');
    window.location.href = 'dashboard.html';
  }
}

function renderLearningView() {
  const container = document.getElementById('learning-container');
  if (!container || !course) return;

  const isCurrentCompleted = currentLesson && progress.completionMap && progress.completionMap[currentLesson.id];

  container.innerHTML = `
    <!-- Header Navigation -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
      <a href="dashboard.html" style="display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); text-decoration: none; font-weight: 600;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg> Back to Dashboard
      </a>
      <span style="font-size: 1.2rem; font-weight: 700;">${course.title}</span>
    </div>

    <!-- Two column grid -->
    <div style="display: grid; grid-template-columns: 2.5fr 1.2fr; gap: 32px;">
      
      <!-- Left Column: Lesson Player and Details -->
      <div>
        ${currentLesson ? `
          <div>
            <!-- Video Player Mock -->
            <div style="position: relative; width: 100%; height: 420px; background: #090d16; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-direction: column; border: 1px solid var(--border-color); margin-bottom: 24px; box-shadow: var(--shadow-md);">
              ${currentLesson.videoUrl ? `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                  <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.6); padding: 6px 12px; border-radius: 4px; font-size: 0.8rem;">
                    Source URL: ${currentLesson.videoUrl}
                  </div>
                </div>
              ` : `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span style="color: var(--text-secondary);">No video uploaded for this lesson.</span>
              `}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <h2 style="font-size: 1.8rem;">${currentLesson.title}</h2>
              
              <!-- Mark Completed Checkbox Button -->
              <button
                id="toggle-complete-btn"
                class="btn"
                style="background: ${isCurrentCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isCurrentCompleted ? 'var(--secondary)' : 'var(--border-color)'}; color: ${isCurrentCompleted ? 'var(--secondary)' : 'var(--text-primary)'}; padding: 8px 16px; border-radius: 8px; display: flex; align-items: center; gap: 8px;"
              >
                ${isCurrentCompleted ? `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg> Completed
                ` : `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg> Mark Completed
                `}
              </button>
            </div>

            <h3 style="font-size: 1.25rem; margin-bottom: 12px;">Lesson Notes</h3>
            <div class="glass-card" style="padding: 24px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap;">
              ${currentLesson.notes || 'No notes available for this lesson.'}
            </div>

            <!-- Quizzes Section -->
            <h2 style="font-size: 1.6rem; margin-top: 48px; margin-bottom: 16px;">Course Quizzes</h2>
            ${quizzes.length === 0 ? `
              <p style="color: var(--text-muted);">No quizzes are currently available for this course.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${quizzes.map(quiz => `
                  <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                      <div>
                        <h4 style="color: #fff; font-size: 1.05rem;">${quiz.title}</h4>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">AI-Generated MCQ Quiz</span>
                      </div>
                    </div>
                    <a href="quiz.html?quizId=${quiz.id}" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">
                      Take Quiz
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </a>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : `
          <div style="text-align: center; padding: 60px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h3>No Lessons Found</h3>
            <p style="color: var(--text-secondary);">The instructor hasn't uploaded any content for this course yet.</p>
          </div>
        `}
      </div>

      <!-- Right Column: Syllabus Sidebar -->
      <div>
        <div class="glass-card" style="padding: 24px; position: sticky; top: 100px;">
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
              <span>Course Progress</span>
              <span style="color: #fff; font-weight: 700;">${progress.percentage}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">
              <div style="width: ${progress.percentage}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
            </div>
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 16px;">Lessons List</h3>
          
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${lessons.map((lesson, idx) => {
              const isActive = currentLesson && currentLesson.id === lesson.id;
              const isComp = progress.completionMap && progress.completionMap[lesson.id];
              return `
                <button
                  type="button"
                  class="lesson-select-btn"
                  data-lesson-id="${lesson.id}"
                  style="background: ${isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}; border: none; border-left: ${isActive ? '3px solid var(--primary)' : '3px solid transparent'}; padding: 12px 16px; text-align: left; cursor: pointer; border-radius: 0 8px 8px 0; color: ${isActive ? '#fff' : 'var(--text-secondary)'}; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; transition: all 0.2s ease;"
                >
                  <span style="font-size: 0.9rem; font-weight: ${isActive ? 700 : 500}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;">
                    ${idx + 1}. ${lesson.title}
                  </span>
                  ${isComp ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                  `}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const toggleBtn = document.getElementById('toggle-complete-btn');
  if (toggleBtn && currentLesson) {
    toggleBtn.addEventListener('click', async () => {
      const isCompleted = !(progress.completionMap && progress.completionMap[currentLesson.id]);
      try {
        await apiFetch('/progress', {
          method: 'POST',
          body: {
            lessonId: currentLesson.id,
            completed: isCompleted
          }
        });
        progress = await apiFetch(`/progress/${course.id}`);
        renderLearningView();
      } catch (err) {
        console.error(err);
      }
    });
  }

  document.querySelectorAll('.lesson-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lessonId = parseInt(btn.dataset.lessonId);
      const found = lessons.find(l => l.id === lessonId);
      if (found) {
        currentLesson = found;
        renderLearningView();
      }
    });
  });
}
