import { requireAuth, logout, setUser, getUser } from './auth.js';
import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  fetchProfile();

  const form = document.getElementById('profile-form');
  if (form) {
    form.addEventListener('submit', handleSaveProfile);
  }
});

async function fetchProfile() {
  try {
    const data = await apiFetch('/auth/profile');
    
    document.getElementById('email').value = data.email || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('interests').value = data.interests || '';
    
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge) roleBadge.innerText = data.role || 'STUDENT';

    renderSkills(data.skills);
  } catch (err) {
    console.error(err);
    window.location.href = 'login.html';
  }
}

function renderSkills(skillsStr) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  if (skillsStr && skillsStr.trim().length > 0) {
    const skillsList = skillsStr.split(',');
    container.innerHTML = `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${skillsList.map(skill => `
          <span style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: var(--secondary); font-weight: 600;">
            ${skill.trim()}
          </span>
        `).join('')}
      </div>
    `;
  } else {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem;">
        Start completing course modules to populate your skills register!
      </p>
    `;
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const interests = document.getElementById('interests').value.trim();
  const saveBtn = document.getElementById('save-btn');
  const msgElem = document.getElementById('profile-message');

  saveBtn.disabled = true;
  saveBtn.innerText = 'Saving...';
  msgElem.style.display = 'none';

  try {
    const updated = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: { name, interests }
    });

    const cachedUser = getUser() || {};
    cachedUser.name = updated.name;
    setUser(cachedUser);

    renderSkills(updated.skills);

    msgElem.style.display = 'block';
    msgElem.style.background = 'rgba(16, 185, 129, 0.1)';
    msgElem.style.border = '1px solid rgba(16, 185, 129, 0.2)';
    msgElem.style.color = 'var(--secondary)';
    msgElem.innerText = 'Profile updated successfully!';
  } catch (err) {
    msgElem.style.display = 'block';
    msgElem.style.background = 'rgba(239, 68, 68, 0.1)';
    msgElem.style.border = '1px solid rgba(239, 68, 68, 0.2)';
    msgElem.style.color = 'var(--danger)';
    msgElem.innerText = 'Failed to update profile.';
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerText = 'Save Settings';
  }
}
