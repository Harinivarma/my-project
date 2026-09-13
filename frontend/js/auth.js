export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

export function getDashboardLink() {
  const user = getUser();
  if (!user) return 'login.html';
  if (user.role === 'ADMIN') return 'admin-dashboard.html';
  if (user.role === 'INSTRUCTOR') return 'instructor-dashboard.html';
  return 'dashboard.html';
}

export function requireAuth(requiredRole) {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

export function renderNavbar(activePage = '') {
  const navElement = document.getElementById('navbar');
  if (!navElement) return;

  const user = getUser();
  const dashboardUrl = getDashboardLink();

  navElement.className = 'navbar';
  navElement.innerHTML = `
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
      <a href="index.html" style="text-decoration: none; display: flex; align-items: center; gap: 10px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span style="font-size: 1.4rem; color: #fff; font-weight: 800; font-family: var(--font-display);">
          Edu<span style="color: var(--primary);">AI</span>
        </span>
      </a>

      <div style="display: flex; align-items: center; gap: 24px;">
        <a href="courses.html" style="color: ${activePage === 'courses' ? '#fff' : 'var(--text-secondary)'}; text-decoration: none; font-weight: 600;">Browse Courses</a>
        
        ${user ? `
          <a href="${dashboardUrl}" style="color: ${activePage === 'dashboard' ? '#fff' : 'var(--text-secondary)'}; text-decoration: none; font-weight: 600;">Dashboard</a>
          <div style="display: flex; align-items: center; gap: 12px; border-left: 1px solid var(--border-color); padding-left: 24px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span style="font-weight: 600; font-size: 0.9rem;">${user.name}</span>
            <button id="logout-btn" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log Out
            </button>
          </div>
        ` : `
          <div style="display: flex; gap: 12px;">
            <a href="login.html" class="btn btn-outline">Log In</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
          </div>
        `}
      </div>
    </div>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}
