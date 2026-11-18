// utils/SessionHelper.js
import Cookies from 'js-cookie';

// ============ TOKEN MANAGEMENT ============
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    // Cookie তে রাখুন (SSR-এর জন্য)
    Cookies.set('authToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('authToken', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Read every key the various login flows may have stored the token under.
    // Email/password login + OTP verify store 'token'/'auth_token'; Google login
    // and setAuthToken() store 'authToken'. Reading all of them keeps auth
    // working no matter which flow signed the user in.
    return (
      Cookies.get('authToken') ||
      Cookies.get('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('auth_token') ||
      null
    );
  }
  return null;
};

// ============ EMAIL MANAGEMENT ============
export const setEmail = (email) => {
  if (typeof window !== 'undefined') {
    Cookies.set('email', email, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('email') || localStorage.getItem('email');
  }
  return null;
};

// ============ OTP MANAGEMENT ============
export const setOTP = (otp) => {
  if (typeof window !== 'undefined') {
    Cookies.set('otp', otp, {
      expires: 1 / 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('otp', otp);
  }
};

export const getOTP = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('otp') || localStorage.getItem('otp');
  }
  return null;
};

// ============ USER DETAILS MANAGEMENT ============
export const setUserDetails = (user) => {
  if (typeof window !== 'undefined') {
    const userStr = JSON.stringify(user);
    Cookies.set('userDetails', userStr, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    Cookies.set('user', userStr, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('userDetails', userStr);
    localStorage.setItem('user', userStr);
  }
};

export const getUserDetails = () => {
  if (typeof window !== 'undefined') {
    const userStr = Cookies.get('userDetails') || localStorage.getItem('userDetails') || Cookies.get('user') || localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user details:', e);
        return null;
      }
    }
  }
  return null;
};

const clearSessionData = () => {
  if (typeof window !== 'undefined') {
    ['authToken', 'token', 'user', 'userDetails', 'email', 'otp'].forEach((name) => {
      Cookies.remove(name, { path: '/' });
      Cookies.remove(name, { path: '/auth' });
      Cookies.remove(name);
      localStorage.removeItem(name);
    });
    ['auth_token', 'user_details'].forEach((name) => localStorage.removeItem(name));
    window.dispatchEvent(new Event('authChange'));
  }
};

// ============ SESSION CLEAR ============
export const clearAllSessions = clearSessionData;

// ============ LOGOUT ============
export const logout = clearSessionData;

export const expireSession = () => {
  const hadToken = Boolean(getAuthToken());
  clearSessionData();
  if (hadToken && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sessionExpired'));
  }
};

// ============ CHECK AUTHENTICATION ============
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    return !!token;
  }
  return false;
};
