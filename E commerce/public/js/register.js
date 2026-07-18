document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('register-form');
  const msg = document.getElementById('register-message');
  const btn = document.getElementById('register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-message';
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const { token, user } = await api.register({ name, email, password });
      setSession(token, user);
      showToast(`Welcome, ${user.name.split(' ')[0]}.`);
      window.location.href = 'index.html';
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'form-message error show';
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  });
});
