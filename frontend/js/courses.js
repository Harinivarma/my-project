import { renderNavbar } from './auth.js';
import { apiFetch } from './api.js';

let allCourses = [];
let selectedCategory = 'All';

const categories = ['All', 'Software Development', 'Data Science', 'Business', 'Design', 'Marketing'];

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('courses');

  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search') || '';

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.value = initialSearch;
  }

  renderCategoryButtons();
  fetchCourses(initialSearch);

  const searchForm = document.getElementById('catalog-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchVal = searchInput ? searchInput.value.trim() : '';
      const newUrl = searchVal ? `courses.html?search=${encodeURIComponent(searchVal)}` : 'courses.html';
      window.history.pushState({}, '', newUrl);
      fetchCourses(searchVal);
    });
  }
});

function renderCategoryButtons() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button
      type="button"
      class="btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}"
      data-category="${cat}"
      style="padding: 8px 16px; font-size: 0.85rem;"
    >
      ${cat}
    </button>
  `).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.category;
      renderCategoryButtons();
      renderFilteredCourses();
    });
  });
}

async function fetchCourses(searchQuery = '') {
  const container = document.getElementById('catalog-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; justify-content: center; padding: 100px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    let url = '/courses';
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    allCourses = await apiFetch(url);
    renderFilteredCourses();
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--danger);">
        Failed to fetch courses.
      </div>
    `;
  }
}

function renderFilteredCourses() {
  const container = document.getElementById('catalog-container');
  if (!container) return;

  const filtered = selectedCategory === 'All'
    ? allCourses
    : allCourses.filter(c => c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 40px; background: rgba(22, 28, 45, 0.4); border: 1px solid var(--border-color); border-radius: 16px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No Courses Found</h3>
        <p style="color: var(--text-secondary);">We couldn't find any courses matching your search query or filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px;">
      ${filtered.map(course => `
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

            ${course.skillsTags ? `
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;">
                ${course.skillsTags.split(',').map(t => `
                  <span style="background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary);">${t.trim()}</span>
                `).join('')}
              </div>
            ` : ''}

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
}
