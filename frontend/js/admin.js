import { requireAuth, logout } from './auth.js';
import { apiFetch } from './api.js';

let activeTab = 'STATS'; // STATS, USERS, COURSES, ORDERS

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('ADMIN');
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  bindTabButtons();
  loadAdminTab();
});

function bindTabButtons() {
  const statsBtn = document.getElementById('tab-stats-btn');
  const usersBtn = document.getElementById('tab-users-btn');
  const coursesBtn = document.getElementById('tab-courses-btn');
  const ordersBtn = document.getElementById('tab-orders-btn');

  const buttons = [
    { btn: statsBtn, tab: 'STATS' },
    { btn: usersBtn, tab: 'USERS' },
    { btn: coursesBtn, tab: 'COURSES' },
    { btn: ordersBtn, tab: 'ORDERS' }
  ];

  buttons.forEach(({ btn, tab }) => {
    if (btn) {
      btn.addEventListener('click', () => {
        activeTab = tab;
        buttons.forEach(b => b.btn && b.btn.classList.remove('active'));
        btn.classList.add('active');
        loadAdminTab();
      });
    }
  });
}

async function loadAdminTab() {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; justify-content: center; padding: 100px;">
      <div class="spinner"></div>
    </div>
  `;

  try {
    if (activeTab === 'STATS') {
      const stats = await apiFetch('/admin/statistics');
      renderStatsTab(stats);
    } else if (activeTab === 'USERS') {
      const users = await apiFetch('/admin/users');
      renderUsersTab(users);
    } else if (activeTab === 'COURSES') {
      const courses = await apiFetch('/admin/courses');
      renderCoursesTab(courses);
    } else if (activeTab === 'ORDERS') {
      const orders = await apiFetch('/admin/orders');
      renderOrdersTab(orders);
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align: center; padding: 60px; color: var(--danger);">
        Failed to retrieve admin details.
      </div>
    `;
  }
}

function renderStatsTab(stats) {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px;">
        <div class="glass-card" style="padding: 24px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <h4 style="color: var(--text-secondary); font-size: 0.85rem;">Students</h4>
          <p style="font-size: 2rem; font-weight: 800; margin-top: 8px; color: #fff;">${stats.totalStudents || 0}</p>
        </div>
        <div class="glass-card" style="padding: 24px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
          <h4 style="color: var(--text-secondary); font-size: 0.85rem;">Instructors</h4>
          <p style="font-size: 2rem; font-weight: 800; margin-top: 8px; color: #fff;">${stats.totalInstructors || 0}</p>
        </div>
        <div class="glass-card" style="padding: 24px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <h4 style="color: var(--text-secondary); font-size: 0.85rem;">Total Revenue</h4>
          <p style="font-size: 2rem; font-weight: 800; margin-top: 8px; color: var(--secondary);">
            ₹${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div class="glass-card" style="padding: 32px;">
        <h3 style="font-size: 1.25rem; margin-bottom: 20px;">Course Inventories</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
          <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <span style="font-size: 1.5rem; font-weight: 700; color: #fff;">${stats.totalCourses || 0}</span>
            <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Total Courses</span>
          </div>
          <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <span style="font-size: 1.5rem; font-weight: 700; color: var(--secondary);">${stats.approvedCourses || 0}</span>
            <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Approved</span>
          </div>
          <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: 8px;">
            <span style="font-size: 1.5rem; font-weight: 700; color: var(--warning);">${stats.pendingCourses || 0}</span>
            <span style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Pending Approval</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUsersTab(users) {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card" style="padding: 32px;">
      <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Manage Users</h3>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.id}</td>
                <td style="font-weight: 600; color: #fff;">${u.name}</td>
                <td>${u.email}</td>
                <td>
                  <span class="badge ${u.role === 'ADMIN' ? 'badge-danger' : (u.role === 'INSTRUCTOR' ? 'badge-warning' : 'badge-success')}">
                    ${u.role}
                  </span>
                </td>
                <td>
                  ${u.role !== 'ADMIN' ? `
                    <button class="delete-user-btn" data-user-id="${u.id}" style="background: transparent; border: none; color: var(--danger); cursor: pointer;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = parseInt(btn.dataset.userId);
      handleDeleteUser(userId);
    });
  });
}

function renderCoursesTab(courses) {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card" style="padding: 32px;">
      <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Manage Course Approvals</h3>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(c => `
              <tr>
                <td>${c.id}</td>
                <td style="font-weight: 600; color: #fff;">${c.title}</td>
                <td>${c.instructor ? c.instructor.name : 'Instructor'}</td>
                <td>${c.price > 0 ? `₹${c.price}` : 'Free'}</td>
                <td>
                  ${c.approved ? `
                    <span class="badge badge-success">Approved</span>
                  ` : `
                    <span class="badge badge-warning">Pending</span>
                  `}
                </td>
                <td>
                  <div style="display: flex; gap: 12px;">
                    ${!c.approved ? `
                      <button class="approve-course-btn btn btn-secondary" data-course-id="${c.id}" style="padding: 4px 8px; font-size: 0.75rem;">
                        Approve
                      </button>
                    ` : ''}
                    <button class="delete-course-btn" data-course-id="${c.id}" style="background: transparent; border: none; color: var(--danger); cursor: pointer;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll('.approve-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = parseInt(btn.dataset.courseId);
      handleApproveCourse(courseId);
    });
  });

  document.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = parseInt(btn.dataset.courseId);
      handleDeleteCourse(courseId);
    });
  });
}

function renderOrdersTab(orders) {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div class="glass-card" style="padding: 32px;">
      <h3 style="font-size: 1.25rem; margin-bottom: 16px;">Order Book Ledger</h3>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Razorpay Order ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Price</th>
              <th>Payment Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td style="font-family: monospace; font-size: 0.8rem; color: #fff;">${o.razorpayOrderId}</td>
                <td>${o.student ? o.student.name : 'Student'}</td>
                <td>${o.course ? o.course.title : 'Course'}</td>
                <td>₹${o.amount ? o.amount.toFixed(2) : '0.00'}</td>
                <td>
                  <span class="badge ${o.status === 'PAID' ? 'badge-success' : 'badge-warning'}">
                    ${o.status}
                  </span>
                </td>
                <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function handleApproveCourse(courseId) {
  try {
    await apiFetch(`/admin/courses/${courseId}/approve`, {
      method: 'POST'
    });
    alert('Course approved successfully!');
    loadAdminTab();
  } catch (err) {
    console.error(err);
    alert('Failed to approve course.');
  }
}

async function handleDeleteCourse(courseId) {
  if (!window.confirm('Are you sure you want to remove this course?')) return;
  try {
    await apiFetch(`/admin/courses/${courseId}`, {
      method: 'DELETE'
    });
    loadAdminTab();
  } catch (err) {
    console.error(err);
    alert('Failed to delete course.');
  }
}

async function handleDeleteUser(userId) {
  if (!window.confirm('Are you sure you want to remove this user account?')) return;
  try {
    await apiFetch(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
    loadAdminTab();
  } catch (err) {
    console.error(err);
    alert('Failed to remove user account.');
  }
}
