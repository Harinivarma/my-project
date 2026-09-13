import { renderNavbar } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('home');
  fetchFeaturedCourses();

  const searchForm = document.getElementById('hero-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('hero-search-input');
      const searchVal = searchInput ? searchInput.value.trim() : '';
      if (searchVal) {
        window.location.href = `courses.html?search=${encodeURIComponent(searchVal)}`;
      } else {
        window.location.href = 'courses.html';
      }
    });
  }
});

async function fetchFeaturedCourses() {
  const container = document.getElementById('courses-container');
  if (!container) return;

  try {
    const courses = await apiFetch('/courses');
    const featured = courses.slice(0, 6);

    if (featured.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
          No approved courses are currently available. Check back soon!
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px;">
        ${featured.map(course => `
          <div class="glass-card" style="display: flex; flex-direction: column; height: 100%;">
            <img
              src="${course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}"
              alt="${course.title}"
              style="width: 100%; height: 180px; object-fit: cover; border-top-left-radius: 15px; border-top-right-radius: 15px;"
            />
            <div style="padding: 24px; flex: 1; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="badge badge-success" style="font-size: 0.7rem;">${course.category}</span>
                <span style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">
                  ${course.price > 0 ? `₹${course.price}` : 'Free'}
                </span>
              </div>
              
              <h3 style="font-size: 1.2rem; margin-bottom: 12px; line-height: 1.4;">${course.title}</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 54px;">
                ${course.description}
              </p>
              
              <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--text-muted);">
                  By ${course.instructor ? course.instructor.name : 'Instructor'}
                </span>
                <a href="course-details.html?id=${course.id}" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">
                  View Details
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Error loading featured courses:', err);
    container.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--danger);">
        Failed to load featured courses. Please make sure the backend server is running.
      </div>
    `;
  }
}
