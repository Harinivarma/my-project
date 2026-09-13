import { apiFetch } from './api.js';
import { setAuth, getDashboardLink } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorAlert = document.getElementById('error-alert');
  const errorText = document.getElementById('error-text');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      errorAlert.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Signing In...';

      try {
        const responseData = await apiFetch('/auth/login', {
          method: 'POST',
          body: { email, password }
        });

        const { token, name, role } = responseData;

        setAuth(token, { name, email, role });

        const redirectUrl = getDashboardLink();
        window.location.href = redirectUrl;
      } catch (err) {
        errorText.innerText = err.data || err.message || 'Invalid email or password. Please try again.';
        errorAlert.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In';
      }
    });
  }
});
