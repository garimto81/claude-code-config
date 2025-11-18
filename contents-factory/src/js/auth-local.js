// Photo Factory - Local Authentication Module
// Replaces Supabase Auth with local PIN/password (RxDB)

import { usersAPI } from './rxdb-api.js';

/**
 * Current user session (in-memory)
 */
let currentUser = null;

/**
 * Load user from localStorage
 */
function loadUserSession() {
  try {
    const sessionData = localStorage.getItem('photoFactory_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);

      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - session.timestamp;
      if (sessionAge < 24 * 60 * 60 * 1000) {
        currentUser = session.user;
        console.log('✅ Session restored:', currentUser.email);
        return currentUser;
      } else {
        console.warn('⚠️ Session expired, clearing...');
        localStorage.removeItem('photoFactory_session');
      }
    }
  } catch (error) {
    console.error('❌ Failed to load session:', error);
  }

  return null;
}

/**
 * Save user session to localStorage
 * @param {Object} user
 */
function saveUserSession(user) {
  try {
    const session = {
      user: user,
      timestamp: Date.now()
    };

    localStorage.setItem('photoFactory_session', JSON.stringify(session));
    console.log('💾 Session saved');
  } catch (error) {
    console.error('❌ Failed to save session:', error);
  }
}

/**
 * Clear user session
 */
function clearUserSession() {
  localStorage.removeItem('photoFactory_session');
  currentUser = null;
  console.log('🗑️ Session cleared');
}

/**
 * Sign up new user (local)
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function signUp(email, password, displayName = '') {
  try {
    // Check if user already exists
    const existing = await usersAPI.getByEmail(email);
    if (existing.data) {
      return {
        success: false,
        error: '이미 존재하는 이메일입니다.'
      };
    }

    // Hash password (simple, use bcrypt in production)
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await usersAPI.create({
      email: email,
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
      avatar_url: generateAvatarUrl(email)
    });

    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }

    const user = result.data;

    // Sign in automatically
    currentUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    };

    saveUserSession(currentUser);

    console.log('✅ User signed up:', user.email);

    return {
      success: true,
      user: currentUser
    };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sign in user (local)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function signIn(email, password) {
  try {
    // Find user
    const result = await usersAPI.getByEmail(email);

    if (!result.data) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }

    const user = result.data;

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return {
        success: false,
        error: '비밀번호가 일치하지 않습니다.'
      };
    }

    // Create session
    currentUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    };

    saveUserSession(currentUser);

    console.log('✅ User signed in:', user.email);

    return {
      success: true,
      user: currentUser
    };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sign out user
 * @returns {Promise<{success: boolean}>}
 */
export async function signOut() {
  clearUserSession();
  console.log('✅ User signed out');

  return {
    success: true
  };
}

/**
 * Get current user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  if (!currentUser) {
    currentUser = loadUserSession();
  }

  return currentUser;
}

/**
 * Require authentication (redirect if not logged in)
 * @param {string} redirectTo
 * @returns {Promise<Object|null>}
 */
export async function requireAuth(redirectTo = '/index.html') {
  const user = await getCurrentUser();

  if (!user) {
    console.warn('⚠️ Authentication required, redirecting...');
    window.location.href = redirectTo;
    return null;
  }

  return user;
}

/**
 * Display user profile in UI
 * @param {string} elementId
 */
export async function displayUserProfile(elementId = 'userProfile') {
  const user = await getCurrentUser();
  const element = document.getElementById(elementId);

  if (!element) return;

  if (user) {
    element.innerHTML = `
      <div class="user-profile d-flex align-items-center">
        <img src="${user.avatar_url}"
             alt="${user.display_name}"
             class="rounded-circle me-2"
             width="32" height="32"
             onerror="this.src='/assets/default-avatar.png'">
        <span class="me-3">${user.display_name}</span>
        <button onclick="handleSignOut()" class="btn btn-sm btn-outline-secondary">
          로그아웃
        </button>
      </div>
    `;
  } else {
    element.innerHTML = `
      <button onclick="window.location.href='/index.html'" class="btn btn-primary">
        로그인
      </button>
    `;
  }
}

/**
 * Hash password (simple SHA-256)
 * In production, use bcrypt or similar
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate avatar URL from email
 * @param {string} email
 * @returns {string}
 */
function generateAvatarUrl(email) {
  // Use Gravatar or generate default
  const hash = email.toLowerCase().trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=667eea&color=fff&size=128`;
}

/**
 * Check if default user exists, create if not
 */
export async function ensureDefaultUser() {
  try {
    const users = await usersAPI.getAll();

    if (users.data.length === 0) {
      console.log('📝 Creating default user...');

      const result = await signUp(
        'admin@photo-factory.local',
        'admin123',
        '관리자'
      );

      if (result.success) {
        console.log('✅ Default user created: admin@photo-factory.local / admin123');
        alert('기본 계정이 생성되었습니다.\n\n이메일: admin@photo-factory.local\n비밀번호: admin123\n\n보안을 위해 비밀번호를 변경하세요!');
      }
    }
  } catch (error) {
    console.error('❌ Failed to create default user:', error);
  }
}

// Global helpers for HTML onclick
window.handleSignIn = async () => {
  const email = prompt('이메일을 입력하세요:', 'admin@photo-factory.local');
  if (!email) return;

  const password = prompt('비밀번호를 입력하세요:', 'admin123');
  if (!password) return;

  const result = await signIn(email, password);

  if (result.success) {
    alert('로그인 성공!');
    window.location.href = '/upload.html';
  } else {
    alert('로그인 실패: ' + result.error);
  }
};

window.handleSignOut = async () => {
  await signOut();
  alert('로그아웃되었습니다.');
  window.location.href = '/index.html';
};

window.handleSignUp = async () => {
  const email = prompt('이메일을 입력하세요:');
  if (!email) return;

  const password = prompt('비밀번호를 입력하세요:');
  if (!password) return;

  const displayName = prompt('이름을 입력하세요:', email.split('@')[0]);

  const result = await signUp(email, password, displayName);

  if (result.success) {
    alert('회원가입 성공! 자동 로그인됩니다.');
    window.location.href = '/upload.html';
  } else {
    alert('회원가입 실패: ' + result.error);
  }
};

// Auto-load session on module load
loadUserSession();

// Ensure default user exists
ensureDefaultUser();

console.log('🔐 Local authentication module loaded');
