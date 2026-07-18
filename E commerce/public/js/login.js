function getNextUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('next') || 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = getNextUrl();
    return;
  }

  const form = document.getElementById('login-form');
  const msg = document.getElementById('login-message');
  const btn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-message';
    btn.disabled = true;
    btn.textContent = 'Logging in…';

    try {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const { token, user } = await api.login({ email, password });
      setSession(token, user);
      showToast(`Welcome back, ${user.name.split(' ')[0]}.`);
      window.location.href = getNextUrl();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'form-message error show';
      btn.disabled = false;
      btn.textContent = 'Log in';
    }
  });
});
