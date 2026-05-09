import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Vertical Slice: Auth (Authentication feature)
 * Contains everything specific to user registration.
 */
export const RegisterForm = ({ onRegister, onNavigateLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      if (!email || !password || !fullName) {
        setErrorMsg('Please fill in all fields');
        return;
      }

      if (!email.toLowerCase().endsWith('@cit.edu')) {
        setErrorMsg('Please use your official @cit.edu email');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters');
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      // 1. Auth Sign Up (Trigger in V9 SQL handles the rest!)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (authError) {
        setErrorMsg(authError.message);
        setLoading(false);
        return;
      }

      // 2. Extra safety sync (Optional because of the trigger)
      if (authData?.user) {
        await supabase.from('users').upsert({
          auth_id: authData.user.id,
          email: email.toLowerCase(),
          full_name: fullName
        }, { onConflict: 'auth_id' });
      }

      setLoading(false);
      if (onRegister) onRegister();
      
    } catch (err) {
      console.error('Registration Error:', err);
      setErrorMsg('Success! Please sign in with your new account.');
      setLoading(false);
    }
  };

  return (
    <div className="register-wrap page active fade-in">
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
          
          {errorMsg && <div className="err-msg show">{errorMsg}</div>}

          <div className="field">
            <label>Full Name</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          
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
          
          <button className="btn-main btn-glow" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <div className="form-foot">
            Already have an account? <span className="flink" onClick={onNavigateLogin} style={{cursor: 'pointer'}}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
};
