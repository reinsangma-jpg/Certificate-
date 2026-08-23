/*
 * Supabase authentication for the NSS Certificate Portal.
 *
 * This file only ever uses the Supabase "anon public" key (loaded from
 * js/config.js). That key is *designed* to sit in client-side code — it
 * cannot read or write anything unless your Row Level Security (RLS)
 * policies in Supabase allow it (see supabase/schema.sql). The secret that
 * must NEVER appear here, in config.js, or anywhere in this repo is the
 * "service_role" key — that one bypasses RLS entirely and belongs only in a
 * trusted server environment (see README.md).
 */
(function () {
  'use strict';

  var cfg = window.APP_CONFIG || {};
  var configured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    cfg.SUPABASE_URL.indexOf('__') !== 0 &&
    cfg.SUPABASE_ANON_KEY.indexOf('__') !== 0;

  var sb = null;
  if (configured && window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  }

  function $(id) { return document.getElementById(id); }

  function showOnly(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('active');
    });
    var el = $(id);
    if (el) el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setAuthMsg(kind, title, text) {
    var box = $('authMsg');
    if (!box) return;
    var cls = kind === 'error' ? 'error' : 'success';
    box.innerHTML =
      '<div class="' + cls + '"><strong>' + title + '</strong>' + text + '</div>';
  }

  function clearAuthMsg() {
    var box = $('authMsg');
    if (box) box.innerHTML = '';
  }

  function setLoading(isLoading) {
    var btn = $('authSubmitBtn');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.classList.toggle('loading', isLoading);
  }

  var mode = 'login'; // or 'signup'

  function applyMode() {
    var loginTab = $('loginTabBtn');
    var signupTab = $('signupTabBtn');
    var submitBtn = $('authSubmitBtn');
    var pwField = $('authPassword');
    var resetBtn = $('authResetBtn');
    if (!loginTab || !signupTab || !submitBtn) return;

    loginTab.classList.toggle('active', mode === 'login');
    signupTab.classList.toggle('active', mode === 'signup');
    // preserve spinner span, just change trailing text via textContent on a wrapper
    submitBtn.childNodes[submitBtn.childNodes.length - 1].textContent =
      mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT';
    pwField.setAttribute(
      'autocomplete',
      mode === 'login' ? 'current-password' : 'new-password'
    );
    resetBtn.classList.add('hidden');
    clearAuthMsg();
  }

  function requireClient() {
    if (sb) return true;
    setAuthMsg(
      'error',
      'Not Connected',
      'This site is not yet connected to Supabase. If you are the site owner, see README.md — you need to add SUPABASE_URL and SUPABASE_ANON_KEY as GitHub repository secrets and redeploy.'
    );
    return false;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit() {
    if (!requireClient()) return;
    clearAuthMsg();

    var email = ($('authEmail').value || '').trim();
    var password = $('authPassword').value || '';

    if (!isValidEmail(email)) {
      setAuthMsg('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setAuthMsg('error', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        var { data, error } = await sb.auth.signUp({ email: email, password: password });
        if (error) throw error;
        if (data && data.session) {
          onSignedIn();
        } else {
          setAuthMsg(
            'success',
            'Check Your Inbox',
            'We sent a confirmation link to ' + email + '. Confirm your email, then log in.'
          );
          mode = 'login';
          applyMode();
        }
      } else {
        var res = await sb.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        onSignedIn();
      }
    } catch (err) {
      setAuthMsg('error', 'Sign-In Error', escapeMsg(err && err.message ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!requireClient()) return;
    var email = ($('authEmail').value || '').trim();
    if (!isValidEmail(email)) {
      setAuthMsg('error', 'Email Needed', 'Enter your email above first, then tap this link again.');
      return;
    }
    try {
      var { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      setAuthMsg(
        'success',
        'Reset Email Sent',
        'Check ' + email + ' for a password reset link.'
      );
    } catch (err) {
      setAuthMsg('error', 'Could Not Send Reset Email', escapeMsg(err && err.message ? err.message : String(err)));
    }
  }

  function escapeMsg(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
    });
  }

  function onSignedIn() {
    clearAuthMsg();
    var signOutBtn = $('signOutBtn');
    if (signOutBtn) signOutBtn.classList.remove('hidden');
    // Only redirect away from the auth screen if we're currently on it —
    // avoids yanking the user mid-flow on token refreshes.
    var authScreen = $('authScreen');
    if (authScreen && authScreen.classList.contains('active')) {
      showOnly('welcomeScreen');
    }
  }

  function onSignedOut() {
    var signOutBtn = $('signOutBtn');
    if (signOutBtn) signOutBtn.classList.add('hidden');
    showOnly('authScreen');
  }

  function wireUpUI() {
    var loginTab = $('loginTabBtn');
    var signupTab = $('signupTabBtn');
    var submitBtn = $('authSubmitBtn');
    var resetBtn = $('authResetBtn');
    var forgotBtn = $('forgotPasswordBtn');
    var signOutBtn = $('signOutBtn');
    var pwField = $('authPassword');

    if (loginTab) loginTab.onclick = function () { mode = 'login'; applyMode(); };
    if (signupTab) signupTab.onclick = function () { mode = 'signup'; applyMode(); };
    if (submitBtn) submitBtn.onclick = handleSubmit;
    if (pwField) pwField.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSubmit();
    });
    if (forgotBtn) forgotBtn.onclick = handleForgotPassword;
    if (resetBtn) resetBtn.onclick = handleForgotPassword;
    if (signOutBtn) {
      signOutBtn.onclick = async function () {
        if (!sb) return;
        await sb.auth.signOut();
      };
    }
  }

  async function init() {
    wireUpUI();
    applyMode();

    if (!sb) {
      // No credentials wired up yet — leave the auth screen visible with a
      // clear message rather than silently failing.
      requireClient();
      return;
    }

    sb.auth.onAuthStateChange(function (event, session) {
      if (session) {
        onSignedIn();
      } else {
        onSignedOut();
      }
    });

    var { data } = await sb.auth.getSession();
    if (data && data.session) {
      onSignedIn();
    } else {
      showOnly('authScreen');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
