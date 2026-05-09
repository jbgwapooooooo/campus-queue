import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Vertical Slice: Auth (Authentication feature)
 * Contains everything specific to user authentication.
 */
export const LoginForm = ({ onLogin, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Success will trigger onAuthStateChange in App.jsx,
      // but we can still call onLogin just in case, though it might be redundant.
      setLoading(false);
      if (onLogin) onLogin();
    }
  };

  return (
    <div className="login-wrap page active fade-in">
      <div className="brand-panel">
        <div className="bp-logo slide-up">
          <div className="bp-icon pulse-soft">🎓</div>
          <div>
            <div className="bp-name">Campus Queue</div>
            <div className="bp-tag">CIT Queue Management</div>
          </div>
        </div>
        <div className="bp-hero slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bp-big pop-in">Q</div>
          <div className="bp-line1">No more<br/><span className="bp-line2">waiting around.</span></div>
          <div className="bp-powered">Powered by React</div>
        </div>
      </div>
      
      <div className="form-panel">
        <div className="form-inner slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="form-eyebrow">Student Portal</div>
          <div className="form-h1">Welcome<br/>back.</div>
          <div className="form-sub">Sign in to access CIT services</div>
          
          {errorMsg && <div className="err-msg show">{errorMsg}</div>}

          <div className="field">
            <label>Email address</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input 
                type="email" 
                placeholder="your.email@cit.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="field">
            <label>Password</label>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button className="btn-main btn-glow" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="form-foot">
            Don't have an account? <span className="flink" onClick={onNavigateRegister} style={{cursor: 'pointer'}}>Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
};
