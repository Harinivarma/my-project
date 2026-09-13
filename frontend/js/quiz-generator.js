import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

let courseId = null;

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

  fetchCourseDetails();

  const form = document.getElementById('quiz-gen-form');
  if (form) form.addEventListener('submit', handleGenerateQuiz);
});

async function fetchCourseDetails() {
  try {
    const course = await apiFetch(`/courses/${courseId}`);
    const titleInput = document.getElementById('quizTitle');
    if (titleInput) titleInput.value = `Quiz: ${course.title}`;
  } catch (err) {
    console.error(err);
    alert('Failed to retrieve course details.');
    window.location.href = 'instructor-dashboard.html';
  }
}

async function handleGenerateQuiz(e) {
  e.preventDefault();

  const quizTitle = document.getElementById('quizTitle').value.trim();
  const content = document.getElementById('content').value.trim();
  const genBtn = document.getElementById('gen-btn');
  const previewPanel = document.getElementById('preview-panel');

  genBtn.disabled = true;
  genBtn.innerText = 'Generating via AI...';

  previewPanel.innerHTML = `
    <div style="text-align: center; padding: 60px;">
      <div class="spinner" style="margin: 0 auto 16px;"></div>
      <h4 style="color: #fff;">Invoking Structured AI API...</h4>
      <p style="color: var(--text-secondary); margin-top: 8px; font-size: 0.85rem;">
        Analyzing notes and extracting MCQs. This takes around 10-15 seconds.
      </p>
    </div>
  `;

  try {
    const quiz = await apiFetch('/quizzes/generate', {
      method: 'POST',
      body: {
        courseId: parseInt(courseId),
        quizTitle,
        content
      }
    });

    const questions = await apiFetch(`/quizzes/${quiz.id}/questions`);

    alert('AI Quiz template generated and saved successfully!');

    previewPanel.innerHTML = `
      <div>
        <div style="display: flex; gap: 8px; align-items: center; color: var(--secondary); margin-bottom: 24px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span style="font-weight: 700;">Saved: ${quiz.title}</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 28px;">
          ${questions.map((q, idx) => `
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
              <h4 style="font-size: 1rem; color: #fff; margin-bottom: 12px;">
                ${idx + 1}. ${q.question}
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem; color: var(--text-secondary);">
                <div>A. ${q.optionA}</div>
                <div>B. ${q.optionB}</div>
                <div>C. ${q.optionC}</div>
                <div>D. ${q.optionD}</div>
              </div>
              <div style="margin-top: 12px; font-size: 0.85rem; color: var(--secondary);">
                Correct Answer: ${q.correctAnswer}
              </div>
              <div style="margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">
                Reason: ${q.explanation}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    alert(err.data || err.message || 'Failed to generate quiz. Check your AI credentials.');
    previewPanel.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--danger);">
        Failed to generate quiz.
      </div>
    `;
  } finally {
    genBtn.disabled = false;
    genBtn.innerText = 'Generate MCQ Quiz';
  }
}
