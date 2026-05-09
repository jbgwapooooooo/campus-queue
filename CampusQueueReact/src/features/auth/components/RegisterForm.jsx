import React from 'react';

/**
 * Vertical Slice: Auth (Authentication feature)
 * Contains everything specific to user registration.
 */
export const RegisterForm = ({ onRegister, onNavigateLogin }) => {
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
          <div className="bp-line1">Join the<br/><span className="bp-line2">fast lane.</span></div>
          <div className="bp-powered">Powered by React</div>
        </div>
      </div>
      
      <div className="form-panel">
        <div className="form-inner slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="form-eyebrow">Student Portal</div>
          <div className="form-h1">Create<br/>Account.</div>
          <div className="form-sub">Sign up to access CIT services</div>
          
          <div className="field">
            <label>Full Name</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input type="text" placeholder="John Doe" />
            </div>
          </div>
          
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
          
          <button className="btn-main btn-glow" onClick={onRegister}>Sign Up</button>
          
          <div className="form-foot">
            Already have an account? <span className="flink" onClick={onNavigateLogin} style={{cursor: 'pointer'}}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
};
