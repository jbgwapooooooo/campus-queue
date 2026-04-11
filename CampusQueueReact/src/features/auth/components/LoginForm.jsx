import React from 'react';

/**
 * Vertical Slice: Auth (Authentication feature)
 * Contains everything specific to user authentication.
 */
export const LoginForm = ({ onLogin }) => {
  return (
    <div className="login-wrap page active">
      <div className="brand-panel">
        <div className="bp-logo">
          <div className="bp-icon">🎓</div>
          <div>
            <div className="bp-name">Campus Queue</div>
            <div className="bp-tag">CIT Queue Management</div>
          </div>
        </div>
        <div className="bp-hero">
          <div className="bp-big">Q</div>
          <div className="bp-line1">No more<br/><span className="bp-line2">waiting around.</span></div>
          <div className="bp-powered">Powered by React</div>
        </div>
      </div>
      
      <div className="form-panel">
        <div className="form-inner">
          <div className="form-eyebrow">Student Portal</div>
          <div className="form-h1">Welcome<br/>back.</div>
          <div className="form-sub">Sign in to access CIT services</div>
          
          <div className="field">
            <label>Email address</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input type="email" placeholder="your.email@cit.edu" />
            </div>
          </div>
          
          <div className="field">
            <label>Password</label>
            <div className="field-wrap">
              <span className="field-icon">🔒</span>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>
          
          <button className="btn-main" onClick={onLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
};
