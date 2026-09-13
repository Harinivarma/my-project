import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('INSTRUCTOR');
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  fetchInstructorCourses();
});

async function fetchInstructorCourses() {
  const container = document.getElementById('instructor-courses-container');
  const statTotal = document.getElementById('stat-total');
  const statApproved = document.getElementById('stat-approved');
  const statPending = document.getElementById('stat-pending');

  if (!container) return;

  try {
    const courses = await apiFetch('/courses/instructor/my-courses');

    if (statTotal) statTotal.innerText = courses.length;
    if (statApproved) statApproved.innerText = courses.filter(c => c.approved).length;
    if (statPending) statPending.innerText = courses.filter(c => !c.approved).length;

    if (courses.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(22, 28, 45, 0.4); border: 1px solid var(--border-color); padding: 60px 40px; border-radius: 16px; text-align: center;">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No Courses Created</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">Get started by publishing your first course topic.</p>
          <a href="create-course.html" class="btn btn-primary">Create Course</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(course => `
              <tr>
                <td>
                  <img
                    src="${course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60'}"
                    alt="${course.title}"
                    style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"
                  />
                </td>
                <td style="font-weight: 600; color: #fff;">${course.title}</td>
                <td>${course.category}</td>
                <td>${course.price > 0 ? `₹${course.price}` : 'Free'}</td>
                <td>
                  ${course.approved ? `
                    <span class="badge badge-success">Approved</span>
                  ` : `
                    <span class="badge badge-warning">Pending</span>
                  `}
                </td>
                <td>
                  <div style="display: flex; gap: 10px;">
                    <a href="manage-content.html?courseId=${course.id}" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">
                      Add Lessons
                    </a>
                    <a href="quiz-generator.html?courseId=${course.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">
                      Generate Quiz
                    </a>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger);">
        Failed to fetch instructor courses.
      </div>
    `;
  }
}
