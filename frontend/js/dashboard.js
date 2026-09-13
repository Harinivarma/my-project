import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('STUDENT');
  if (!user) return;

  const userNameElem = document.getElementById('user-name');
  if (userNameElem) userNameElem.innerText = user.name;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  fetchEnrolledCourses();
});

async function fetchEnrolledCourses() {
  const container = document.getElementById('enrolled-courses-container');
  const countElem = document.getElementById('enrolled-count');
  const completedElem = document.getElementById('completed-count');

  if (!container) return;

  try {
    const courses = await apiFetch('/enrollments/my-courses');
    if (countElem) countElem.innerText = courses.length;

    const progressMap = {};
    let completedCount = 0;

    for (let course of courses) {
      try {
        const progRes = await apiFetch(`/progress/${course.id}`);
        progressMap[course.id] = progRes.percentage || 0;
        if (progRes.percentage === 100) completedCount++;
      } catch (e) {
        progressMap[course.id] = 0;
      }
    }

    if (completedElem) completedElem.innerText = completedCount;

    if (courses.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(22, 28, 45, 0.4); border: 1px solid var(--border-color); padding: 60px 40px; border-radius: 16px; text-align: center;">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No Enrolled Courses</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">You haven't enrolled in any courses yet.</p>
          <a href="courses.html" class="btn btn-primary">Browse Catalog</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
        ${courses.map(course => {
          const prog = progressMap[course.id] || 0;
          return `
            <div class="glass-card" style="display: flex; flex-direction: column; height: 100%;">
              <img
                src="${course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}"
                alt="${course.title}"
                style="width: 100%; height: 150px; object-fit: cover; border-top-left-radius: 15px; border-top-right-radius: 15px;"
              />
              
              <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                <span class="badge badge-success" style="font-size: 0.65rem; align-self: flex-start; margin-bottom: 8px;">
                  ${course.category}
                </span>
                
                <h3 style="font-size: 1.1rem; margin-bottom: 16px;">${course.title}</h3>
                
                <!-- Progress bar -->
                <div style="margin-bottom: 20px; margin-top: auto;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 6px;">
                    <span>Progress</span>
                    <span>${prog}%</span>
                  </div>
                  <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                    <div style="width: ${prog}%; height: 100%; background: var(--primary); border-radius: 3px; transition: width 0.3s ease;"></div>
                  </div>
                </div>

                <a href="learning.html?courseId=${course.id}" class="btn btn-outline" style="width: 100%; display: flex; justify-content: center;">
                  Continue Learning
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger);">
        Failed to load enrolled courses.
      </div>
    `;
  }
}
