import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('STUDENT');
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  fetchRecommendations();
});

async function fetchRecommendations() {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  try {
    const recommendations = await apiFetch('/recommendations');

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div style="background: rgba(22, 28, 45, 0.4); border: 1px solid var(--border-color); padding: 60px 40px; border-radius: 16px; text-align: center;">
          <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No Recommendations</h3>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">
            Please add interests to your profile to let the OpenNLP model match topics.
          </p>
          <a href="profile.html" class="btn btn-primary">Edit Interests</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px;">
        ${recommendations.map(item => {
          const { course, score, explanation } = item;
          const matchPercent = Math.round(score * 100);
          return `
            <div class="glass-card" style="display: flex; flex-direction: column; height: 100%;">
              <div style="position: relative;">
                <img
                  src="${course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}"
                  alt="${course.title}"
                  style="width: 100%; height: 160px; object-fit: cover; border-top-left-radius: 15px; border-top-right-radius: 15px;"
                />
                
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(99, 102, 241, 0.9); color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(4px);">
                  ${matchPercent > 0 ? `${matchPercent}% Match` : 'General Fit'}
                </div>
              </div>

              <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span class="badge badge-success" style="font-size: 0.65rem;">${course.category}</span>
                  <span style="font-size: 1.1rem; font-weight: 800; color: var(--secondary);">
                    ${course.price > 0 ? `₹${course.price}` : 'Free'}
                  </span>
                </div>

                <h3 style="font-size: 1.1rem; margin-bottom: 12px; line-height: 1.3;">${course.title}</h3>

                <!-- Explanatory Message Box -->
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 8px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 16px; display: flex; gap: 8px; align-items: flex-start;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>${explanation}</span>
                </div>

                <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">
                    By ${course.instructor ? course.instructor.name : 'Instructor'}
                  </span>
                  <a href="course-details.html?id=${course.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">
                    View details
                  </a>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--danger);">
        Failed to fetch recommendations.
      </div>
    `;
  }
}
