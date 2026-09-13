import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('INSTRUCTOR');
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const form = document.getElementById('create-course-form');
  if (form) {
    form.addEventListener('submit', handleCreateCourse);
  }
});

async function handleCreateCourse(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const price = parseFloat(document.getElementById('price').value) || 0;
  const skillsTags = document.getElementById('skillsTags').value.trim();
  const thumbnailUrl = document.getElementById('thumbnailUrl').value.trim();
  const description = document.getElementById('description').value.trim();

  const submitBtn = document.getElementById('submit-btn');
  const errorAlert = document.getElementById('error-alert');

  submitBtn.disabled = true;
  submitBtn.innerText = 'Creating Course...';
  errorAlert.style.display = 'none';

  try {
    await apiFetch('/courses', {
      method: 'POST',
      body: {
        title,
        description,
        category,
        skillsTags,
        price,
        thumbnailUrl
      }
    });

    alert('Course created successfully! Pending admin approval.');
    window.location.href = 'instructor-dashboard.html';
  } catch (err) {
    console.error(err);
    errorAlert.innerText = err.data?.message || err.message || 'Failed to create course. Ensure fields are correct.';
    errorAlert.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Course';
  }
}
