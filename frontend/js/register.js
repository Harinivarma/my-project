import { apiFetch } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorAlert = document.getElementById('error-alert');
  const errorText = document.getElementById('error-text');
  const successAlert = document.getElementById('success-alert');
  const successText = document.getElementById('success-text');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating Account...';

      try {
        await apiFetch('/auth/register', {
          method: 'POST',
          body: { name, email, password, role }
        });

        successText.innerText = 'Account created successfully! Redirecting to login...';
        successAlert.style.display = 'block';

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1800);
      } catch (err) {
        errorText.innerText = err.data || err.message || 'Failed to create account. Email might be in use.';
        errorAlert.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign Up';
      }
    });
  }
});
