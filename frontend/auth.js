let authMode = 'login';

async function handleAuth() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const name     = document.getElementById('full-name').value.trim();

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  setLoading(true);

  // DEMO MODE — no Supabase needed
  if (!isConfigured) {
    await delay(700);
    
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '{}');
    
    if (authMode === 'signup') {
      if (demoUsers[email]) {
        showError('Account with this email already exists');
      } else {
        demoUsers[email] = { password, name };
        localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
        
        showToast('Account created successfully!', '🎉', 'Welcome');
        switchTab('login');
      }
    } else {
      if (email === 'student@cit.edu' && password === 'demo123') {
        currentUser = { email, user_metadata: { full_name: 'Student' }, id: 'demo123' };
        goHome();
      } else if (demoUsers[email] && demoUsers[email].password === password) {
        currentUser = { email, user_metadata: { full_name: demoUsers[email].name || 'User' }, id: email };
        goHome();
      } else {
        showError('Invalid email or password');
      }
    }
    
    setLoading(false);
    return;
  }

  // Make sure Supabase is ready before using it
  if (!initSupabase()) {
    showError('Supabase is not ready. Check your config.js credentials.');
    setLoading(false);
    return;
  }

  try {
    let result;

    if (authMode === 'login') {
      result = await sb.auth.signInWithPassword({ email, password });
    } else {
      result = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
    }

    if (result.error) {
      showError(result.error.message);
      return;
    }

    currentUser = result.data.user;

    if (authMode === 'signup') {
      showToast('Check your email to confirm your account', '📧', 'Account created!');
      switchTab('login');
    } else {
      goHome();
    }

  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleGoogle() {
  if (!initSupabase()) {
    showToast('Check your config.js credentials', 'ℹ️', 'Not configured');
    return;
  }
  await sb.auth.signInWithOAuth({ provider: 'google' });
}

async function handleGithub() {
  if (!initSupabase()) {
    showToast('Check your config.js credentials', 'ℹ️', 'Not configured');
    return;
  }
  await sb.auth.signInWithOAuth({ provider: 'github' });
}

async function handleLogout() {
  if (realtimeSub) await sb?.removeChannel(realtimeSub);
  if (sb) await sb.auth.signOut();
  currentUser  = null;
  myQueueEntry = null;
  showPage('login');
  showToast('Signed out successfully', '👋', 'Goodbye');
}

async function checkSession() {
  if (!initSupabase()) return;

  try {
    const { data } = await sb.auth.getSession();
    if (data.session?.user) {
      currentUser = data.session.user;
      goHome();
    }
  } catch (err) {
    console.error('Session check failed:', err.message);
  }
}

function switchTab(mode) {
  authMode = mode;
  const isLogin = mode === 'login';

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', isLogin ? i === 0 : i === 1);
  });

  document.getElementById('form-heading').innerHTML =
      isLogin ? 'Welcome<br>back.' : 'Create<br>account.';
  document.getElementById('form-sub').textContent =
      isLogin ? 'Sign in to access CIT services' : 'Join Campus Queue for free';
  document.getElementById('field-name').style.display  = isLogin ? 'none'  : 'block';
  document.getElementById('extras-row').style.display  = isLogin ? 'flex'  : 'none';
  document.getElementById('auth-btn-text').textContent = isLogin ? 'Sign In' : 'Create Account';
  document.getElementById('switch-text').textContent   = isLogin ? "Don't have an account?" : 'Already have an account?';

  const link = document.getElementById('switch-link');
  link.textContent = isLogin ? ' Sign up free' : ' Sign in';
  link.onclick = () => switchTab(isLogin ? 'signup' : 'login');

  hideError();
}

function showError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.classList.add('show');
}
function hideError() {
  document.getElementById('auth-error').classList.remove('show');
}
function setLoading(on) {
  document.getElementById('auth-btn').disabled = on;
  document.getElementById('auth-btn-text').style.display = on ? 'none'   : 'inline';
  document.getElementById('auth-spinner').style.display  = on ? 'inline' : 'none';
}
function togglePw() {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleAuth();
  });
});